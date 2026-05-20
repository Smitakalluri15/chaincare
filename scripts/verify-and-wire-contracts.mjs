import { ethers } from "ethers";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "../.env");
const env = Object.fromEntries(
  readFileSync(envPath, "utf-8")
    .split("\n")
    .filter(l => l && !l.startsWith("#") && l.includes("="))
    .map(l => { const [k, ...v] = l.split("="); return [k.trim(), v.join("=").trim()]; })
);

const RPC      = env.VITE_BASE_SEPOLIA_RPC || "https://sepolia.base.org";
const DONATION = env.VITE_DONATION_CONTRACT;
const BADGE    = env.VITE_BADGE_CONTRACT;

if (!DONATION || !BADGE) {
  console.error("❌ VITE_DONATION_CONTRACT or VITE_BADGE_CONTRACT missing from .env");
  process.exit(1);
}

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC);
  const donation = new ethers.Contract(DONATION, ["function badgeContract() view returns (address)", "function owner() view returns (address)"], provider);
  const badge    = new ethers.Contract(BADGE,    ["function donationContract() view returns (address)", "function owner() view returns (address)"], provider);

  const [donationOwner, currentBadgeAddr, badgeOwner, currentDonationAddr] =
    await Promise.all([donation.owner(), donation.badgeContract(), badge.owner(), badge.donationContract()]);

  const donationLinked = currentBadgeAddr.toLowerCase() === BADGE.toLowerCase();
  const badgeLinked    = currentDonationAddr.toLowerCase() === DONATION.toLowerCase();

  console.log("\n═══════════════════════════════════════════════");
  console.log("  ChainCare Contract Wiring Check");
  console.log("═══════════════════════════════════════════════\n");
  console.log(`Donation.sol  (${DONATION})`);
  console.log(`  owner()         = ${donationOwner}`);
  console.log(`  badgeContract() = ${currentBadgeAddr}`);
  console.log(`  → Wired? ${donationLinked ? "✅ YES" : "❌ NO — needs setBadgeContract()"}\n`);
  console.log(`DonorBadge.sol (${BADGE})`);
  console.log(`  owner()              = ${badgeOwner}`);
  console.log(`  donationContract()   = ${currentDonationAddr}`);
  console.log(`  → Wired? ${badgeLinked ? "✅ YES" : "❌ NO — needs setDonationContract()"}\n`);

  if (!donationLinked) {
    console.log("══ FIX in Remix IDE ══════════════════════════════");
    console.log(`  Contract : Donation.sol at ${DONATION}`);
    console.log(`  Call     : setBadgeContract("${BADGE}")`);
    console.log(`  Signer   : ${donationOwner}\n`);
  }
  if (!badgeLinked) {
    console.log("══ FIX in Remix IDE ══════════════════════════════");
    console.log(`  Contract : DonorBadge.sol at ${BADGE}`);
    console.log(`  Call     : setDonationContract("${DONATION}")`);
    console.log(`  Signer   : ${badgeOwner}\n`);
  }
  if (donationLinked && badgeLinked) {
    console.log("✅ Both contracts wired! Donations will auto-mint NFT badges.\n");
  }
}

main().catch(console.error);