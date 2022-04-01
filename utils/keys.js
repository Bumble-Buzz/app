const ethers = require('ethers');
const dotenv = require('dotenv').config();
const dotenvExpand = require('dotenv-expand');

// use interpolation for .env variables
dotenvExpand(dotenv);


for (let i = 0; i < 5; i++) {
  const mnemonicWallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC_1, `m/44'/60'/0'/0/${i}`);
  console.log(`Account ${i}:`, mnemonicWallet.address, mnemonicWallet.privateKey);
}

// let mnemonicWallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC_1, `m/44'/60'/0'/0/0`);
// console.log('Account 1:', mnemonicWallet.address);
// console.log('Account 1 privateKey:', mnemonicWallet.privateKey);

// mnemonicWallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC_1, `m/44'/60'/0'/0/1`);
// console.log('Account 2:', mnemonicWallet.address);
// console.log('Account 2 privateKey:', mnemonicWallet.privateKey);
