const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;

/**
 * Upload une image sur IPFS via Pinata
 * @param {String} filePath - Chemin du fichier image
 * @returns {String} URI IPFS de l'image
 */
async function uploadImageToIPFS(filePath) {
  const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
  const formData = new FormData();

  formData.append('file', fs.createReadStream(filePath));

  try {
    const response = await axios.post(url, formData, {
      maxBodyLength: Infinity,
      headers: {
        ...formData.getHeaders(),
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY
      }
    });

    const ipfsHash = response.data.IpfsHash;
    console.log(`🖼️ Image uploadée sur IPFS : ${ipfsHash}`);
    return `ipfs://${ipfsHash}`;
  } catch (error) {
    console.error('❌ Erreur upload image:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Upload des métadonnées JSON sur IPFS via Pinata
 */
async function uploadMetadataToIPFS(metadata) {
  const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';

  try {
    const response = await axios.post(url, metadata, {
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
        'Content-Type': 'application/json'
      }
    });

    const ipfsHash = response.data.IpfsHash;
    console.log(` Métadonnées uploadées : ${ipfsHash}`);
    return `ipfs://${ipfsHash}`;
  } catch (error) {
    console.error('❌ Erreur upload metadata:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Créer les métadonnées NFT
 */
function createCreatureMetadata(name, type, rarity, level, imageURI) {
  return {
    name,
    description: `${name} - Une créature ${rarity} de type ${type}`,
    image: imageURI,
    attributes: [
      { trait_type: 'Element', value: type },
      { trait_type: 'Rarity', value: rarity },
      { trait_type: 'Level', value: level }
    ],
    createdAt: Math.floor(Date.now() / 1000)
  };
}

/**
 * Script principal
 */
async function main() {
  console.log('🚀 Upload NFT Dragon...\n');

  
  // 1. Upload image
  const imagePath = path.resolve(__dirname, '..', 'img', 'dragon.jpg');
  const imageURI = await uploadImageToIPFS(imagePath);

  // 2. Créer metadata
  const metadata = createCreatureMetadata(
    'Dragon de Feu #1',
    'Fire',
    'Epic',
    1,
    imageURI
  );

  console.log('\n Métadonnées générées :');
  console.log(JSON.stringify(metadata, null, 2));

  // 3. Upload metadata
  const metadataURI = await uploadMetadataToIPFS(metadata);

  console.log('\n✅ NFT prêt :');
  console.log('Image URI     :', imageURI);
  console.log('Metadata URI  :', metadataURI);
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}
