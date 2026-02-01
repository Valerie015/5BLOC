import { connectWallet } from './wallet.js';
import { mintCreature } from './mint.js';
import { upgrade, transfer } from './creatures.js';

// Exposer les fonctions globalement pour les boutons inline
window.upgrade = upgrade;
window.transfer = transfer;

document.getElementById("connectBtn").onclick = connectWallet;
document.getElementById("mintBtn").onclick = mintCreature;
