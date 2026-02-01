const hre = require("hardhat");

async function main() {
  const [owner, receiver] = await hre.ethers.getSigners();
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const CreatureNFT = await hre.ethers.getContractAt("CreatureNFT", contractAddress);

  console.log(` Transfert du token #1 de ${owner.address} vers ${receiver.address}`);

  // avance le temps pour passer le lock/cooldown
  await hre.network.provider.send("evm_increaseTime", [15 * 60]);
  await hre.network.provider.send("evm_mine");

  // Transfert via la fonction ERC721 intégrée
  const tx = await CreatureNFT.connect(owner).safeTransferFrom(owner.address, receiver.address, 1);
  await tx.wait();

  console.log(` Transfert effectué avec succès !`);
}

main().catch(console.error);