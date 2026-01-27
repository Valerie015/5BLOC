// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Import du standard ERC-721 d'OpenZeppelin
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CreatureNFT
 * @dev Smart contract pour gérer une collection de créatures NFT
 * Contraintes : max 4 créatures/joueur, cooldowns, métadonnées IPFS
 */
contract CreatureNFT is ERC721, ERC721URIStorage, Ownable {
    
    // ========== STRUCTURES DE DONNÉES ==========
    
    /// @dev Niveaux de rareté possibles
    enum Rarity { Common, Rare, Epic, Legendary }
    
    /// @dev Structure représentant une créature
    struct Creature {
        uint8 level;              // Niveau (1-100)
        Rarity rarity;            // Rareté
        uint256 createdAt;        // Timestamp de création
        uint256 lastTransferAt;   // Timestamp du dernier transfert
        uint256 lastActionAt;     // Timestamp de la dernière action (fusion/amélioration)
    }
    
    // ========== VARIABLES D'ÉTAT ==========
    
    /// @dev Compteur pour générer des IDs uniques
    uint256 private _nextTokenId;
    
    /// @dev Mapping tokenId => Creature (stockage des données on-chain)
    mapping(uint256 => Creature) public creatures;
    
    /// @dev Mapping address => nombre de créatures possédées
    mapping(address => uint256) public creatureCount;
    
    // ========== CONSTANTES ==========
    
    /// @dev Limite maximale de créatures par joueur
    uint256 public constant MAX_CREATURES_PER_PLAYER = 4;
    
    /// @dev Cooldown entre deux transferts (5 minutes)
    uint256 public constant TRANSFER_COOLDOWN = 5 minutes;
    
    /// @dev Lock après une action critique (10 minutes)
    uint256 public constant ACTION_LOCK = 10 minutes;
    
    // ========== ÉVÉNEMENTS ==========
    
    /// @dev Émis lors de la création d'une créature
    event CreatureCreated(uint256 indexed tokenId, address indexed owner, Rarity rarity);
    
    /// @dev Émis lors d'un transfert de créature
    event CreatureTransferred(uint256 indexed tokenId, address indexed from, address indexed to);
    
    /// @dev Émis lors d'une amélioration de créature
    event CreatureUpgraded(uint256 indexed tokenId, uint8 newLevel);
    
    // ========== CONSTRUCTEUR ==========
    
    constructor() ERC721("CreatureNFT", "CREATURE") Ownable(msg.sender) {
        _nextTokenId = 1; // Les IDs commencent à 1
    }
    
    // ========== FONCTIONS PRINCIPALES ==========
    
    /**
     * @dev Crée (mint) une nouvelle créature pour un joueur
     * @param to Adresse du destinataire
     * @param metadataURI URI IPFS des métadonnées
     * @param rarity Niveau de rareté de la créature
     */
    function createCreature(
        address to,
        string memory metadataURI,
        Rarity rarity
    ) public onlyOwner returns (uint256) {
        // RÈGLE R1 : Vérifier la limite de possession
        require(
            creatureCount[to] < MAX_CREATURES_PER_PLAYER,
            "Max creatures limit reached"
        );
        
        uint256 tokenId = _nextTokenId++;
        
        // Mint du NFT (fonction héritée d'ERC721)
        _safeMint(to, tokenId);
        
        // Stockage des métadonnées IPFS
        _setTokenURI(tokenId, metadataURI);
        
        // Création de la structure Creature
        creatures[tokenId] = Creature({
            level: 1, // Toutes les créatures commencent niveau 1
            rarity: rarity,
            createdAt: block.timestamp,
            lastTransferAt: block.timestamp,
            lastActionAt: block.timestamp
        });
        
        // Incrémenter le compteur du joueur
        creatureCount[to]++;
        
        emit CreatureCreated(tokenId, to, rarity);
        
        return tokenId;
    }
    
    /**
     * @dev Transfère une créature à un autre joueur
     * @param to Adresse du destinataire
     * @param tokenId ID de la créature à transférer
     */
    function transferCreature(address to, uint256 tokenId) public {
        address from = ownerOf(tokenId);
        
        // Vérifications de base
        require(from == msg.sender, "You don't own this creature");
        require(to != address(0), "Invalid recipient");
        require(to != from, "Cannot transfer to yourself");
        
        // RÈGLE R1 : Vérifier que le destinataire n'a pas atteint la limite
        require(
            creatureCount[to] < MAX_CREATURES_PER_PLAYER,
            "Recipient has max creatures"
        );
        
        // RÈGLE R2 : Vérifier le cooldown du transfert
        require(
            block.timestamp >= creatures[tokenId].lastTransferAt + TRANSFER_COOLDOWN,
            "Transfer cooldown active"
        );
        
        // RÈGLE R3 : Vérifier qu'aucune action critique n'est en cours
        require(
            block.timestamp >= creatures[tokenId].lastActionAt + ACTION_LOCK,
            "Creature is locked after recent action"
        );
        
        // Mise à jour des compteurs
        creatureCount[from]--;
        creatureCount[to]++;
        
        // Mise à jour du timestamp
        creatures[tokenId].lastTransferAt = block.timestamp;
        
        // Transfert effectif (fonction héritée d'ERC721)
        _transfer(from, to, tokenId);
        
        emit CreatureTransferred(tokenId, from, to);
    }
    
    /**
     * @dev Améliore le niveau d'une créature
     * @param tokenId ID de la créature à améliorer
     */
    function upgradeCreature(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "You don't own this creature");
        
        Creature storage creature = creatures[tokenId];
        
        // Vérifier que la créature n'est pas au niveau max
        require(creature.level < 100, "Creature already at max level");
        
        // RÈGLE R3 : Vérifier qu'aucune action n'est en cours
        require(
            block.timestamp >= creature.lastActionAt + ACTION_LOCK,
            "Action cooldown active"
        );
        
        // Amélioration du niveau
        creature.level++;
        creature.lastActionAt = block.timestamp;
        
        emit CreatureUpgraded(tokenId, creature.level);
    }
    
    /**
     * @dev Récupère les informations d'une créature
     * @param tokenId ID de la créature
     */
    function getCreature(uint256 tokenId) public view returns (
        uint8 level,
        Rarity rarity,
        uint256 createdAt,
        uint256 lastTransferAt,
        uint256 lastActionAt,
        string memory metadataURI
    ) {
        require(_ownerOf(tokenId) != address(0), "Creature does not exist");
        
        Creature memory creature = creatures[tokenId];
        
        return (
            creature.level,
            creature.rarity,
            creature.createdAt,
            creature.lastTransferAt,
            creature.lastActionAt,
            tokenURI(tokenId)
        );
    }
    
    // ========== FONCTIONS OVERRIDE NÉCESSAIRES ==========
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}