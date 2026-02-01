const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 
  const CreatureNFT = await hre.ethers.getContractAt("CreatureNFT", contractAddress);

  console.log(` Contrat trouvé à ${contractAddress}`);
  console.log(` Mint effectué par : ${deployer.address}`);

  const uris = [
    "ipfs://QmcA4cQiwzAu4iGKmssdnBWAJBs5bNtoMkfK3ERiqprovX",
    "ipfs://QmfTTePiqSPzebgMEyAvNYaCpqQQFXoKHNc5tAFeTsYVhp",
    "ipfs://QmYnjNXGU8cnkuMWpsRg5oa263SfN4jxY7i82Tc5s92Tqj"
  ];

  for (let i = 0; i < uris.length; i++) {
    const tx = await CreatureNFT.createCreature(deployer.address, uris[i], i); 
    const receipt = await tx.wait();
    console.log(` Créature #${i + 1} mintée ! (tx: ${receipt.hash})`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
