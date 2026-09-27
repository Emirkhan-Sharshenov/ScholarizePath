// Read-only overview of the universities/scholarships collections: counts per
// country, how often each field is filled in, and one sample document of each.
// Never writes anything.
//
//   node --env-file=.env.local scripts/db/inspect.mjs
//
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error("MONGODB_URI is not set. Put it in .env.local and run with --env-file=.env.local");
    process.exit(1);
}

// Collects every dotted field path used in the collection (one level of
// nesting is enough to see e.g. ranking.global vs ranking.qs) with the share
// of documents where it's filled in.
function fieldCoverage(docs) {
    const counts = new Map();
    const bump = (path) => counts.set(path, (counts.get(path) ?? 0) + 1);
    const isFilled = (v) => v !== null && v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0);

    for (const doc of docs) {
        for (const [key, value] of Object.entries(doc)) {
            if (!isFilled(value)) continue;
            bump(key);
            if (value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
                for (const [sub, subValue] of Object.entries(value)) {
                    if (isFilled(subValue)) bump(`${key}.${sub}`);
                }
            }
        }
    }

    return [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([path, n]) => `${String(Math.round((n / docs.length) * 100)).padStart(3)}%  ${path}`);
}

function truncate(doc) {
    return JSON.stringify(
        doc,
        (_, v) => (typeof v === "string" && v.length > 120 ? `${v.slice(0, 120)}…` : v),
        2
    );
}

await mongoose.connect(uri);
const db = mongoose.connection.db;
console.log(`Connected to database "${db.databaseName}"\n`);

for (const { name, countryPath } of [
    { name: "universities", countryPath: "$location.country" },
    { name: "scholarships", countryPath: "$country" },
]) {
    const collection = db.collection(name);
    const docs = await collection.find({}).toArray();
    console.log(`==================== ${name}: ${docs.length} documents`);

    const byCountry = await collection
        .aggregate([{ $group: { _id: countryPath, count: { $sum: 1 } } }, { $sort: { count: -1 } }])
        .toArray();
    console.log(`\nBy country (${byCountry.length}):`);
    console.log(byCountry.map((c) => `  ${c.count}\t${c._id ?? "(none)"}`).join("\n"));

    console.log("\nField coverage:");
    console.log(fieldCoverage(docs).map((l) => `  ${l}`).join("\n"));

    if (docs.length) {
        console.log("\nSample document:");
        console.log(truncate(docs[Math.floor(docs.length / 2)]));
    }
    console.log("\n");
}

await mongoose.disconnect();
