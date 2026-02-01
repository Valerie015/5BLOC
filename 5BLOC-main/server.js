const express = require('express');
const cors = require('cors');
const { uploadMetadataToIPFS, createCreatureMetadata } = require('./uploadIPFS');

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint pour upload de métadonnées IPFS
app.post('/api/upload-creature', async (req, res) => {
  const { name, type, rarity, level, imageURI, owner } = req.body;

  try {
    const metadata = createCreatureMetadata(name, type, rarity, level, imageURI, owner);
    const uri = await uploadMetadataToIPFS(metadata);
    res.json({ success: true, uri });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = 4000;
app.listen(PORT, () => console.log(` Serveur en écoute sur http://localhost:${PORT}`));
