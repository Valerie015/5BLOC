const hre = require("hardhat");

async function main() {
  const [owner] = await hre.ethers.getSigners();

  console.log(` Déploiement / récupération du contrat pour ${owner.address}`);

  // 1️ Déploiement du contrat
  const CreatureNFTFactory = await hre.ethers.getContractFactory("CreatureNFT");
  const CreatureNFT = await CreatureNFTFactory.deploy();
  await CreatureNFT.waitForDeployment();
  console.log(" CreatureNFT déployé à :", CreatureNFT.target);

  // 2️ Mint la créature #1 pour le propriétaire
  const metadataURI = "ipfs://QmcA4cQiwzAu4iGKmssdnBWAJBs5bNtoMkfK3ERiqprovX"; // Exemple
  const rarity = 2; // 0=Common,1=Rare,2=Epic,3=Legendary
  const mintTx = await CreatureNFT.createCreature(owner.address, metadataURI, rarity);
  await mintTx.wait();
  console.log(" Créature #1 mintée pour :", owner.address);

  // 3️ Avancer le temps de 15 minutes pour bypass le lock
  await hre.network.provider.send("evm_increaseTime", [15 * 60]);
  await hre.network.provider.send("evm_mine");

  // 4️ Upgrade de la créature #1
  console.log(` Amélioration de la créature #1 par ${owner.address}`);
  const upgradeTx = await CreatureNFT.connect(owner).upgradeCreature(1);
  await upgradeTx.wait();
  console.log(" Upgrade exécuté");

  // 5️ Vérification du niveau actuel
  const creature = await CreatureNFT.getCreature(1);
  console.log(` Niveau actuel de la créature #1 : ${creature.level.toString()}`);
}

main().catch((err) => {
  console.error(" Erreur :", err);
  process.exitCode = 1;
});
