// Polygon (EVM) tarafındaki ProofOfPresenceSBT kontratını deploy eder.
//
// SUI tarafı bu script'i kullanmaz — proje SUI'yi ana zincir olarak kullanıyor
// (bkz. sui/proof_of_presence/). Bu script yalnızca opsiyonel EVM desteği
// içindir (bkz. DEPLOYMENT.md, bölüm 3).
//
// Kullanım:
//   PRIVATE_KEY=... npx hardhat run scripts/deploy.js --network polygonMumbai
const hre = require("hardhat");

async function main() {
  const ProofOfPresenceSBT = await hre.ethers.getContractFactory("ProofOfPresenceSBT");
  const contract = await ProofOfPresenceSBT.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  const network = hre.network.name;

  console.log(`✅ ProofOfPresenceSBT deploy edildi: ${address}`);
  console.log(`🔗 Ağ: ${network}`);
  console.log("");
  console.log("Bu adresi .env dosyasına ekleyin:");
  console.log(`NEXT_PUBLIC_POLYGON_CONTRACT_ADDRESS="${address}"`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
