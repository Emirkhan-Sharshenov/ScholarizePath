// Copies the universities and scholarships collections from the production
// database into a separate "<name>_staging" database on the same cluster, so
// imports can be tried there first. Production is only read, never written.
//
// Expects PROD_MONGODB_URI in .env.local. After copying, adds
// MONGODB_URI=<staging URI> to .env.local (if MONGODB_URI isn't set yet), so
// the local dev server and the import script point at the copy by default.
//
//   node --env-file=.env.local scripts/db/copy-to-staging.mjs
//
// Connection strings are never printed — only database names.
import { readFileSync, appendFileSync } from "node:fs";
import mongoose from "mongoose";

const COLLECTIONS = ["universities", "scholarships"];
const ENV_FILE = ".env.local";

// Tolerates a pasted "MONGODB_URI=" left in front of the value.
const prodUri = process.env.PROD_MONGODB_URI?.trim().replace(/^MONGODB_URI=/, "");
if (!prodUri) {
    console.error(`PROD_MONGODB_URI is not set. Add it to ${ENV_FILE} and run with --env-file=${ENV_FILE}`);
    process.exit(1);
}

// mongodb+srv://user:pass@host/<dbName>?options — swap only the path segment.
let parsed;
try {
    parsed = new URL(prodUri);
} catch {
    // Deliberately not echoing the value — it contains the password.
    console.error(`PROD_MONGODB_URI in ${ENV_FILE} isn't a valid connection string.`);
    process.exit(1);
}
const prodDbName = decodeURIComponent(parsed.pathname.replace(/^\//, "")) || "test";
const stagingDbName = `${prodDbName}_staging`;
const stagingUrl = new URL(prodUri);
stagingUrl.pathname = `/${stagingDbName}`;
const stagingUri = stagingUrl.toString();

if (prodUri.includes("<db_password>")) {
    console.error(`${ENV_FILE}: replace <db_password> in PROD_MONGODB_URI with the real database user password first.`);
    process.exit(1);
}

const connection = await mongoose.createConnection(prodUri).asPromise();
const prodDb = connection.useDb(prodDbName, { useCache: false }).db;
const stagingDb = connection.useDb(stagingDbName, { useCache: false }).db;

// A URI without a database name falls back to "test" — make sure that's
// really where the site's data lives before copying anything.
if ((await prodDb.collection("universities").estimatedDocumentCount()) === 0) {
    const { databases } = await connection.db.admin().listDatabases({ nameOnly: true });
    const withUniversities = [];
    for (const { name } of databases) {
        const count = await connection.useDb(name, { useCache: false }).db.collection("universities").estimatedDocumentCount();
        if (count > 0) withUniversities.push(`${name} (${count} universities)`);
    }
    console.error(`"${prodDbName}" has no universities. Databases that do: ${withUniversities.join(", ") || "none found"}.`);
    console.error(`Put the right database name into PROD_MONGODB_URI (…mongodb.net/<name>?…) and run again.`);
    await connection.close();
    process.exit(1);
}

console.log(`Source: "${prodDbName}" → copy: "${stagingDbName}"\n`);

// Refuse to overwrite an existing copy — someone may already be testing on it.
for (const name of COLLECTIONS) {
    const existing = await stagingDb.collection(name).estimatedDocumentCount();
    if (existing > 0) {
        console.error(`"${stagingDbName}.${name}" already has ${existing} documents — not overwriting. Drop it first if you want a fresh copy.`);
        await connection.close();
        process.exit(1);
    }
}

for (const name of COLLECTIONS) {
    const docs = await prodDb.collection(name).find({}).toArray();
    if (docs.length) await stagingDb.collection(name).insertMany(docs, { ordered: false });

    // Same indexes as production (minus the default _id index).
    const indexes = (await prodDb.collection(name).indexes()).filter((ix) => ix.name !== "_id_");
    for (const index of indexes) {
        const { key, name: indexName, ...options } = index;
        delete options.v;
        delete options.ns;
        await stagingDb.collection(name).createIndex(key, { name: indexName, ...options });
    }

    console.log(`  ${name}: ${docs.length} documents, ${indexes.length} indexes copied`);
}

await connection.close();

const envContents = readFileSync(ENV_FILE, "utf8");
if (/^MONGODB_URI=/m.test(envContents)) {
    console.log(`\n${ENV_FILE} already has MONGODB_URI — left unchanged. Point it at "${stagingDbName}" to use the copy locally.`);
} else {
    appendFileSync(ENV_FILE, `${envContents.endsWith("\n") ? "" : "\n"}MONGODB_URI=${stagingUri}\n`);
    console.log(`\nAdded MONGODB_URI (→ "${stagingDbName}") to ${ENV_FILE}.`);
}
