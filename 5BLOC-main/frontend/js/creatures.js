import { contract, userAddress } from './config.js';

export async function loadMyCreatures() {
  const list = document.getElementById("creatureList");
  list.innerHTML = "<p>Chargement...</p>";

  const creatures = [];
  let tokenId = 1;
  while(true) {
    try {
      const owner = await window.contract.ownerOf(tokenId);
      if(owner.toLowerCase() === window.userAddress.toLowerCase()) {
        const c = await window.contract.getCreature(tokenId);
        creatures.push({ tokenId, ...c });
      }
      tokenId++;
    } catch(e) {
      break;
    }
  }

  if(creatures.length === 0) {
    list.innerHTML = "<p>Aucune créature trouvée</p>";
    return;
  }

  list.innerHTML = "";
  const rarityNames = ["common","rare","epic","legendary"];
  const displayNames = ["Common","Rare","Epic","Legendary"];

  for(const c of creatures) {
    const div = document.createElement("div");
    div.className = "creature " + rarityNames[Number(c.rarity)];

    let imageTag = "";
    try {
      const meta = await (await fetch(c.metadataURI)).json();
      if(meta.image) imageTag = `<img src="${meta.image}" alt="Creature Image">`;
    } catch(e) { console.warn("Impossible de charger l'image IPFS:", e); }

    div.innerHTML = `
      ${imageTag}
      <div class="creature-info">
        <strong>ID :</strong> ${c.tokenId} <br>
        <strong>Niveau :</strong> ${c.level.toString()} <br>
        <strong>Rareté :</strong> ${displayNames[Number(c.rarity)]} <br>
        <strong>Metadata :</strong> <a href="${c.metadataURI}" target="_blank">IPFS</a>
      </div>
      <div class="creature-actions">
        <button onclick="upgrade(${c.tokenId}, this)">Upgrade</button>
        <input type="text" id="to${c.tokenId}" placeholder="Adresse destinataire" size="30">
        <button onclick="transfer(${c.tokenId}, this)">Transfer</button>
      </div>
    `;
    list.appendChild(div);
  }
}

export async function upgrade(tokenId, btn) {
  btn.disabled = true; btn.innerText = " Upgrade...";
  try {
    const tx = await window.contract.upgradeCreature(tokenId);
    await tx.wait();
    alert(" Upgrade effectué !");
    loadMyCreatures();
  } catch(e) {
    console.error(e);
    alert("Erreur: " + (e.reason || e.message || e));
  }
  btn.disabled = false; btn.innerText = "Upgrade";
}

export async function transfer(tokenId, btn) {
  const to = document.getElementById("to"+tokenId).value;
  if(!to) return alert("Indique l'adresse destinataire");
  btn.disabled = true; btn.innerText = " Transfert...";
  try {
    const tx = await window.contract.transferCreature(to, tokenId);
    await tx.wait();
    alert(" Transfert effectué !");
    loadMyCreatures();
  } catch(e) {
    console.error(e);
    alert("Erreur: " + (e.reason || e.message || e));
  }
  btn.disabled = false; btn.innerText = "Transfer";
}
