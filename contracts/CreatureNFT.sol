// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CreatureNFT
 * @dev ERC721 avec limite de possession, cooldown et lock
 */
contract CreatureNFT is ERC721URIStorage, Ownable {
    enum Rarity { Common, Rare, Epic, Legendary }

    struct Creature {
        uint8 level;
        Rarity rarity;
        uint256 createdAt;
        uint256 lastTransferAt;
        uint256 lastActionAt;
    }

    uint256 private _nextTokenId;
    mapping(uint256 => Creature) public creatures;
    mapping(address => uint256) public creatureCount;

    uint256 public constant MAX_CREATURES_PER_PLAYER = 4;
    uint256 public constant TRANSFER_COOLDOWN = 5 minutes;
    uint256 public constant ACTION_LOCK = 10 minutes;

    event CreatureCreated(uint256 indexed tokenId, address indexed owner, Rarity rarity);
    event CreatureTransferred(uint256 indexed tokenId, address indexed from, address indexed to);
    event CreatureUpgraded(uint256 indexed tokenId, uint8 newLevel);

    constructor() ERC721("CreatureNFT", "CREATURE") Ownable(msg.sender) {
        _nextTokenId = 1;
    }

    // ========= MINT =========
    function createCreature(
        address to,
        string memory metadataURI,
        Rarity rarity
    ) public onlyOwner returns (uint256) {
        require(creatureCount[to] < MAX_CREATURES_PER_PLAYER, "Max creatures reached");

        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);

        creatures[tokenId] = Creature({
            level: 1,
            rarity: rarity,
            createdAt: block.timestamp,
            lastTransferAt: block.timestamp,
            lastActionAt: block.timestamp
        });

        emit CreatureCreated(tokenId, to, rarity);
        return tokenId;
    }

    // ========= UPGRADE =========
    function upgradeCreature(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        Creature storage c = creatures[tokenId];

        require(c.level < 100, "Already max level");
        require(block.timestamp >= c.lastActionAt + ACTION_LOCK, "Action lock active");

        c.level++;
        c.lastActionAt = block.timestamp;
        emit CreatureUpgraded(tokenId, c.level);
    }

    // ========= CONTRAINTES GLOBALES (nouveau hook v5) =========
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);
        address previousOwner = super._update(to, tokenId, auth);

        // Mint
        if (from == address(0)) {
            require(creatureCount[to] < MAX_CREATURES_PER_PLAYER, "Max creatures per player reached");
            creatureCount[to]++;
        }
        // Burn
        else if (to == address(0)) {
            creatureCount[from]--;
        }
        // Transfert normal
        else {
            require(creatureCount[to] < MAX_CREATURES_PER_PLAYER, "Recipient has max creatures");
            require(block.timestamp >= creatures[tokenId].lastTransferAt + TRANSFER_COOLDOWN, "Transfer cooldown");
            require(block.timestamp >= creatures[tokenId].lastActionAt + ACTION_LOCK, "Creature locked");

            creatureCount[from]--;
            creatureCount[to]++;
            creatures[tokenId].lastTransferAt = block.timestamp;
            emit CreatureTransferred(tokenId, from, to);
        }

        return previousOwner;
    }

    // ========= LECTURE =========
    function getCreature(uint256 tokenId)
        public
        view
        returns (
            uint8 level,
            Rarity rarity,
            uint256 createdAt,
            uint256 lastTransferAt,
            uint256 lastActionAt,
            string memory metadataURI
        )
    {
        require(_ownerOf(tokenId) != address(0), "Creature does not exist");
        Creature memory c = creatures[tokenId];
        return (c.level, c.rarity, c.createdAt, c.lastTransferAt, c.lastActionAt, tokenURI(tokenId));
    }

    // ========= OVERRIDES =========
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}