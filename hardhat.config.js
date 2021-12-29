require("@nomiclabs/hardhat-waffle");
require('@nomiclabs/hardhat-ethers');
require('@openzeppelin/hardhat-upgrades');
require('hardhat-contract-sizer');
const dotenv = require('dotenv').config();
const dotenvExpand = require('dotenv-expand');

// use interpolation for .env variables
dotenvExpand(dotenv);

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: { enabled: true, runs: 1000 }
    }
  },
  networks: {
    hardhat: {
      chainId: 1337,
      accounts: {
        mnemonic: process.env.MNEMONIC_1
      }
    },
    ropsten: {
      url: process.env.ROPSTEN_ETH,
      accounts: [process.env.TEST_PRIVATE_KEY]
    },
    rinkeby: {
      url: process.env.RINKEBY_ETH,
      accounts: [process.env.TEST_PRIVATE_KEY]
    }
  }
};
