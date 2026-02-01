ce qu'il faut taper pour démarrer le projet : 

```shell
# créer un .env avec :
# PINATA_API_KEY = 
# PINATA_SECRET_KEY = 
# PRIVATE_KEY=

npm install 
npx hardhat ignition deploy ./ignition/modules/Lock.js
npx hardhat test # pour tester les fonctionalitées 
npx hardhat node # pour avoir la connection avec metamask (ne pas le fermer)
# Prendre la Private Key

npx hardhat run scripts/deploy.cjs --network localhost #on déploie le scripts
# Prendre le Contrat déployé à l’adresse 
npx hardhat run scripts/uploadToIPFS.cjs --network localhost #c'est pour avoir des monstres un peu en NFT
npx hardhat run scripts/mint.cjs --network localhost        
   
```
