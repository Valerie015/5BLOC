import { contractAddress, abi, provider, signer, contract, userAddress } from './config.js';
import { loadMyCreatures } from './creatures.js';

export async function connectWallet() {
  if(!window.ethereum) return alert("MetaMask non détecté");

  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    window.provider = new ethers.providers.Web3Provider(window.ethereum);
    window.signer = window.provider.getSigner();
    window.userAddress = await window.signer.getAddress();
    document.getElementById("userAddress").innerText = window.userAddress;
    window.contract = new ethers.Contract(contractAddress, abi, window.signer);
    loadMyCreatures();
  } catch(e) {
    console.error(e);
    alert("Erreur lors de la connexion: " + (e.reason || e.message || e));
  }
}
