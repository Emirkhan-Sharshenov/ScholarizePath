// Imports a batch of researched universities/scholarships, and fills empty
// fields on existing documents. Dry run by default.
//
//   node --env-file=.env.local scripts/db/import.mjs <batch-dir>             # preview
//   node --env-file=.env.local scripts/db/import.mjs <batch-dir> --apply     # write
//   node --env-file=.env.local scripts/db/import.mjs <batch-dir> --rollback  # undo that batch
//
// Targets MONGODB_URI (the staging copy). Add --prod to target PROD_MONGODB_URI
// instead; --prod still needs --apply/--rollback to change anything.
//
// <batch-dir> contains any of:
//   universities.json  — new university documents (full shape, unknowns null)
//   scholarships.json  — new scholarship documents
//   patches.json       — [{ collection, _id, set: { "dotted.path": value }, source }]
//   corrections.json   — same shape plus "reason"; may overwrite wrong values
//                        (previous values are logged so --rollback restores them)
//   archive.json       — [{ collection, _id, reason, source }] for closed/merged
//                        institutions; moved to "<collection>_archived", restorable
//
// Safety rules:
//   - New documents are skipped if the _id or the same name+country already exists.
//   - Patches only fill fields that are currently missing/empty — never overwrite.
//   - Everything written is tagged with the batch name (importBatch on new docs,
//     an import_log entry per patch), which is what --rollback uses.
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import mongoose from "mongoose";

const args = process.argv.slice(2);
const batchDir = args.find((a) => !a.startsWith("--"));
const APPLY = args.includes("--apply");
const ROLLBACK = args.includes("--rollback");
const PROD = args.includes("--prod");

if (!batchDir) {
    console.error("Usage: import.mjs <batch-dir> [--apply | --rollback] [--prod]");
    process.exit(1);
}

const batch = path.basename(path.resolve(batchDir));
const rawUri = PROD ? process.env.PROD_MONGODB_URI : process.env.MONGODB_URI;
const uri = rawUri?.trim().replace(/^MONGODB_URI=/, "");
if (!uri) {
    console.error(`${PROD ? "PROD_MONGODB_URI" : "MONGODB_URI"} is not set (see .env.local).`);
    process.exit(1);
}

const readJson = (file) => {
    const full = path.join(batchDir, file);
    return existsSync(full) ? JSON.parse(readFileSync(full, "utf8")) : [];
};

const isEmpty = (v) =>
    v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);

const getPath = (doc, dotted) => dotted.split(".").reduce((o, k) => (o == null ? undefined : o[k]), doc);

const NAME_FIELD = { universities: "name", scholarships: "scholarshipName" };
const COUNTRY_FIELD = { universities: "location.country", scholarships: "country" };

await mongoose.connect(uri);
const db = mongoose.connection.db;
const log = db.collection("import_log");
console.log(`Database "${db.databaseName}" · batch "${batch}" · ${ROLLBACK ? "ROLLBACK" : APPLY ? "APPLY" : "dry run"}\n`);

if (ROLLBACK) {
    for (const collection of ["universities", "scholarships"]) {
        const n = await db.collection(collection).countDocuments({ importBatch: batch });
        console.log(`${collection}: ${n} documents from this batch`);
        if (APPLY || ROLLBACK) await db.collection(collection).deleteMany({ importBatch: batch });
    }
    const patches = await log.find({ batch, kind: "patch" }).toArray();
    for (const p of patches) {
        await db.collection(p.collection).updateOne(
            { _id: p.docId },
            { $unset: Object.fromEntries(p.fields.map((f) => [f, ""])) }
        );
    }
    // Corrections stored the previous values — put them back (or remove the
    // field again if it didn't exist before).
    const corrections = await log.find({ batch, kind: "correction" }).toArray();
    const restoreOps = { universities: [], scholarships: [] };
    for (const c of corrections) {
        const restore = Object.entries(c.before).filter(([, v]) => v !== undefined && v !== null);
        const remove = Object.entries(c.before).filter(([, v]) => v === undefined || v === null).map(([f]) => f);
        const update = {};
        if (restore.length) update.$set = Object.fromEntries(restore);
        if (remove.length) update.$unset = Object.fromEntries(remove.map((f) => [f, ""]));
        if (Object.keys(update).length) restoreOps[c.collection].push({ updateOne: { filter: { _id: c.docId }, update } });
    }
    for (const [collection, ops] of Object.entries(restoreOps)) {
        if (ops.length) await db.collection(collection).bulkWrite(ops, { ordered: false });
    }
    const archivedEntries = await log.find({ batch, kind: "archive" }).toArray();
    for (const a of archivedEntries) {
        await db.collection(a.collection).replaceOne({ _id: a.docId }, a.doc, { upsert: true });
        await db.collection(`${a.collection}_archived`).deleteOne({ _id: a.docId });
    }
    await log.deleteMany({ batch });
    console.log(`patches undone: ${patches.length}, corrections undone: ${corrections.length}, archived restored: ${archivedEntries.length}`);
    await mongoose.disconnect();
    process.exit(0);
}

const now = new Date();
let inserted = 0;
let skipped = 0;

for (const collection of ["universities", "scholarships"]) {
    const docs = readJson(`${collection}.json`);
    if (!docs.length) continue;
    console.log(`── ${collection}: ${docs.length} in batch`);

    for (const doc of docs) {
        const name = getPath(doc, NAME_FIELD[collection]);
        const country = getPath(doc, COUNTRY_FIELD[collection]);
        const existing = await db.collection(collection).findOne({
            $or: [{ _id: doc._id }, { [NAME_FIELD[collection]]: name, [COUNTRY_FIELD[collection]]: country }],
        });

        if (existing) {
            skipped++;
            console.log(`   skip  ${doc._id}  (already exists as ${existing._id})`);
            continue;
        }

        console.log(`   add   ${doc._id}  ${name} — ${country}`);
        if (APPLY) {
            await db.collection(collection).insertOne({ ...doc, importBatch: batch, createdAt: now, updatedAt: now });
        }
        inserted++;
    }
}

const patches = readJson("patches.json");
let patched = 0;
if (patches.length) console.log(`── patches: ${patches.length} in batch`);

for (const p of patches) {
    const doc = await db.collection(p.collection).findOne({ _id: p._id });
    if (!doc) {
        console.log(`   miss  ${p.collection}/${p._id} (not found)`);
        continue;
    }

    const fields = Object.entries(p.set).filter(([f]) => isEmpty(getPath(doc, f)));
    if (!fields.length) {
        console.log(`   keep  ${p.collection}/${p._id} (already filled)`);
        continue;
    }

    console.log(`   fill  ${p.collection}/${p._id}: ${fields.map(([f, v]) => `${f}=${JSON.stringify(v)}`).join(", ")}`);
    if (APPLY) {
        await db.collection(p.collection).updateOne(
            { _id: p._id },
            { $set: { ...Object.fromEntries(fields), updatedAt: now } }
        );
        await log.insertOne({
            batch,
            kind: "patch",
            collection: p.collection,
            docId: p._id,
            fields: fields.map(([f]) => f),
            source: p.source,
            at: now,
        });
    }
    patched++;
}

// Corrections replace values that are known to be wrong, citing a source.
// Unlike patches they may overwrite; the previous values go to import_log so
// --rollback can restore them. `set` values of null clear a field.
const corrections = readJson("corrections.json");
let corrected = 0;
if (corrections.length) console.log(`── corrections: ${corrections.length} in batch`);

// Loaded and written in bulk — a batch can touch every document in a
// collection, and one round trip per document to Atlas is far too slow.
const VERBOSE_LIMIT = 40;
for (const collection of ["universities", "scholarships"]) {
    const mine = corrections.filter((c) => c.collection === collection);
    if (!mine.length) continue;

    const docs = await db.collection(collection).find({ _id: { $in: mine.map((c) => c._id) } }).toArray();
    const byId = new Map(docs.map((d) => [d._id, d]));
    const updates = [];
    const logEntries = [];

    for (const c of mine) {
        const doc = byId.get(c._id);
        if (!doc) {
            console.log(`   miss  ${collection}/${c._id} (not found)`);
            continue;
        }

        const changes = Object.entries(c.set).filter(([f, v]) => JSON.stringify(getPath(doc, f)) !== JSON.stringify(v));
        if (!changes.length) continue;

        if (corrected < VERBOSE_LIMIT) {
            console.log(`   fix   ${collection}/${c._id}: ${changes.map(([f, v]) => `${f}: ${JSON.stringify(getPath(doc, f))} → ${JSON.stringify(v)}`).join(", ")}`);
        }
        updates.push({ updateOne: { filter: { _id: c._id }, update: { $set: { ...Object.fromEntries(changes), updatedAt: now } } } });
        logEntries.push({
            batch,
            kind: "correction",
            collection,
            docId: c._id,
            before: Object.fromEntries(changes.map(([f]) => [f, getPath(doc, f) ?? null])),
            after: Object.fromEntries(changes),
            reason: c.reason,
            source: c.source,
            at: now,
        });
        corrected++;
    }

    if (APPLY && updates.length) {
        // Log first: if the write is interrupted, --rollback still knows the old values.
        await log.insertMany(logEntries, { ordered: false });
        await db.collection(collection).bulkWrite(updates, { ordered: false });
    }
}
if (corrected > VERBOSE_LIMIT) console.log(`   … and ${corrected - VERBOSE_LIMIT} more`);

// Archive: institutions that closed or merged. Never deleted outright — the
// document moves to "<collection>_archived" (and into import_log), so
// --rollback can put it back.
const archive = readJson("archive.json");
let archived = 0;
if (archive.length) console.log(`── archive: ${archive.length} in batch`);

for (const a of archive) {
    const doc = await db.collection(a.collection).findOne({ _id: a._id });
    if (!doc) {
        console.log(`   miss  ${a.collection}/${a._id} (not found or already archived)`);
        continue;
    }
    console.log(`   archive ${a.collection}/${a._id}  ${doc.name ?? doc.scholarshipName} — ${a.reason}`);
    if (APPLY) {
        await log.insertOne({ batch, kind: "archive", collection: a.collection, docId: a._id, doc, reason: a.reason, source: a.source, at: now });
        await db.collection(`${a.collection}_archived`).insertOne({ ...doc, archivedAt: now, archiveReason: a.reason, archiveSource: a.source, archiveBatch: batch });
        await db.collection(a.collection).deleteOne({ _id: a._id });
    }
    archived++;
}

console.log(`\n${APPLY ? "Done" : "Would do"}: ${inserted} added, ${skipped} skipped, ${patched} patched, ${corrected} corrected, ${archived} archived.`);
if (!APPLY) console.log("Nothing was written. Re-run with --apply to write.");
await mongoose.disconnect();
