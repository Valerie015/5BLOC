import { contract, userAddress } from './config.js';
import { loadMyCreatures } from './creatures.js';

export async function mintCreature() {
  const btn = document.getElementById("mintBtn");
  const status = document.getElementById("mintStatus");
  btn.disabled = true;
  status.innerText = " Mint en cours...";
  try {
    const uri = document.getElementById("mintURI").value;
    const rarity = Number(document.getElementById("mintRarity").value);
    if(!uri) throw new Error("Indique une URI IPFS");

    const tx = await window.contract.createCreature(window.userAddress, uri, rarity);
    await tx.wait();
    status.innerText = " Créature mintée !";
    loadMyCreatures();
  } catch(e) {
    console.error(e);
    alert("Erreur: " + (e.reason || e.message || e));
    status.innerText = "";
  }
  btn.disabled = false;
}
