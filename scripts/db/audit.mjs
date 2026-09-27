// Read-only data-quality audit of universities/scholarships. Prints counts of
// likely problems; never writes.
//
//   node --env-file=.env.local scripts/db/audit.mjs [--prod]
//
import mongoose from "mongoose";

const PROD = process.argv.includes("--prod");
const uri = (PROD ? process.env.PROD_MONGODB_URI : process.env.MONGODB_URI)?.trim().replace(/^MONGODB_URI=/, "");
if (!uri) {
    console.error("Connection string missing (see .env.local).");
    process.exit(1);
}

await mongoose.connect(uri);
const db = mongoose.connection.db;
const unis = await db.collection("universities").find({ importBatch: { $exists: false } }).toArray();
const schs = await db.collection("scholarships").find({ importBatch: { $exists: false } }).toArray();
const today = new Date().toISOString().slice(0, 10);
console.log(`Database "${db.databaseName}" — auditing ${unis.length} universities and ${schs.length} scholarships that were NOT added by the import script\n`);

const pct = (n, total) => `${n}/${total} (${Math.round((n / total) * 100)}%)`;

// 1. Two universities sharing the same national rank in the same country.
const byCountryRank = new Map();
for (const u of unis) {
    const r = u.ranking?.national;
    if (!r) continue;
    const key = `${u.location?.country}#${r}`;
    byCountryRank.set(key, [...(byCountryRank.get(key) ?? []), u.name]);
}
const rankClashes = [...byCountryRank.entries()].filter(([, names]) => names.length > 1);
console.log(`National rank shared by 2+ universities in the same country: ${rankClashes.length} cases`);
rankClashes.slice(0, 5).forEach(([k, n]) => console.log(`   ${k}: ${n.join(" | ")}`));

// 2. Same global rank used twice.
const byGlobal = new Map();
for (const u of unis) {
    const r = u.ranking?.global;
    if (r) byGlobal.set(r, [...(byGlobal.get(r) ?? []), u.name]);
}
const globalClashes = [...byGlobal.entries()].filter(([, n]) => n.length > 1);
console.log(`\nGlobal rank shared by 2+ universities: ${globalClashes.length} cases`);
globalClashes.slice(0, 5).forEach(([r, n]) => console.log(`   #${r}: ${n.join(" | ")}`));

// 3. Deadlines.
const uniDeadlines = unis.flatMap((u) => (u.applicationDeadlines ?? []).map((d) => String(d.date ?? "").slice(0, 10))).filter(Boolean);
const schDeadlines = schs.flatMap((s) => (s.deadlines ?? []).map((d) => String(d.date ?? "").slice(0, 10))).filter(Boolean);
console.log(`\nUniversity deadlines already passed: ${pct(uniDeadlines.filter((d) => d < today).length, uniDeadlines.length)}`);
const schAllPast = schs.filter((s) => (s.deadlines ?? []).length && (s.deadlines ?? []).every((d) => String(d.date).slice(0, 10) < today));
console.log(`Scholarships whose every deadline has passed (but status says "${schs[0]?.status}"): ${pct(schAllPast.length, schs.length)}`);
schAllPast.slice(0, 8).forEach((s) => console.log(`   ${s.scholarshipName}: ${(s.deadlines ?? []).map((d) => String(d.date).slice(0, 10)).join(", ")}`));

// 4. Suspiciously uniform data: identical deadline dates across many universities.
const deadlineCounts = new Map();
uniDeadlines.forEach((d) => deadlineCounts.set(d, (deadlineCounts.get(d) ?? 0) + 1));
const top = [...deadlineCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
console.log(`\nMost common university deadline dates: ${top.map(([d, n]) => `${d} ×${n}`).join(", ")}`);

// 5. Spot-check well-known facts (published by the universities themselves).
const KNOWN = [
    ["Harvard", "acceptance rate ≈ 3–4% (Harvard Class of 2028)"],
    ["Stanford", "acceptance rate ≈ 3.6–4%"],
    ["Massachusetts Institute of Technology", "acceptance rate ≈ 4–5%"],
    ["University of Oxford", "acceptance rate ≈ 14–17%"],
    ["University of Cambridge", "acceptance rate ≈ 18–21%"],
    ["Peking University", "public, Beijing"],
];
console.log("\nSpot check against well-known published figures:");
for (const [needle, expected] of KNOWN) {
    const u = unis.find((x) => x.name?.includes(needle));
    if (!u) {
        console.log(`   ${needle}: not in database`);
        continue;
    }
    console.log(`   ${u.name}: acceptanceRate=${u.acceptanceRate}, global=${u.ranking?.global}, tuition(bachelor)=${u.tuition?.bachelor} ${u.tuition?.currency} — expected ${expected}`);
}

// 6. Precision that official sources rarely publish.
const decimalRates = unis.filter((u) => typeof u.acceptanceRate === "number" && !Number.isInteger(u.acceptanceRate)).length;
console.log(`\nAcceptance rates given to one decimal place: ${pct(decimalRates, unis.length)}`);
const withAllNumbers = unis.filter((u) => u.acceptanceRate != null && u.students?.total != null && u.tuition?.bachelor != null && u.livingCostUSD?.min != null).length;
console.log(`Universities with acceptance rate + student count + tuition + living cost all filled: ${pct(withAllNumbers, unis.length)}`);

// 7. Scholarships marked verified.
console.log(`\nScholarships marked verified=true: ${pct(schs.filter((s) => s.verified).length, schs.length)}`);

await mongoose.disconnect();
