ce qu'il faut taper pour démarrer le projet : 

```shell
npx hardhat test #pour tester les fonctionalitées 
npx hardhat node #pour avoir la connection avec metamask (ne pas le fermer)
npx hardhat ignition deploy ./ignition/modules/Lock.js

npx hardhat run scripts/deploy.cjs --network localhost #on déploie le scripts
# Prendre le Contrat déployé à l’adresse 
npx hardhat run scripts/uploadToIPFS.cjs --network localhost #c'est pour avoir des monstres un peu en NFT
npx hardhat run scripts/mint.cjs --network localhost        
   
```
