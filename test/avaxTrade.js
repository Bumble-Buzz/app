const _ = require('lodash');
const { assert, expect } = require('chai');
require('chai').use(require('chai-as-promised')).should();
const { ethers } = require("hardhat");

// global variables
let ACCOUNTS = [];
let CONTRACT;
let BANK_CONTRACT;
let COLLECTION_ITEM_CONTRACT;
let NFT_CONTRACT_721;
let NFT_CONTRACT_1155;
const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';

// global functions
const _doesArrayInclude = (_array, _identifier = {}) => {
  const foundDna = _array.find((arrayElement) => {
      return _.isEqual(arrayElement, _identifier);
  });
  return foundDna == undefined ? false : true;
};
const _doesArrayEqual = (_array, expectedArray = []) => {
  return _(_array).differenceWith(expectedArray, _.isEqual).isEmpty();
};

describe("AvaxTrade - Main", () => {
  before(async () => {
    ACCOUNTS = await ethers.getSigners();
  });

  beforeEach(async () => {
    let contractFactory = await ethers.getContractFactory("AvaxTrade");
    CONTRACT = await contractFactory.deploy();
    await CONTRACT.deployed();

    // set up Bank and CollectionItem contracts
    const contracts = await CONTRACT.connect(ACCOUNTS[4]).getContracts();
    BANK_CONTRACT = await ethers.getContractAt("Bank", contracts.bank);
    COLLECTION_ITEM_CONTRACT = await ethers.getContractAt("CollectionItem", contracts.collectionItem);

    // set up AvaxTrade NFT 721 contract
    contractFactory = await ethers.getContractFactory("AvaxTradeNft");
    NFT_CONTRACT_721 = await contractFactory.deploy('Local AvaxTrade', 'LAX', 'ipfs://cid/');
    await NFT_CONTRACT_721.deployed();

    await NFT_CONTRACT_721.connect(ACCOUNTS[4]).mint(ACCOUNTS[4].address, 1, { value: ethers.utils.parseEther('0.50') });
    await NFT_CONTRACT_721.connect(ACCOUNTS[4]).setApprovalForAll(CONTRACT.address, true);
    // await NFT_CONTRACT_721.connect(ACCOUNTS[4]).approve(CONTRACT.address, 1);

    // // set up AvaxTrade NFT 1155 contract
    // contractFactory = await ethers.getContractFactory("AvaxTradeNft1155");
    // NFT_CONTRACT_1155 = await contractFactory.deploy('ipfs://cid/{id}.json');
    // await NFT_CONTRACT_1155.deployed();

    // await NFT_CONTRACT_1155.connect(ACCOUNTS[4]).mint(ACCOUNTS[4].address, 1, { value: ethers.utils.parseEther('0.50') });
    // await NFT_CONTRACT_1155.connect(ACCOUNTS[4]).setApprovalForAll(CONTRACT.address, true);
  });

  it('deploys successfully', async () => {
    const address = await CONTRACT.address;
    assert.notEqual(address, '');
    assert.notEqual(address, 0x0);
  });

  describe('Main Functions', async () => {

    it('create market sale', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT_721.address, EMPTY_ADDRESS, ethers.utils.parseEther('5'), 1
      );

      const newOwner = await NFT_CONTRACT_721.connect(ACCOUNTS[4]).ownerOf(1);
      expect(newOwner).to.be.equal(CONTRACT.address);

      const item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT_721.address, ACCOUNTS[4].address);
      expect(item.seller).to.be.equal(ACCOUNTS[4].address);
      expect(item.collectionId).to.be.equal(1);
      expect(item.tokenId).to.be.equal(1);
      expect(item.contractAddress).to.be.equal(NFT_CONTRACT_721.address);
      expect(ethers.utils.formatEther(item.price)).to.be.equal('5.0');
      expect(item.buyer).to.be.equal(EMPTY_ADDRESS);
      expect(item.commission).to.be.equal(0);
      expect(item.creator).to.be.equal(EMPTY_ADDRESS);
      expect(item.sold).to.be.false;
      expect(item.active).to.be.true;
    });
    it('create market sale - no permission', async () => {
      await NFT_CONTRACT_721.connect(ACCOUNTS[4]).setApprovalForAll(CONTRACT.address, false);
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT_721.address, EMPTY_ADDRESS, ethers.utils.parseEther('5'), 1
      ).should.be.rejectedWith('ERC721: transfer caller is not owner nor approved');
    });
    it('create market sale - invalid IERC721 or IERC1155 contract', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, CONTRACT.address, EMPTY_ADDRESS, ethers.utils.parseEther('5'), 1
      ).should.be.rejectedWith('Transaction reverted: function selector was not recognized and there\'s no fallback function');
    });
    it('create market sale - non-contract address passed in', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, ACCOUNTS[3].address, EMPTY_ADDRESS, ethers.utils.parseEther('5'), 1
      ).should.be.rejectedWith('Transaction reverted: function call to a non-contract account');
    });
    it('create market sale - not owner of item', async () => {
      await CONTRACT.connect(ACCOUNTS[5]).createMarketSale(
        1, NFT_CONTRACT_721.address, EMPTY_ADDRESS, ethers.utils.parseEther('5'), 1
      ).should.be.rejectedWith('You are not the owner of this item');
    });
  });

});
