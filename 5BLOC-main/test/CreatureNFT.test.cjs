const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CreatureNFT", function () {
  let nft;
  let owner, alice, bob;

  beforeEach(async function () {
    [owner, alice, bob] = await ethers.getSigners();
    const CreatureNFT = await ethers.getContractFactory("CreatureNFT");
    nft = await CreatureNFT.deploy();
    await nft.waitForDeployment();
  });

  it("doit permettre au owner de créer une créature", async function () {
    const tx = await nft.createCreature(alice.address, "ipfs://QmTest", 1);
    await tx.wait();
    const ownerOf1 = await nft.ownerOf(1);
    expect(ownerOf1).to.equal(alice.address);
  });

  it("doit empêcher de dépasser la limite de 4 créatures", async function () {
    for (let i = 0; i < 4; i++) {
      await nft.createCreature(alice.address, `ipfs://QmTest${i}`, 0);
    }
    await expect(
      nft.createCreature(alice.address, "ipfs://QmFail", 0)
    ).to.be.revertedWith("Max creatures reached");
  });

  it("doit permettre un transfert valide", async function () {
  await nft.createCreature(alice.address, "ipfs://Qm1", 0);

  //  attendre la fin du lock (10 min)
  await ethers.provider.send("evm_increaseTime", [10 * 60]);
  await ethers.provider.send("evm_mine");

  //  puis le cooldown (5 min)
  await ethers.provider.send("evm_increaseTime", [5 * 60]);
  await ethers.provider.send("evm_mine");

  await nft.connect(alice).transferFrom(alice.address, bob.address, 1);
  const newOwner = await nft.ownerOf(1);
  expect(newOwner).to.equal(bob.address);
});


  it("doit refuser un transfert si le destinataire a déjà 4 créatures", async function () {
    for (let i = 0; i < 4; i++) {
      await nft.createCreature(bob.address, `ipfs://QmBob${i}`, 0);
    }
    await nft.createCreature(alice.address, "ipfs://QmAlice", 0);

    // simule 5 min avant le transfert
    await ethers.provider.send("evm_increaseTime", [5 * 60]);
    await ethers.provider.send("evm_mine");

    await expect(
      nft.connect(alice).transferFrom(alice.address, bob.address, 5)
    ).to.be.revertedWith("Recipient has max creatures");
  });

  it("doit appliquer le cooldown de transfert (5 min)", async function () {
  await nft.createCreature(alice.address, "ipfs://QmTest", 0);

  // ➕ attendre lock initial (10 min)
  await ethers.provider.send("evm_increaseTime", [10 * 60]);
  await ethers.provider.send("evm_mine");

  // premier transfert (après lock)
  await nft.connect(alice).transferFrom(alice.address, bob.address, 1);

  // retour immédiat → échoue à cause du cooldown
  await expect(
    nft.connect(bob).transferFrom(bob.address, alice.address, 1)
  ).to.be.revertedWith("Transfer cooldown");

  //  attendre 5 min pour passer le cooldown
  await ethers.provider.send("evm_increaseTime", [5 * 60]);
  await ethers.provider.send("evm_mine");

  await nft.connect(bob).transferFrom(bob.address, alice.address, 1);
  const newOwner = await nft.ownerOf(1);
  expect(newOwner).to.equal(alice.address);
});


  it("doit augmenter le niveau d'une créature (upgrade)", async function () {
    await nft.createCreature(alice.address, "ipfs://QmTest", 2);

    // on avance le temps de 10 min pour que le lock soit expiré
    await ethers.provider.send("evm_increaseTime", [10 * 60]);
    await ethers.provider.send("evm_mine");

    await nft.connect(alice).upgradeCreature(1);
    const creature = await nft.getCreature(1);
    expect(creature.level).to.equal(2);
  });
});
