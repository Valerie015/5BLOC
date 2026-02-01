export const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const abi = [ 
  "function createCreature(address to, string memory metadataURI, uint8 rarity) public returns (uint256)",
  "function getCreature(uint256 tokenId) public view returns (uint8 level, uint8 rarity, uint256 createdAt, uint256 lastTransferAt, uint256 lastActionAt, string memory metadataURI)",
  "function transferCreature(address to, uint256 tokenId) public",
  "function upgradeCreature(uint256 tokenId) public",
  "function ownerOf(uint256 tokenId) public view returns (address)"
];

export let provider, signer, contract, userAddress;
