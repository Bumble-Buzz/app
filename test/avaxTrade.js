const _ = require('lodash');
const { assert, expect } = require('chai');
require('chai').use(require('chai-as-promised')).should();
const { ethers } = require("hardhat");

// global variables
let ACCOUNTS = [];
let CONTRACT;
let BANK_CONTRACT;
let COLLECTION_ITEM_CONTRACT;
let NFT_CONTRACT;
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
    // contractFactory = await ethers.getContractFactory("AvaxTradeNft");
    // NFT_CONTRACT = await contractFactory.deploy('Local AvaxTrade', 'LAX', 'ipfs://cid/');
    // await NFT_CONTRACT.deployed();

    // await NFT_CONTRACT.connect(ACCOUNTS[4]).mint(ACCOUNTS[4].address, 1, { value: ethers.utils.parseEther('0.50') });
    // await NFT_CONTRACT.connect(ACCOUNTS[4]).setApprovalForAll(CONTRACT.address, true);
    // await NFT_CONTRACT.connect(ACCOUNTS[4]).approve(CONTRACT.address, 1);

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

  describe('Main Functions - Unverified', async () => {
    beforeEach(async () => {
      contractFactory = await ethers.getContractFactory("SampleErc721");
      NFT_CONTRACT = await contractFactory.deploy();
      await NFT_CONTRACT.deployed();

      await NFT_CONTRACT.connect(ACCOUNTS[4]).mint(ACCOUNTS[4].address, 1, { value: ethers.utils.parseEther('0.50') });
      await NFT_CONTRACT.connect(ACCOUNTS[4]).setApprovalForAll(CONTRACT.address, true);
    });

    it('create market sale - no permission', async () => {
      await NFT_CONTRACT.connect(ACCOUNTS[4]).setApprovalForAll(CONTRACT.address, false);
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, EMPTY_ADDRESS, ethers.utils.parseEther('5'), 1
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
        1, NFT_CONTRACT.address, EMPTY_ADDRESS, ethers.utils.parseEther('5'), 1
      ).should.be.rejectedWith('You are not the owner of this item');
    });
    it('create market sale - direct', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, ACCOUNTS[5].address, ethers.utils.parseEther('5'), 0
      );

      const nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(CONTRACT.address);

      const item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.seller).to.be.equal(ACCOUNTS[4].address);
      expect(item.collectionId).to.be.equal(1);
      expect(item.tokenId).to.be.equal(1);
      expect(item.contractAddress).to.be.equal(NFT_CONTRACT.address);
      expect(ethers.utils.formatEther(item.price)).to.be.equal('5.0');
      expect(item.buyer).to.be.equal(ACCOUNTS[5].address);
      expect(item.commission).to.be.equal(0);
      expect(item.creator).to.be.equal(EMPTY_ADDRESS);
      expect(item.sold).to.be.false;
      expect(item.active).to.be.true;

      const sale = await CONTRACT.connect(ACCOUNTS[4]).getSale(item.id);
      expect(sale.saleType).to.be.equal(0);
    });
    it('create market sale - immediate', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, ACCOUNTS[5].address, ethers.utils.parseEther('5'), 1
      );

      const nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(CONTRACT.address);

      const item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.seller).to.be.equal(ACCOUNTS[4].address);
      expect(item.collectionId).to.be.equal(1);
      expect(item.tokenId).to.be.equal(1);
      expect(item.contractAddress).to.be.equal(NFT_CONTRACT.address);
      expect(ethers.utils.formatEther(item.price)).to.be.equal('5.0');
      expect(item.buyer).to.be.equal(EMPTY_ADDRESS);
      expect(item.commission).to.be.equal(0);
      expect(item.creator).to.be.equal(EMPTY_ADDRESS);
      expect(item.sold).to.be.false;
      expect(item.active).to.be.true;

      const sale = await CONTRACT.connect(ACCOUNTS[4]).getSale(item.id);
      expect(sale.saleType).to.be.equal(1);
    });
    it('create market sale - auction', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, ACCOUNTS[5].address, ethers.utils.parseEther('5'), 2
      );

      const nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(CONTRACT.address);

      const item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.seller).to.be.equal(ACCOUNTS[4].address);
      expect(item.collectionId).to.be.equal(1);
      expect(item.tokenId).to.be.equal(1);
      expect(item.contractAddress).to.be.equal(NFT_CONTRACT.address);
      expect(ethers.utils.formatEther(item.price)).to.be.equal('5.0');
      expect(item.buyer).to.be.equal(EMPTY_ADDRESS);
      expect(item.commission).to.be.equal(0);
      expect(item.creator).to.be.equal(EMPTY_ADDRESS);
      expect(item.sold).to.be.false;
      expect(item.active).to.be.true;

      const sale = await CONTRACT.connect(ACCOUNTS[4]).getSale(item.id);
      expect(sale.saleType).to.be.equal(2);
    });

    it('cancel market sale - item does not exist', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).cancelMarketSale(1)
        .should.be.rejectedWith('The item does not exist');
    });
    it('cancel market sale - item already sold', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, ACCOUNTS[5].address, ethers.utils.parseEther('5'), 0
      );

      let item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.sold).to.be.false;
      let balance = await BANK_CONTRACT.connect(ACCOUNTS[4]).getGeneralUserAccount(ACCOUNTS[4].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      let nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(CONTRACT.address);

      await CONTRACT.connect(ACCOUNTS[5]).completeMarketSale(1, { value: ethers.utils.parseEther('5') });

      item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.sold).to.be.true;
      balance = await BANK_CONTRACT.connect(ACCOUNTS[4]).getGeneralUserAccount(ACCOUNTS[4].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('5.0');
      nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(ACCOUNTS[5].address);

      await CONTRACT.connect(ACCOUNTS[4]).cancelMarketSale(1)
        .should.be.rejectedWith('This item has already been sold');
    });
    it('cancel market sale - item inactive', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, EMPTY_ADDRESS, ethers.utils.parseEther('5'), 1
      );
      await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[0]).deactivateItem(1);

      await CONTRACT.connect(ACCOUNTS[4]).cancelMarketSale(1)
        .should.be.rejectedWith('This item is inactive');
    });
    it('cancel market sale - not item owner', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, EMPTY_ADDRESS, ethers.utils.parseEther('5'), 1
      );
      await CONTRACT.connect(ACCOUNTS[5]).cancelMarketSale(1)
        .should.be.rejectedWith('You are not the original owner of this item');
    });
    it('cancel market sale - direct', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, EMPTY_ADDRESS, ethers.utils.parseEther('5'), 0
      );

      let item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.active).to.be.true;
      let nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(CONTRACT.address);

      await CONTRACT.connect(ACCOUNTS[4]).cancelMarketSale(1);

      item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.active).to.be.false;
      nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(ACCOUNTS[4].address);
    });
    it('cancel market sale - immediate', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, EMPTY_ADDRESS, ethers.utils.parseEther('5'), 1
      );

      let item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.active).to.be.true;
      let nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(CONTRACT.address);

      await CONTRACT.connect(ACCOUNTS[4]).cancelMarketSale(1);

      item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.active).to.be.false;
      nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(ACCOUNTS[4].address);
    });
    it('cancel market sale - auction', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, EMPTY_ADDRESS, ethers.utils.parseEther('5'), 2
      );

      let item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.active).to.be.true;
      let nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(CONTRACT.address);

      await CONTRACT.connect(ACCOUNTS[4]).cancelMarketSale(1);

      item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.active).to.be.false;
      nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(ACCOUNTS[4].address);
    });

    it('complete market sale - item does not exist', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).completeMarketSale(1)
        .should.be.rejectedWith('The item does not exist');
    });
    it('complete market sale - item already sold', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, ACCOUNTS[5].address, ethers.utils.parseEther('5'), 0
      );

      let item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.sold).to.be.false;
      let balance = await BANK_CONTRACT.connect(ACCOUNTS[4]).getGeneralUserAccount(ACCOUNTS[4].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      let nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(CONTRACT.address);

      await CONTRACT.connect(ACCOUNTS[5]).completeMarketSale(1, { value: ethers.utils.parseEther('5') });

      item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.sold).to.be.true;
      balance = await BANK_CONTRACT.connect(ACCOUNTS[4]).getGeneralUserAccount(ACCOUNTS[4].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('5.0');
      nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(ACCOUNTS[5].address);

      await CONTRACT.connect(ACCOUNTS[5]).completeMarketSale(1, { value: ethers.utils.parseEther('5') })
        .should.be.rejectedWith('This item has already been sold');
    });
    it('complete market sale - item inactive', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, EMPTY_ADDRESS, ethers.utils.parseEther('5'), 1
      );
      await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[0]).deactivateItem(1);

      await CONTRACT.connect(ACCOUNTS[4]).completeMarketSale(1)
        .should.be.rejectedWith('This item is inactive');
    });
    it('complete market sale - not enough funds', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, EMPTY_ADDRESS, ethers.utils.parseEther('5'), 1
      );
      await CONTRACT.connect(ACCOUNTS[4]).completeMarketSale(1, { value: ethers.utils.parseEther('1') })
        .should.be.rejectedWith('Not enough funds to purchase this item');
    });
    it('complete market sale - buy own item', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, EMPTY_ADDRESS, ethers.utils.parseEther('5'), 1
      );
      await CONTRACT.connect(ACCOUNTS[4]).completeMarketSale(1, { value: ethers.utils.parseEther('5') })
        .should.be.rejectedWith('You can not buy your own item');
    });
    it('complete market sale - direct - buyer not authorized', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, ACCOUNTS[5].address, ethers.utils.parseEther('5'), 0
      );
      await CONTRACT.connect(ACCOUNTS[6]).completeMarketSale(1, { value: ethers.utils.parseEther('5') })
        .should.be.rejectedWith('You are not the authorized buyer');
    });
    it('complete market sale - invalid sale type', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, ACCOUNTS[5].address, ethers.utils.parseEther('5'), 3
      ).should.be.rejectedWith('Transaction reverted: function was called with incorrect parameters');;
    });
    it('complete market sale - direct - sale price 0', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, ACCOUNTS[5].address, ethers.utils.parseEther('0'), 0
      );

      let item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.sold).to.be.false;
      let balance = await BANK_CONTRACT.connect(ACCOUNTS[4]).getGeneralUserAccount(ACCOUNTS[4].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      let nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(CONTRACT.address);

      await CONTRACT.connect(ACCOUNTS[5]).completeMarketSale(1, { value: ethers.utils.parseEther('0') });

      item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.sold).to.be.true;
      balance = await BANK_CONTRACT.connect(ACCOUNTS[4]).getGeneralUserAccount(ACCOUNTS[4].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(ACCOUNTS[5].address);
    });
    it('complete market sale - direct', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, ACCOUNTS[5].address, ethers.utils.parseEther('5'), 0
      );

      let item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.sold).to.be.false;
      let balance = await BANK_CONTRACT.connect(ACCOUNTS[4]).getGeneralUserAccount(ACCOUNTS[4].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      let nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(CONTRACT.address);

      await CONTRACT.connect(ACCOUNTS[5]).completeMarketSale(1, { value: ethers.utils.parseEther('5') });

      item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.sold).to.be.true;
      balance = await BANK_CONTRACT.connect(ACCOUNTS[4]).getGeneralUserAccount(ACCOUNTS[4].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('5.0');
      nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(ACCOUNTS[5].address);
    });
    it('complete market sale - immediate - no market incentive', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, ACCOUNTS[5].address, ethers.utils.parseEther('5'), 1
      );

      let item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.sold).to.be.false;
      let balance = await BANK_CONTRACT.connect(ACCOUNTS[4]).getGeneralUserAccount(ACCOUNTS[4].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      let nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(CONTRACT.address);

      await CONTRACT.connect(ACCOUNTS[5]).completeMarketSale(1, { value: ethers.utils.parseEther('5') });

      item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.sold).to.be.true;
      balance = await BANK_CONTRACT.connect(ACCOUNTS[4]).getGeneralUserAccount(ACCOUNTS[4].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('4.9');
      nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(ACCOUNTS[5].address);
    });
    it('complete market sale - immediate - yes market incentive', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).depositMarketplaceIncentiveVault({ value: ethers.utils.parseEther('100') });
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, ACCOUNTS[5].address, ethers.utils.parseEther('5'), 1
      );

      let item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.sold).to.be.false;
      let balance = await BANK_CONTRACT.connect(ACCOUNTS[4]).getGeneralUserAccount(ACCOUNTS[4].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      let nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(CONTRACT.address);

      await CONTRACT.connect(ACCOUNTS[5]).completeMarketSale(1, { value: ethers.utils.parseEther('5') });

      item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.sold).to.be.true;
      balance = await BANK_CONTRACT.connect(ACCOUNTS[4]).getGeneralUserAccount(ACCOUNTS[4].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('6.9');
      nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(ACCOUNTS[5].address);
    });
  });

  describe('Main Functions - Local', async () => {
    beforeEach(async () => {
      contractFactory = await ethers.getContractFactory("AvaxTradeNft");
      NFT_CONTRACT = await contractFactory.deploy('Local AvaxTrade', 'LAX', 'ipfs://cid/');
      await NFT_CONTRACT.deployed();

      await NFT_CONTRACT.connect(ACCOUNTS[4]).mint(1, 2, { value: ethers.utils.parseEther('0.50') });
      await NFT_CONTRACT.connect(ACCOUNTS[4]).setApprovalForAll(CONTRACT.address, true);

      await CONTRACT.connect(ACCOUNTS[0]).createLocalCollection(
        'collection name', NFT_CONTRACT.address
      );
    });

    it('create market sale - no permission', async () => {
      await NFT_CONTRACT.connect(ACCOUNTS[4]).setApprovalForAll(CONTRACT.address, false);
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, EMPTY_ADDRESS, ethers.utils.parseEther('5'), 1
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
        1, NFT_CONTRACT.address, EMPTY_ADDRESS, ethers.utils.parseEther('5'), 1
      ).should.be.rejectedWith('You are not the owner of this item');
    });
    it('create market sale - direct', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, ACCOUNTS[5].address, ethers.utils.parseEther('5'), 0
      );

      const nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(CONTRACT.address);

      const item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.seller).to.be.equal(ACCOUNTS[4].address);
      expect(item.collectionId).to.be.equal(2);
      expect(item.tokenId).to.be.equal(1);
      expect(item.contractAddress).to.be.equal(NFT_CONTRACT.address);
      expect(ethers.utils.formatEther(item.price)).to.be.equal('5.0');
      expect(item.buyer).to.be.equal(ACCOUNTS[5].address);
      expect(item.commission).to.be.equal(2);
      expect(item.creator).to.be.equal(ACCOUNTS[4].address);
      expect(item.sold).to.be.false;
      expect(item.active).to.be.true;

      const sale = await CONTRACT.connect(ACCOUNTS[4]).getSale(item.id);
      expect(sale.saleType).to.be.equal(0);
    });
    it('create market sale - immediate', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, ACCOUNTS[5].address, ethers.utils.parseEther('5'), 1
      );

      const nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(CONTRACT.address);

      const item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.seller).to.be.equal(ACCOUNTS[4].address);
      expect(item.collectionId).to.be.equal(2);
      expect(item.tokenId).to.be.equal(1);
      expect(item.contractAddress).to.be.equal(NFT_CONTRACT.address);
      expect(ethers.utils.formatEther(item.price)).to.be.equal('5.0');
      expect(item.buyer).to.be.equal(EMPTY_ADDRESS);
      expect(item.commission).to.be.equal(2);
      expect(item.creator).to.be.equal(ACCOUNTS[4].address);
      expect(item.sold).to.be.false;
      expect(item.active).to.be.true;

      const sale = await CONTRACT.connect(ACCOUNTS[4]).getSale(item.id);
      expect(sale.saleType).to.be.equal(1);
    });
    it('create market sale - auction', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, ACCOUNTS[5].address, ethers.utils.parseEther('5'), 2
      );

      const nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(CONTRACT.address);

      const item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.seller).to.be.equal(ACCOUNTS[4].address);
      expect(item.collectionId).to.be.equal(2);
      expect(item.tokenId).to.be.equal(1);
      expect(item.contractAddress).to.be.equal(NFT_CONTRACT.address);
      expect(ethers.utils.formatEther(item.price)).to.be.equal('5.0');
      expect(item.buyer).to.be.equal(EMPTY_ADDRESS);
      expect(item.commission).to.be.equal(2);
      expect(item.creator).to.be.equal(ACCOUNTS[4].address);
      expect(item.sold).to.be.false;
      expect(item.active).to.be.true;

      const sale = await CONTRACT.connect(ACCOUNTS[4]).getSale(item.id);
      expect(sale.saleType).to.be.equal(2);
    });

    it('cancel market sale - item does not exist', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).cancelMarketSale(1)
        .should.be.rejectedWith('The item does not exist');
    });
    it('cancel market sale - item already sold', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, ACCOUNTS[5].address, ethers.utils.parseEther('5'), 0
      );

      let item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.sold).to.be.false;
      let balance = await BANK_CONTRACT.connect(ACCOUNTS[4]).getGeneralUserAccount(ACCOUNTS[4].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      let nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(CONTRACT.address);

      await CONTRACT.connect(ACCOUNTS[5]).completeMarketSale(1, { value: ethers.utils.parseEther('5') });

      item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.sold).to.be.true;
      balance = await BANK_CONTRACT.connect(ACCOUNTS[4]).getGeneralUserAccount(ACCOUNTS[4].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('5.0');
      nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(ACCOUNTS[5].address);

      await CONTRACT.connect(ACCOUNTS[4]).cancelMarketSale(1)
        .should.be.rejectedWith('This item has already been sold');
    });
    it('cancel market sale - item inactive', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, EMPTY_ADDRESS, ethers.utils.parseEther('5'), 1
      );
      await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[0]).deactivateItem(1);

      await CONTRACT.connect(ACCOUNTS[4]).cancelMarketSale(1)
        .should.be.rejectedWith('This item is inactive');
    });
    it('cancel market sale - not item owner', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, EMPTY_ADDRESS, ethers.utils.parseEther('5'), 1
      );
      await CONTRACT.connect(ACCOUNTS[5]).cancelMarketSale(1)
        .should.be.rejectedWith('You are not the original owner of this item');
    });
    it('cancel market sale - direct', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, EMPTY_ADDRESS, ethers.utils.parseEther('5'), 0
      );

      let item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.active).to.be.true;
      let nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(CONTRACT.address);

      await CONTRACT.connect(ACCOUNTS[4]).cancelMarketSale(1);

      item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.active).to.be.false;
      nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(ACCOUNTS[4].address);
    });
    it('cancel market sale - immediate', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, EMPTY_ADDRESS, ethers.utils.parseEther('5'), 1
      );

      let item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.active).to.be.true;
      let nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(CONTRACT.address);

      await CONTRACT.connect(ACCOUNTS[4]).cancelMarketSale(1);

      item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.active).to.be.false;
      nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(ACCOUNTS[4].address);
    });
    it('cancel market sale - auction', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, EMPTY_ADDRESS, ethers.utils.parseEther('5'), 2
      );

      let item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.active).to.be.true;
      let nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(CONTRACT.address);

      await CONTRACT.connect(ACCOUNTS[4]).cancelMarketSale(1);

      item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.active).to.be.false;
      nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(ACCOUNTS[4].address);
    });

    it('complete market sale - item does not exist', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).completeMarketSale(1)
        .should.be.rejectedWith('The item does not exist');
    });
    it('complete market sale - item already sold', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, ACCOUNTS[5].address, ethers.utils.parseEther('5'), 0
      );

      let item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.sold).to.be.false;
      let balance = await BANK_CONTRACT.connect(ACCOUNTS[4]).getGeneralUserAccount(ACCOUNTS[4].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      let nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(CONTRACT.address);

      await CONTRACT.connect(ACCOUNTS[5]).completeMarketSale(1, { value: ethers.utils.parseEther('5') });

      item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.sold).to.be.true;
      balance = await BANK_CONTRACT.connect(ACCOUNTS[4]).getGeneralUserAccount(ACCOUNTS[4].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('5.0');
      nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(ACCOUNTS[5].address);

      await CONTRACT.connect(ACCOUNTS[5]).completeMarketSale(1, { value: ethers.utils.parseEther('5') })
        .should.be.rejectedWith('This item has already been sold');
    });
    it('complete market sale - item inactive', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, EMPTY_ADDRESS, ethers.utils.parseEther('5'), 1
      );
      await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[0]).deactivateItem(1);

      await CONTRACT.connect(ACCOUNTS[4]).completeMarketSale(1)
        .should.be.rejectedWith('This item is inactive');
    });
    it('complete market sale - not enough funds', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, EMPTY_ADDRESS, ethers.utils.parseEther('5'), 1
      );
      await CONTRACT.connect(ACCOUNTS[4]).completeMarketSale(1, { value: ethers.utils.parseEther('1') })
        .should.be.rejectedWith('Not enough funds to purchase this item');
    });
    it('complete market sale - buy own item', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, EMPTY_ADDRESS, ethers.utils.parseEther('5'), 1
      );
      await CONTRACT.connect(ACCOUNTS[4]).completeMarketSale(1, { value: ethers.utils.parseEther('5') })
        .should.be.rejectedWith('You can not buy your own item');
    });
    it('complete market sale - direct - buyer not authorized', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, ACCOUNTS[5].address, ethers.utils.parseEther('5'), 0
      );
      await CONTRACT.connect(ACCOUNTS[6]).completeMarketSale(1, { value: ethers.utils.parseEther('5') })
        .should.be.rejectedWith('You are not the authorized buyer');
    });
    it('complete market sale - invalid sale type', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, ACCOUNTS[5].address, ethers.utils.parseEther('5'), 3
      ).should.be.rejectedWith('Transaction reverted: function was called with incorrect parameters');;
    });
    it('complete market sale - direct - sale price 0', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, ACCOUNTS[5].address, ethers.utils.parseEther('0'), 0
      );

      let item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.sold).to.be.false;
      let balance = await BANK_CONTRACT.connect(ACCOUNTS[4]).getGeneralUserAccount(ACCOUNTS[4].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      let nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(CONTRACT.address);

      await CONTRACT.connect(ACCOUNTS[5]).completeMarketSale(1, { value: ethers.utils.parseEther('0') });

      item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.sold).to.be.true;
      balance = await BANK_CONTRACT.connect(ACCOUNTS[4]).getGeneralUserAccount(ACCOUNTS[4].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(ACCOUNTS[5].address);
    });
    it('complete market sale - direct', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, ACCOUNTS[5].address, ethers.utils.parseEther('5'), 0
      );

      let item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.sold).to.be.false;
      let balance = await BANK_CONTRACT.connect(ACCOUNTS[4]).getGeneralUserAccount(ACCOUNTS[4].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      let nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(CONTRACT.address);

      await CONTRACT.connect(ACCOUNTS[5]).completeMarketSale(1, { value: ethers.utils.parseEther('5') });

      item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.sold).to.be.true;
      balance = await BANK_CONTRACT.connect(ACCOUNTS[4]).getGeneralUserAccount(ACCOUNTS[4].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('5.0');
      nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(ACCOUNTS[5].address);
    });
    it('complete market sale - immediate - -2%, -2%', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, ACCOUNTS[5].address, ethers.utils.parseEther('5'), 1
      );

      let item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.sold).to.be.false;
      let balance = await BANK_CONTRACT.connect(ACCOUNTS[4]).getGeneralUserAccount(ACCOUNTS[4].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      let nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(CONTRACT.address);

      await CONTRACT.connect(ACCOUNTS[5]).completeMarketSale(1, { value: ethers.utils.parseEther('5') });

      item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.sold).to.be.true;
      balance = await BANK_CONTRACT.connect(ACCOUNTS[4]).getGeneralUserAccount(ACCOUNTS[4].address);
      let expectedBalance = ethers.utils.parseEther('5');
      expectedBalance = expectedBalance - (expectedBalance*0.02); // marketplace commission
      expectedBalance = expectedBalance - (expectedBalance*0.02); // artist commission
      expectedBalance = expectedBalance + (ethers.utils.parseEther('100')*0.00); // marketplace incentive
      expectedBalance = ethers.utils.formatEther(expectedBalance.toString()); // convert to proper form
      expect(ethers.utils.formatEther(balance)).to.be.equal(expectedBalance);
      nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(ACCOUNTS[5].address);
    });
    it('complete market sale - immediate - -2%, -2%, +2', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, ACCOUNTS[5].address, ethers.utils.parseEther('5'), 1
      );

      let item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.sold).to.be.false;
      let balance = await BANK_CONTRACT.connect(ACCOUNTS[4]).getGeneralUserAccount(ACCOUNTS[4].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      let nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(CONTRACT.address);

      await CONTRACT.connect(ACCOUNTS[0]).depositMarketplaceIncentiveVault({ value: ethers.utils.parseEther('100') });
      await CONTRACT.connect(ACCOUNTS[5]).completeMarketSale(1, { value: ethers.utils.parseEther('5') });

      item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.sold).to.be.true;
      balance = await BANK_CONTRACT.connect(ACCOUNTS[4]).getGeneralUserAccount(ACCOUNTS[4].address);
      let expectedBalance = ethers.utils.parseEther('5');
      expectedBalance = expectedBalance - (expectedBalance*0.02); // marketplace commission
      expectedBalance = expectedBalance - (expectedBalance*0.02); // artist commission
      expectedBalance = expectedBalance + (ethers.utils.parseEther('100')*0.02); // marketplace incentive
      expectedBalance = ethers.utils.formatEther(expectedBalance.toString()); // convert to proper form
      expect(ethers.utils.formatEther(balance)).to.be.equal(expectedBalance);
      nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(ACCOUNTS[5].address);
    });
  });

  describe('Main Functions - Verified', async () => {
    beforeEach(async () => {
      contractFactory = await ethers.getContractFactory("SampleErc721");
      NFT_CONTRACT = await contractFactory.deploy();
      await NFT_CONTRACT.deployed();

      await NFT_CONTRACT.connect(ACCOUNTS[4]).mint(ACCOUNTS[4].address, 1, { value: ethers.utils.parseEther('0.50') });
      await NFT_CONTRACT.connect(ACCOUNTS[4]).setApprovalForAll(CONTRACT.address, true);

      await CONTRACT.connect(ACCOUNTS[0]).createVerifiedCollection(
        'collection name', NFT_CONTRACT.address, 5, 2, 3, ACCOUNTS[4].address, false
      );
    });

    it('create market sale - no permission', async () => {
      await NFT_CONTRACT.connect(ACCOUNTS[4]).setApprovalForAll(CONTRACT.address, false);
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, EMPTY_ADDRESS, ethers.utils.parseEther('5'), 1
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
        1, NFT_CONTRACT.address, EMPTY_ADDRESS, ethers.utils.parseEther('5'), 1
      ).should.be.rejectedWith('You are not the owner of this item');
    });
    it('create market sale - direct', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, ACCOUNTS[5].address, ethers.utils.parseEther('5'), 0
      );

      const nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(CONTRACT.address);

      const item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.seller).to.be.equal(ACCOUNTS[4].address);
      expect(item.collectionId).to.be.equal(2);
      expect(item.tokenId).to.be.equal(1);
      expect(item.contractAddress).to.be.equal(NFT_CONTRACT.address);
      expect(ethers.utils.formatEther(item.price)).to.be.equal('5.0');
      expect(item.buyer).to.be.equal(ACCOUNTS[5].address);
      expect(item.commission).to.be.equal(0);
      expect(item.creator).to.be.equal(EMPTY_ADDRESS);
      expect(item.sold).to.be.false;
      expect(item.active).to.be.true;

      const sale = await CONTRACT.connect(ACCOUNTS[4]).getSale(item.id);
      expect(sale.saleType).to.be.equal(0);
    });
    it('create market sale - immediate', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, ACCOUNTS[5].address, ethers.utils.parseEther('5'), 1
      );

      const nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(CONTRACT.address);

      const item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.seller).to.be.equal(ACCOUNTS[4].address);
      expect(item.collectionId).to.be.equal(2);
      expect(item.tokenId).to.be.equal(1);
      expect(item.contractAddress).to.be.equal(NFT_CONTRACT.address);
      expect(ethers.utils.formatEther(item.price)).to.be.equal('5.0');
      expect(item.buyer).to.be.equal(EMPTY_ADDRESS);
      expect(item.commission).to.be.equal(0);
      expect(item.creator).to.be.equal(EMPTY_ADDRESS);
      expect(item.sold).to.be.false;
      expect(item.active).to.be.true;

      const sale = await CONTRACT.connect(ACCOUNTS[4]).getSale(item.id);
      expect(sale.saleType).to.be.equal(1);
    });
    it('create market sale - auction', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, ACCOUNTS[5].address, ethers.utils.parseEther('5'), 2
      );

      const nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(CONTRACT.address);

      const item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.seller).to.be.equal(ACCOUNTS[4].address);
      expect(item.collectionId).to.be.equal(2);
      expect(item.tokenId).to.be.equal(1);
      expect(item.contractAddress).to.be.equal(NFT_CONTRACT.address);
      expect(ethers.utils.formatEther(item.price)).to.be.equal('5.0');
      expect(item.buyer).to.be.equal(EMPTY_ADDRESS);
      expect(item.commission).to.be.equal(0);
      expect(item.creator).to.be.equal(EMPTY_ADDRESS);
      expect(item.sold).to.be.false;
      expect(item.active).to.be.true;

      const sale = await CONTRACT.connect(ACCOUNTS[4]).getSale(item.id);
      expect(sale.saleType).to.be.equal(2);
    });

    it('cancel market sale - item does not exist', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).cancelMarketSale(1)
        .should.be.rejectedWith('The item does not exist');
    });
    it('cancel market sale - item already sold', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, ACCOUNTS[5].address, ethers.utils.parseEther('5'), 0
      );

      let item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.sold).to.be.false;
      let balance = await BANK_CONTRACT.connect(ACCOUNTS[4]).getGeneralUserAccount(ACCOUNTS[4].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      let nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(CONTRACT.address);

      await CONTRACT.connect(ACCOUNTS[5]).completeMarketSale(1, { value: ethers.utils.parseEther('5') });

      item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.sold).to.be.true;
      balance = await BANK_CONTRACT.connect(ACCOUNTS[4]).getGeneralUserAccount(ACCOUNTS[4].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('5.0');
      nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(ACCOUNTS[5].address);

      await CONTRACT.connect(ACCOUNTS[4]).cancelMarketSale(1)
        .should.be.rejectedWith('This item has already been sold');
    });
    it('cancel market sale - item inactive', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, EMPTY_ADDRESS, ethers.utils.parseEther('5'), 1
      );
      await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[0]).deactivateItem(1);

      await CONTRACT.connect(ACCOUNTS[4]).cancelMarketSale(1)
        .should.be.rejectedWith('This item is inactive');
    });
    it('cancel market sale - not item owner', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, EMPTY_ADDRESS, ethers.utils.parseEther('5'), 1
      );
      await CONTRACT.connect(ACCOUNTS[5]).cancelMarketSale(1)
        .should.be.rejectedWith('You are not the original owner of this item');
    });
    it('cancel market sale - direct', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, EMPTY_ADDRESS, ethers.utils.parseEther('5'), 0
      );

      let item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.active).to.be.true;
      let nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(CONTRACT.address);

      await CONTRACT.connect(ACCOUNTS[4]).cancelMarketSale(1);

      item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.active).to.be.false;
      nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(ACCOUNTS[4].address);
    });
    it('cancel market sale - immediate', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, EMPTY_ADDRESS, ethers.utils.parseEther('5'), 1
      );

      let item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.active).to.be.true;
      let nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(CONTRACT.address);

      await CONTRACT.connect(ACCOUNTS[4]).cancelMarketSale(1);

      item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.active).to.be.false;
      nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(ACCOUNTS[4].address);
    });
    it('cancel market sale - auction', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, EMPTY_ADDRESS, ethers.utils.parseEther('5'), 2
      );

      let item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.active).to.be.true;
      let nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(CONTRACT.address);

      await CONTRACT.connect(ACCOUNTS[4]).cancelMarketSale(1);

      item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.active).to.be.false;
      nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(ACCOUNTS[4].address);
    });

    it('complete market sale - item does not exist', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).completeMarketSale(1)
        .should.be.rejectedWith('The item does not exist');
    });
    it('complete market sale - item already sold', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, ACCOUNTS[5].address, ethers.utils.parseEther('5'), 0
      );

      let item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.sold).to.be.false;
      let balance = await BANK_CONTRACT.connect(ACCOUNTS[4]).getGeneralUserAccount(ACCOUNTS[4].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      let nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(CONTRACT.address);

      await CONTRACT.connect(ACCOUNTS[5]).completeMarketSale(1, { value: ethers.utils.parseEther('5') });

      item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.sold).to.be.true;
      balance = await BANK_CONTRACT.connect(ACCOUNTS[4]).getGeneralUserAccount(ACCOUNTS[4].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('5.0');
      nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(ACCOUNTS[5].address);

      await CONTRACT.connect(ACCOUNTS[5]).completeMarketSale(1, { value: ethers.utils.parseEther('5') })
        .should.be.rejectedWith('This item has already been sold');
    });
    it('complete market sale - item inactive', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, EMPTY_ADDRESS, ethers.utils.parseEther('5'), 1
      );
      await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[0]).deactivateItem(1);

      await CONTRACT.connect(ACCOUNTS[4]).completeMarketSale(1)
        .should.be.rejectedWith('This item is inactive');
    });
    it('complete market sale - not enough funds', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, EMPTY_ADDRESS, ethers.utils.parseEther('5'), 1
      );
      await CONTRACT.connect(ACCOUNTS[4]).completeMarketSale(1, { value: ethers.utils.parseEther('1') })
        .should.be.rejectedWith('Not enough funds to purchase this item');
    });
    it('complete market sale - buy own item', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, EMPTY_ADDRESS, ethers.utils.parseEther('5'), 1
      );
      await CONTRACT.connect(ACCOUNTS[4]).completeMarketSale(1, { value: ethers.utils.parseEther('5') })
        .should.be.rejectedWith('You can not buy your own item');
    });
    it('complete market sale - direct - buyer not authorized', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, ACCOUNTS[5].address, ethers.utils.parseEther('5'), 0
      );
      await CONTRACT.connect(ACCOUNTS[6]).completeMarketSale(1, { value: ethers.utils.parseEther('5') })
        .should.be.rejectedWith('You are not the authorized buyer');
    });
    it('complete market sale - invalid sale type', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, ACCOUNTS[5].address, ethers.utils.parseEther('5'), 3
      ).should.be.rejectedWith('Transaction reverted: function was called with incorrect parameters');;
    });
    it('complete market sale - direct - sale price 0', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, ACCOUNTS[5].address, ethers.utils.parseEther('0'), 0
      );

      let item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.sold).to.be.false;
      let balance = await BANK_CONTRACT.connect(ACCOUNTS[4]).getGeneralUserAccount(ACCOUNTS[4].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      let nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(CONTRACT.address);

      await CONTRACT.connect(ACCOUNTS[5]).completeMarketSale(1, { value: ethers.utils.parseEther('0') });

      item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.sold).to.be.true;
      balance = await BANK_CONTRACT.connect(ACCOUNTS[4]).getGeneralUserAccount(ACCOUNTS[4].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(ACCOUNTS[5].address);
    });
    it('complete market sale - direct', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, ACCOUNTS[5].address, ethers.utils.parseEther('5'), 0
      );

      let item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.sold).to.be.false;
      let balance = await BANK_CONTRACT.connect(ACCOUNTS[4]).getGeneralUserAccount(ACCOUNTS[4].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      let nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(CONTRACT.address);

      await CONTRACT.connect(ACCOUNTS[5]).completeMarketSale(1, { value: ethers.utils.parseEther('5') });

      item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.sold).to.be.true;
      balance = await BANK_CONTRACT.connect(ACCOUNTS[4]).getGeneralUserAccount(ACCOUNTS[4].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('5.0');
      nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(ACCOUNTS[5].address);
    });
    it('complete market sale - immediate - -2%, -0%, -0%', async () => {
      await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).updateCollection(
        2, 'collection name', NFT_CONTRACT.address, 0, 0, 0, ACCOUNTS[4].address
      );
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, ACCOUNTS[5].address, ethers.utils.parseEther('5'), 1
      );

      let item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.sold).to.be.false;
      let balance = await BANK_CONTRACT.connect(ACCOUNTS[4]).getGeneralUserAccount(ACCOUNTS[4].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      let nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(CONTRACT.address);

      await CONTRACT.connect(ACCOUNTS[5]).completeMarketSale(1, { value: ethers.utils.parseEther('5') });

      item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.sold).to.be.true;
      balance = await BANK_CONTRACT.connect(ACCOUNTS[4]).getGeneralUserAccount(ACCOUNTS[4].address);
      let expectedBalance = ethers.utils.parseEther('5');
      expectedBalance = expectedBalance - (expectedBalance*0.02); // marketplace commission
      expectedBalance = expectedBalance - (expectedBalance*0.00); // collection reflection
      expectedBalance = expectedBalance - (expectedBalance*0.00); // collection commission
      expectedBalance = expectedBalance + (expectedBalance*0.00); // collection incentive
      expectedBalance = expectedBalance + (expectedBalance*0.00); // marketplace incentive
      expectedBalance = ethers.utils.formatEther(expectedBalance.toString()); // convert to proper form
      expect(ethers.utils.formatEther(balance)).to.be.equal(expectedBalance);
      nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(ACCOUNTS[5].address);
    });
    it('complete market sale - immediate - -2%, -7%, -0%', async () => {
      await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).updateCollection(
        2, 'collection name', NFT_CONTRACT.address, 7, 0, 0, ACCOUNTS[4].address
      );
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, ACCOUNTS[5].address, ethers.utils.parseEther('5'), 1
      );

      let item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.sold).to.be.false;
      let balance = await BANK_CONTRACT.connect(ACCOUNTS[4]).getGeneralUserAccount(ACCOUNTS[4].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      let nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(CONTRACT.address);

      await CONTRACT.connect(ACCOUNTS[5]).completeMarketSale(1, { value: ethers.utils.parseEther('5') });

      item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.sold).to.be.true;
      balance = await BANK_CONTRACT.connect(ACCOUNTS[4]).getGeneralUserAccount(ACCOUNTS[4].address);
      let expectedBalance = ethers.utils.parseEther('5');
      expectedBalance = expectedBalance - (expectedBalance*0.02); // marketplace commission
      expectedBalance = expectedBalance - (expectedBalance*0.07); // collection reflection
      expectedBalance = expectedBalance - (expectedBalance*0.00); // collection commission
      expectedBalance = expectedBalance + (expectedBalance*0.00); // collection incentive
      expectedBalance = expectedBalance + (expectedBalance*0.00); // marketplace incentive
      expectedBalance = ethers.utils.formatEther(expectedBalance.toString()); // convert to proper form
      expect(ethers.utils.formatEther(balance)).to.be.equal(expectedBalance);
      nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(ACCOUNTS[5].address);
    });
    it('complete market sale - immediate - -2%, -0%, -5%', async () => {
      await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).updateCollection(
        2, 'collection name', NFT_CONTRACT.address, 0, 5, 0, ACCOUNTS[4].address
      );
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, ACCOUNTS[5].address, ethers.utils.parseEther('5'), 1
      );

      let item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.sold).to.be.false;
      let balance = await BANK_CONTRACT.connect(ACCOUNTS[4]).getGeneralUserAccount(ACCOUNTS[4].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      let nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(CONTRACT.address);

      await CONTRACT.connect(ACCOUNTS[5]).completeMarketSale(1, { value: ethers.utils.parseEther('5') });

      item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.sold).to.be.true;
      balance = await BANK_CONTRACT.connect(ACCOUNTS[4]).getGeneralUserAccount(ACCOUNTS[4].address);
      let expectedBalance = ethers.utils.parseEther('5');
      expectedBalance = expectedBalance - (expectedBalance*0.02); // marketplace commission
      expectedBalance = expectedBalance - (expectedBalance*0.00); // collection reflection
      expectedBalance = expectedBalance - (expectedBalance*0.05); // collection commission
      expectedBalance = expectedBalance + (expectedBalance*0.00); // collection incentive
      expectedBalance = expectedBalance + (expectedBalance*0.00); // marketplace incentive
      expectedBalance = ethers.utils.formatEther(expectedBalance.toString()); // convert to proper form
      expect(ethers.utils.formatEther(balance)).to.be.equal(expectedBalance);
      nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(ACCOUNTS[5].address);
    });
    it('complete market sale - immediate - -2%, -2%, -3%', async () => {
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, ACCOUNTS[5].address, ethers.utils.parseEther('5'), 1
      );

      let item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.sold).to.be.false;
      let balance = await BANK_CONTRACT.connect(ACCOUNTS[4]).getGeneralUserAccount(ACCOUNTS[4].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      let nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(CONTRACT.address);

      await CONTRACT.connect(ACCOUNTS[5]).completeMarketSale(1, { value: ethers.utils.parseEther('5') });

      item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.sold).to.be.true;
      balance = await BANK_CONTRACT.connect(ACCOUNTS[4]).getGeneralUserAccount(ACCOUNTS[4].address);
      let expectedBalance = ethers.utils.parseEther('5');
      expectedBalance = expectedBalance - (expectedBalance*0.02); // marketplace commission
      expectedBalance = expectedBalance - (expectedBalance*0.02); // collection reflection
      expectedBalance = expectedBalance - (expectedBalance*0.03); // collection commission
      expectedBalance = expectedBalance + (expectedBalance*0.00); // collection incentive
      expectedBalance = expectedBalance + (expectedBalance*0.00); // marketplace incentive
      expectedBalance = ethers.utils.formatEther(expectedBalance.toString()); // convert to proper form
      expect(ethers.utils.formatEther(balance)).to.be.equal(expectedBalance);
      nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(ACCOUNTS[5].address);
    });
    it('complete market sale - immediate - -2%, -2%, -4%, +3', async () => {
      await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).updateCollection(
        2, 'collection name', NFT_CONTRACT.address, 2, 4, 3, ACCOUNTS[4].address
      );
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, ACCOUNTS[5].address, ethers.utils.parseEther('5'), 1
      );

      let item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.sold).to.be.false;
      let balance = await BANK_CONTRACT.connect(ACCOUNTS[4]).getGeneralUserAccount(ACCOUNTS[4].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      let nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(CONTRACT.address);

      await CONTRACT.connect(ACCOUNTS[0]).depositIncentiveCollectionAccount(NFT_CONTRACT.address, { value: ethers.utils.parseEther('10') });
      await CONTRACT.connect(ACCOUNTS[5]).completeMarketSale(1, { value: ethers.utils.parseEther('5') });

      item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.sold).to.be.true;
      balance = await BANK_CONTRACT.connect(ACCOUNTS[4]).getGeneralUserAccount(ACCOUNTS[4].address);
      let expectedBalance = ethers.utils.parseEther('5');
      expectedBalance = expectedBalance - (expectedBalance*0.02); // marketplace commission
      expectedBalance = expectedBalance - (expectedBalance*0.02); // collection reflection
      expectedBalance = expectedBalance - (expectedBalance*0.04); // collection commission
      expectedBalance = expectedBalance + (ethers.utils.parseEther('10')*0.03); // collection incentive
      expectedBalance = expectedBalance + (ethers.utils.parseEther('0')*0.00); // marketplace incentive
      expectedBalance = ethers.utils.formatEther(expectedBalance.toString()); // convert to proper form
      expect(ethers.utils.formatEther(balance)).to.be.equal(expectedBalance);
      nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(ACCOUNTS[5].address);
    });
    it('complete market sale - immediate - -2%, -2%, -4%, +3, +2', async () => {
      await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).updateCollection(
        2, 'collection name', NFT_CONTRACT.address, 2, 4, 3, ACCOUNTS[4].address
      );
      await CONTRACT.connect(ACCOUNTS[4]).createMarketSale(
        1, NFT_CONTRACT.address, ACCOUNTS[5].address, ethers.utils.parseEther('5'), 1
      );

      let item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.sold).to.be.false;
      let balance = await BANK_CONTRACT.connect(ACCOUNTS[4]).getGeneralUserAccount(ACCOUNTS[4].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      let nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(CONTRACT.address);

      await CONTRACT.connect(ACCOUNTS[0]).depositIncentiveCollectionAccount(NFT_CONTRACT.address, { value: ethers.utils.parseEther('10') });
      await CONTRACT.connect(ACCOUNTS[0]).depositMarketplaceIncentiveVault({ value: ethers.utils.parseEther('100') });
      await CONTRACT.connect(ACCOUNTS[5]).completeMarketSale(1, { value: ethers.utils.parseEther('5') });

      item = await COLLECTION_ITEM_CONTRACT.connect(ACCOUNTS[4]).getItemOfOwner(1, NFT_CONTRACT.address, ACCOUNTS[4].address);
      expect(item.sold).to.be.true;
      balance = await BANK_CONTRACT.connect(ACCOUNTS[4]).getGeneralUserAccount(ACCOUNTS[4].address);
      let expectedBalance = ethers.utils.parseEther('5');
      expectedBalance = expectedBalance - (expectedBalance*0.02); // marketplace commission
      expectedBalance = expectedBalance - (expectedBalance*0.02); // collection reflection
      expectedBalance = expectedBalance - (expectedBalance*0.04); // collection commission
      expectedBalance = expectedBalance + (ethers.utils.parseEther('10')*0.03); // collection incentive
      expectedBalance = expectedBalance + (ethers.utils.parseEther('100')*0.02); // marketplace incentive
      expectedBalance = ethers.utils.formatEther(expectedBalance.toString()); // convert to proper form
      expect(ethers.utils.formatEther(balance)).to.be.equal(expectedBalance);
      nftOwner = await NFT_CONTRACT.connect(ACCOUNTS[4]).ownerOf(1);
      expect(nftOwner).to.be.equal(ACCOUNTS[5].address);
    });
  });

  // describe('Reward Functions', async () => {

  //   it('marketplace commission', async () => {
  //     const result = await CONTRACT.connect(ACCOUNTS[4]).callStatic.marketplaceCommission(ethers.utils.parseEther('10'), 2);
  //     expect(ethers.utils.formatEther(result)).to.be.equal('9.8');
  //   });
  //   it('marketplace commission - 0%', async () => {
  //     const result = await CONTRACT.connect(ACCOUNTS[4]).callStatic.marketplaceCommission(ethers.utils.parseEther('10'), 0);
  //     expect(ethers.utils.formatEther(result)).to.be.equal('10.0');
  //   });

  //   it('nft commission', async () => {
  //     const result = await CONTRACT.connect(ACCOUNTS[4]).callStatic.nftCommission(ethers.utils.parseEther('10'), 2, ACCOUNTS[4].address);
  //     expect(ethers.utils.formatEther(result)).to.be.equal('9.8');
  //   });
  //   it('nft commission - 0%', async () => {
  //     const result = await CONTRACT.connect(ACCOUNTS[4]).callStatic.nftCommission(ethers.utils.parseEther('10'), 0, ACCOUNTS[4].address);
  //     expect(ethers.utils.formatEther(result)).to.be.equal('10.0');
  //   });

  //   it('collection reflection', async () => {
  //     await CONTRACT.connect(ACCOUNTS[0]).createVerifiedCollection(
  //       'collection name', ACCOUNTS[5].address, 10, 0, 0, ACCOUNTS[4].address, false
  //     );
  //     const result = await CONTRACT.connect(ACCOUNTS[4]).callStatic.collectionReflection(ethers.utils.parseEther('10'), 2, ACCOUNTS[5].address, 10);
  //     expect(ethers.utils.formatEther(result)).to.be.equal('9.8');
  //   });
  //   it('collection reflection - 0%', async () => {
  //     const result = await CONTRACT.connect(ACCOUNTS[4]).callStatic.collectionReflection(ethers.utils.parseEther('10'), 0, ACCOUNTS[5].address, 10);
  //     expect(ethers.utils.formatEther(result)).to.be.equal('10.0');
  //   });

  //   it('collection commission', async () => {
  //     const result = await CONTRACT.connect(ACCOUNTS[4]).callStatic.collectionCommission(ethers.utils.parseEther('10'), 2, ACCOUNTS[4].address);
  //     expect(ethers.utils.formatEther(result)).to.be.equal('9.8');
  //   });
  //   it('collection commission - 0%', async () => {
  //     const result = await CONTRACT.connect(ACCOUNTS[4]).callStatic.collectionCommission(ethers.utils.parseEther('10'), 0, ACCOUNTS[4].address);
  //     expect(ethers.utils.formatEther(result)).to.be.equal('10.0');
  //   });

  //   it('collection incentive', async () => {
  //     await CONTRACT.connect(ACCOUNTS[0]).createVerifiedCollection(
  //       'collection name', ACCOUNTS[5].address, 10, 0, 0, ACCOUNTS[4].address, false
  //     );
  //     await CONTRACT.connect(ACCOUNTS[0]).depositIncentiveCollectionAccount(ACCOUNTS[5].address, { value: ethers.utils.parseEther('10') });
  //     const result = await CONTRACT.connect(ACCOUNTS[4]).callStatic.collectionIncentive(ethers.utils.parseEther('10'), 2, ACCOUNTS[5].address);
  //     expect(ethers.utils.formatEther(result)).to.be.equal('10.2');
  //   });
  //   it('collection incentive - 0%', async () => {
  //     await CONTRACT.connect(ACCOUNTS[0]).createVerifiedCollection(
  //       'collection name', ACCOUNTS[5].address, 10, 0, 0, ACCOUNTS[4].address, false
  //     );
  //     await CONTRACT.connect(ACCOUNTS[0]).depositIncentiveCollectionAccount(ACCOUNTS[5].address, { value: ethers.utils.parseEther('10') });
  //     const result = await CONTRACT.connect(ACCOUNTS[4]).callStatic.collectionIncentive(ethers.utils.parseEther('10'), 0, ACCOUNTS[5].address);
  //     expect(ethers.utils.formatEther(result)).to.be.equal('10.0');
  //   });

  //   it('marketplace incentive', async () => {
  //     await CONTRACT.connect(ACCOUNTS[0]).depositMarketplaceIncentiveVault({ value: ethers.utils.parseEther('10') });
  //     const result = await CONTRACT.connect(ACCOUNTS[4]).callStatic.marketplaceIncentive(ethers.utils.parseEther('10'), 2);
  //     expect(ethers.utils.formatEther(result)).to.be.equal('10.2');
  //   });
  //   it('marketplace incentive - 0%', async () => {
  //     await CONTRACT.connect(ACCOUNTS[0]).depositMarketplaceIncentiveVault({ value: ethers.utils.parseEther('10') });
  //     const result = await CONTRACT.connect(ACCOUNTS[4]).callStatic.marketplaceIncentive(ethers.utils.parseEther('10'), 0);
  //     expect(ethers.utils.formatEther(result)).to.be.equal('10.0');
  //   });
  // });

});
