const { ethers, upgrades } = require("hardhat");
const hre = require("hardhat");

let ACCOUNTS;
let CONTRACT_FACTORY;
let CONTRACT;
let BANK_CONTRACT;
let SALE_CONTRACT;
let COLLECTION_ITEM_CONTRACT;
let NFT_CONTRACT;
let SAMPLE_NFT_CONTRACT;
let TEST_NFT_CONTRACTS;

async function main() {
  await getAccounts();

  await avaxTrade();
  await bank();
  await sale();
  await collectionItem();
  await updateAvaxTrade();
  await avaxTradeNft();
  await SampleErc721();

  console.log("AvaxTrade deployed to:", CONTRACT.address);
  console.log("Bank deployed to:", BANK_CONTRACT.address);
  console.log("Sale deployed to:", SALE_CONTRACT.address);
  console.log("Collection Item deployed to:", COLLECTION_ITEM_CONTRACT.address);
  console.log("AvaxTradeNft deployed to:", NFT_CONTRACT.address);
  console.log("Sample NFT Contract deployed to:", SAMPLE_NFT_CONTRACT.address);

  await TestErc721();
}

// todo use actual account when deploying to mainnet chain
const getAccounts = async () => {
  return ACCOUNTS = await ethers.getSigners();
};

const avaxTrade = async () => {
  CONTRACT_FACTORY = await ethers.getContractFactory("AvaxTrade");
  CONTRACT = await upgrades.deployProxy(CONTRACT_FACTORY, [ACCOUNTS[0].address], { kind: 'uups' });
  await CONTRACT.deployed();
};

const bank = async () => {
  CONTRACT_FACTORY = await ethers.getContractFactory("Bank");
  BANK_CONTRACT = await upgrades.deployProxy(CONTRACT_FACTORY, [CONTRACT.address], { kind: 'uups' });
  await BANK_CONTRACT.deployed();
};

const sale = async () => {
  CONTRACT_FACTORY = await ethers.getContractFactory("Sale");
  SALE_CONTRACT = await upgrades.deployProxy(CONTRACT_FACTORY, [CONTRACT.address, ACCOUNTS[0].address], { kind: 'uups' });
  await SALE_CONTRACT.deployed();
};

const collectionItem = async () => {
  CONTRACT_FACTORY = await ethers.getContractFactory("CollectionItem");
  COLLECTION_ITEM_CONTRACT = await upgrades.deployProxy(CONTRACT_FACTORY, [CONTRACT.address, ACCOUNTS[0].address], { kind: 'uups' });
  await COLLECTION_ITEM_CONTRACT.deployed();
};

// update AvaxTrade with sibling contracts
const updateAvaxTrade = async () => {
  await CONTRACT.connect(ACCOUNTS[0]).setContracts(BANK_CONTRACT.address, SALE_CONTRACT.address, COLLECTION_ITEM_CONTRACT.address);
};

const avaxTradeNft = async () => {
  CONTRACT_FACTORY = await ethers.getContractFactory("AvaxTradeNft");
  NFT_CONTRACT = await CONTRACT_FACTORY.deploy('Local AvaxTrade', 'LAX', 'ipfs://');
  await NFT_CONTRACT.deployed();
};

const SampleErc721 = async () => {
  CONTRACT_FACTORY = await ethers.getContractFactory("SampleErc721");
  SAMPLE_NFT_CONTRACT = await CONTRACT_FACTORY.deploy();
  await SAMPLE_NFT_CONTRACT.deployed();
};

const TestErc721 = async () => {
  for (let i = 0; i < 9; i++) {
    CONTRACT_FACTORY = await ethers.getContractFactory("TestErc721");
    TEST_NFT_CONTRACTS = await CONTRACT_FACTORY.deploy(`TestErc721 - ${i}`, `Test${i}`);
    await TEST_NFT_CONTRACTS.deployed();
    console.log(`Test NFT Contract ${i} deployed to:`, TEST_NFT_CONTRACTS.address);
  }
};


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
