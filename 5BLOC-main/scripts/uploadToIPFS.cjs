const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;

/**
 * Upload des métadonnées JSON sur IPFS via Pinata
 * @param {Object} metadata - Objet JSON des métadonnées
 * @returns {String} URI IPFS (ipfs://Qm...)
 */
async function uploadMetadataToIPFS(metadata) {
  const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
  
  try {
    const response = await axios.post(url, metadata, {
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    const ipfsHash = response.data.IpfsHash;
    console.log(` Métadonnées uploadées sur IPFS : ${ipfsHash}`);
    return `ipfs://${ipfsHash}`;
  } catch (error) {
    console.error(' Erreur upload IPFS:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Créer les métadonnées d'une créature selon le format du projet
 * @param {String} name - Nom de la créature
 * @param {String} type - Type (Fire, Water, Earth, Air)
 * @param {String} rarity - Common, Rare, Epic, Legendary
 * @param {Number} level - Niveau (1-100)
 * @param {String} imageURI - URI de l'image sur IPFS
 * @returns {Object} Métadonnées formatées
 */
function createCreatureMetadata(name, type, rarity, level, imageURI) {
  return {
    name: name,
    type: type,
    rarity: rarity,
    level: level,
    image: imageURI,
    attributes: [
      { trait_type: "Element", value: type },
      { trait_type: "Rarity", value: rarity },
      { trait_type: "Level", value: level }
    ],
    description: `${name} - Une créature ${rarity} de type ${type}`,
    previousOwners: [], // Vide à la création
    createdAt: Math.floor(Date.now() / 1000),
    lastTransferAt: Math.floor(Date.now() / 1000)
  };
}

// Exemple d'utilisation
async function main() {
  console.log(" Upload de métadonnées de créatures sur IPFS...\n");

  // Créeation 3 créatures d
  const creatures = [
    {
      name: "Dragon de Feu #1",
      type: "Fire",
      rarity: "Epic",
      level: 1,
      imageURI: "ipfs://QmExampleImageHash1" // À remplacer par une vraie image pour le moment j'ai juste mis ca 
    },
    {
      name: "Léviathan des Mers #1",
      type: "Water",
      rarity: "Legendary",
      level: 1,
      imageURI: "ipfs://QmExampleImageHash2"
    },
    {
      name: "Gobelin des Forêts #1",
      type: "Earth",
      rarity: "Common",
      level: 1,
      imageURI: "ipfs://QmExampleImageHash3"
    }
  ];

  const uploadedURIs = [];

  for (const creature of creatures) {
    const metadata = createCreatureMetadata(
      creature.name,
      creature.type,
      creature.rarity,
      creature.level,
      creature.imageURI
    );

    console.log(` Création des métadonnées pour : ${creature.name}`);
    console.log(JSON.stringify(metadata, null, 2));
    console.log("\n⏳ Upload en cours...");

    const uri = await uploadMetadataToIPFS(metadata);
    uploadedURIs.push({ name: creature.name, uri });
    
    console.log(` ${creature.name} → ${uri}\n`);
    
    // Pause de 1 seconde entre chaque upload (rate limiting)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log("\n Tous les uploads sont terminés !");
  console.log("\n Récapitulatif des URI IPFS :");
  uploadedURIs.forEach(item => {
    console.log(`   ${item.name}: ${item.uri}`);
  });
}

// Exécuter le script
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { uploadMetadataToIPFS, createCreatureMetadata };