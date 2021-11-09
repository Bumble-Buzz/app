const _ = require('lodash');
const { assert, expect } = require('chai');
require('chai').use(require('chai-as-promised')).should();
const { ethers } = require("hardhat");


// global variables
let ACCOUNTS = [];
let CONTRACT;

// global functions
const _doItemIdsInclude = (_itemIds, _identifier = {}) => {
  const foundDna = _itemIds.find((itemId) => {
      return _.isEqual(itemId, _identifier);
  });
  return foundDna == undefined ? false : true;
};
const _doItemIdsEqual = (_itemIds, expectedArray = []) => {
  return _(_itemIds).differenceWith(expectedArray, _.isEqual).isEmpty();
};

describe("AvaxTrade - MarketItem", () => {
  before(async () => {
    ACCOUNTS = await ethers.getSigners();
  });

  beforeEach(async () => {
    const contractFactory = await ethers.getContractFactory("AvaxTrade");
    CONTRACT = await contractFactory.deploy();
    await CONTRACT.deployed();
  });

  it('deploys successfully', async () => {
    const address = await CONTRACT.address;
    assert.notEqual(address, '');
    assert.notEqual(address, 0x0);
  });

  it('owner', async () => {
    const owner = await CONTRACT.owner();
    expect(owner).to.be.equal(ACCOUNTS[0].address);
  });

  describe('item', async () => {
    it('item does not exist', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._getItem(1)
        .should.be.rejectedWith('The item does not exist');
      const itemIds = await CONTRACT.connect(ACCOUNTS[0])._getItemIds();
      expect(itemIds.length).to.be.equal(0);
    });

    it('add empty item', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addEmptyItem();
      const items = await CONTRACT.connect(ACCOUNTS[0])._getItem(1);
      expect(items[0]).to.be.equal('1');
      const itemIds = await CONTRACT.connect(ACCOUNTS[0])._getItemIds();
      expect(itemIds.length).to.be.equal(1);
    });

    it('add full item', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItem(
        123, 456, ACCOUNTS[2].address, ACCOUNTS[3].address, 100, 2, ACCOUNTS[4].address, 1
      );
      const items = await CONTRACT.connect(ACCOUNTS[0])._getItem(1);
      expect(items[0]).to.be.equal('1');
      expect(items[1]).to.be.equal('123');
      expect(items[2]).to.be.equal('456');
      expect(items[3]).to.be.equal(ACCOUNTS[2].address);
      expect(items[4]).to.be.equal(ACCOUNTS[3].address);
      expect(items[5]).to.be.equal('0x0000000000000000000000000000000000000000');
      expect(items[6]).to.be.equal('100');
      expect(items[7]).to.be.equal(2);
      expect(items[8]).to.be.equal(ACCOUNTS[4].address);
      expect(items[9]).to.be.equal(1);
      expect(items[10]).to.be.equal(false);
      const itemIds = await CONTRACT.connect(ACCOUNTS[0])._getItemIds();
      expect(itemIds.length).to.be.equal(1);
    });

    it('add two items', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItem(
        123, 456, ACCOUNTS[2].address, ACCOUNTS[3].address, 100, 2, ACCOUNTS[4].address, 1
      );
      await CONTRACT.connect(ACCOUNTS[0])._addItem(
        890, 678, ACCOUNTS[2].address, ACCOUNTS[3].address, 200, 3, ACCOUNTS[4].address, 1
      );
      const itemIds = await CONTRACT.connect(ACCOUNTS[0])._getItemIds();
      expect(itemIds.length).to.be.equal(2);
      expect(itemIds[0]).to.be.equal(1);
      expect(itemIds[1]).to.be.equal(2);
      const expectedArray = [ethers.BigNumber.from('1'), ethers.BigNumber.from('2')]
      expect(_doItemIdsEqual(itemIds, expectedArray)).to.be.true;
      expect(_doItemIdsInclude(itemIds, ethers.BigNumber.from('1'))).to.be.true;
      expect(_doItemIdsInclude(itemIds, ethers.BigNumber.from('2'))).to.be.true;

      const items = await CONTRACT.connect(ACCOUNTS[0])._getAllItems();
      expect(items.length).to.be.equal(2);
      expect(items[0].collectionId).to.be.equal('123');
      expect(items[1].collectionId).to.be.equal('890');
      expect(items[0].tokenId).to.be.equal('456');
      expect(items[1].tokenId).to.be.equal('678');
    });

    it('delete item', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItem(
        123, 456, ACCOUNTS[2].address, ACCOUNTS[3].address, 100, 2, ACCOUNTS[4].address, 1
      );
      const items = await CONTRACT.connect(ACCOUNTS[0])._getItem(1);
      expect(items[0]).to.be.equal('1');
      let itemIds = await CONTRACT.connect(ACCOUNTS[0])._getItemIds();
      expect(itemIds.length).to.be.equal(1);
      expect(itemIds[0]).to.be.equal(1);

      await CONTRACT.connect(ACCOUNTS[0])._removeItem(1);

      await CONTRACT.connect(ACCOUNTS[0])._getItem(1)
        .should.be.rejectedWith('The item does not exist');
      itemIds = await CONTRACT.connect(ACCOUNTS[0])._getItemIds();
      expect(itemIds.length).to.be.equal(0);
    });
  });

  describe('item properties', async () => {
    beforeEach(async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItem(
        123, 456, ACCOUNTS[2].address, ACCOUNTS[3].address, 100, 2, ACCOUNTS[4].address, 1
      );
    });

    it('collection id', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._updateItemCollectionId(1, 222);
      const items = await CONTRACT.connect(ACCOUNTS[0])._getItem(1);
      expect(items[1]).to.be.equal('222');
    });

    it('token id', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._updateItemTokenId(1, 222);
      const items = await CONTRACT.connect(ACCOUNTS[0])._getItem(1);
      expect(items[2]).to.be.equal('222');
    });

    it('contract address', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._updateItemContractAddress(1, ACCOUNTS[5].address);
      const items = await CONTRACT.connect(ACCOUNTS[0])._getItem(1);
      expect(items[3]).to.be.equal(ACCOUNTS[5].address);
    });

    it('seller', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._updateItemSeller(1, ACCOUNTS[5].address);
      const items = await CONTRACT.connect(ACCOUNTS[0])._getItem(1);
      expect(items[4]).to.be.equal(ACCOUNTS[5].address);
    });

    it('buyer', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._updateItemBuyer(1, ACCOUNTS[5].address);
      const items = await CONTRACT.connect(ACCOUNTS[0])._getItem(1);
      expect(items[5]).to.be.equal(ACCOUNTS[5].address);
    });

    it('price', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._updateItemPrice(1, 222);
      const items = await CONTRACT.connect(ACCOUNTS[0])._getItem(1);
      expect(items[6]).to.be.equal('222');
    });

    it('commission', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._updateItemCommission(1, 222);
      const items = await CONTRACT.connect(ACCOUNTS[0])._getItem(1);
      expect(items[7]).to.be.equal(222);
    });

    it('creator', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._updateItemCreator(1, ACCOUNTS[5].address);
      const items = await CONTRACT.connect(ACCOUNTS[0])._getItem(1);
      expect(items[8]).to.be.equal(ACCOUNTS[5].address);
    });

    it('sale type', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._updateItemSaleType(1, 2);
      const items = await CONTRACT.connect(ACCOUNTS[0])._getItem(1);
      expect(items[9]).to.be.equal(2);
    });

    it('sold', async () => {
      let itemIds = await CONTRACT.connect(ACCOUNTS[0])._getItemIds();
      expect(itemIds.length).to.be.equal(1);
      expect(_doItemIdsInclude(itemIds, ethers.BigNumber.from('1'))).to.be.true;

      await CONTRACT.connect(ACCOUNTS[0])._updateItemSold(1, true);
      const items = await CONTRACT.connect(ACCOUNTS[0])._getItem(1);
      expect(items[10]).to.be.equal(true);

      itemIds = await CONTRACT.connect(ACCOUNTS[0])._getItemIds();
      expect(itemIds.length).to.be.equal(0);
    });
  });

});
