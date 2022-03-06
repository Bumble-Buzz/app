const ethers = require('ethers');
let mnemonic = "noble inside rescue inform plug venture begin merry equal future lyrics mixture";
let mnemonicWallet = ethers.Wallet.fromMnemonic(mnemonic);
console.log(mnemonicWallet.privateKey);
