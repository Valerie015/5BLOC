// scripts/view.cjs
const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const [user] = await hre.ethers.getSigners();

  // Adresse de ton contrat déployé
  const contractAddress = "Mettre le Contrat déployé à l’adresse quand on fait le script de deploy.cjs";

  // ID du token à afficher
  const tokenId = 3;

  // Connexion au contrat
  const CreatureNFT = await hre.ethers.getContractAt("CreatureNFT", contractAddress);

  console.log(` Lecture des infos de la créature #${tokenId}...`);
  console.log(` Contrat : ${contractAddress}`);
  console.log(` Exécuté par : ${user.address}`);

  // Appel de la fonction getCreature
  const creature = await CreatureNFT.getCreature(tokenId);

  // Conversion des timestamps BigInt en date lisible
  const createdAt = new Date(Number(creature.createdAt) * 1000).toLocaleString();
  const lastTransferAt = new Date(Number(creature.lastTransferAt) * 1000).toLocaleString();
  const lastActionAt = new Date(Number(creature.lastActionAt) * 1000).toLocaleString();

  // Conversion de la rareté en nom
  const rarityNames = ["Common", "Rare", "Epic", "Legendary"];
  const rarity = rarityNames[Number(creature.rarity)] || "Unknown";

  // Récupération de l’URI IPFS
  const uri = creature.metadataURI || creature.image || "N/A";

  console.log("\n Informations sur la créature :");
  console.log("------------------------------------");
  console.log(` ID du token       : ${tokenId}`);
  console.log(` Niveau            : ${creature.level.toString()}`);
  console.log(` Rareté            : ${rarity}`);
  console.log(` Créée le          : ${createdAt}`);
  console.log(` Dernier transfert : ${lastTransferAt}`);
  console.log(`  Dernière action  : ${lastActionAt}`);
  console.log(` IPFS Metadata URI : ${uri}`);
  console.log("------------------------------------\n");
}

main().catch((error) => {
  console.error(" Erreur lors de la lecture :", error);
  process.exit(1);
});

