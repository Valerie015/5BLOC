// scripts/deploy.cjs
const hre = require("hardhat");

async function main() {
  console.log(" Déploiement du contrat CreatureNFT sur le réseau :", hre.network.name);

  const [deployer] = await hre.ethers.getSigners();
  console.log(" Déployé par :", deployer.address);

  // Créer l’usine du contrat
  const CreatureNFT = await hre.ethers.getContractFactory("CreatureNFT");

  // Déployer le contrat
  const nft = await CreatureNFT.deploy();
  // On attend simplement la transaction d’implantation
  await nft.waitForDeployment();

  console.log(` Contrat déployé à l’adresse : ${await nft.getAddress()}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(" Erreur de déploiement :", error);
    process.exit(1);
  });
