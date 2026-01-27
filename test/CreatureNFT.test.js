import { expect } from "chai";
import hre from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("CreatureNFT", function () {
  let creatureNFT;
  let owner;
  let player1;
  let player2;

  beforeEach(async function () {
    [owner, player1, player2] = await hre.ethers.getSigners();

    const CreatureNFT = await hre.ethers.getContractFactory("CreatureNFT");
    creatureNFT = await CreatureNFT.deploy();
  });

  describe("Création de créatures", function () {
    it("Devrait créer une créature avec succès", async function () {
      const metadataURI = "ipfs://QmTest123";
      
      await expect(
        creatureNFT.createCreature(player1.address, metadataURI, 0)
      )
        .to.emit(creatureNFT, "CreatureCreated")
        .withArgs(1, player1.address, 0);

      expect(await creatureNFT.ownerOf(1)).to.equal(player1.address);
      expect(await creatureNFT.creatureCount(player1.address)).to.equal(1);
    });

    it("Devrait refuser de créer plus de 4 créatures", async function () {
      const metadataURI = "ipfs://QmTest";

      for (let i = 0; i < 4; i++) {
        await creatureNFT.createCreature(player1.address, metadataURI, 0);
      }

      await expect(
        creatureNFT.createCreature(player1.address, metadataURI, 0)
      ).to.be.revertedWith("Max creatures limit reached");
    });
  });

  describe("Transfert de créatures", function () {
    beforeEach(async function () {
      await creatureNFT.createCreature(player1.address, "ipfs://Test", 0);
    });

    it("Devrait transférer une créature après le cooldown", async function () {
      await time.increase(11 * 60);

      await expect(
        creatureNFT.connect(player1).transferCreature(player2.address, 1)
      )
        .to.emit(creatureNFT, "CreatureTransferred")
        .withArgs(1, player1.address, player2.address);

      expect(await creatureNFT.ownerOf(1)).to.equal(player2.address);
    });

    it("Devrait refuser un transfert pendant le cooldown", async function () {
      await expect(
        creatureNFT.connect(player1).transferCreature(player2.address, 1)
      ).to.be.revertedWith("Transfer cooldown active");
    });
  });

  describe("Amélioration de créatures", function () {
    beforeEach(async function () {
      await creatureNFT.createCreature(player1.address, "ipfs://Test", 0);
      await time.increase(11 * 60);
    });

    it("Devrait améliorer le niveau d'une créature", async function () {
      await expect(
        creatureNFT.connect(player1).upgradeCreature(1)
      )
        .to.emit(creatureNFT, "CreatureUpgraded")
        .withArgs(1, 2);

      const creature = await creatureNFT.getCreature(1);
      expect(creature.level).to.equal(2);
    });

    it("Devrait refuser d'améliorer pendant le lock", async function () {
      await creatureNFT.connect(player1).upgradeCreature(1);
      
      await expect(
        creatureNFT.connect(player1).upgradeCreature(1)
      ).to.be.revertedWith("Action cooldown active");
    });
  });

  describe("Récupération des informations", function () {
    it("Devrait retourner les informations complètes d'une créature", async function () {
      const metadataURI = "ipfs://QmTestData";
      await creatureNFT.createCreature(player1.address, metadataURI, 2);

      const creature = await creatureNFT.getCreature(1);
      
      expect(creature.level).to.equal(1);
      expect(creature.rarity).to.equal(2);
      expect(creature.metadataURI).to.equal(metadataURI);
    });
  });
});