const _ = require('lodash');
const { assert, expect } = require('chai');
require('chai').use(require('chai-as-promised')).should();
const { ethers } = require("hardhat");


// global variables
let ACCOUNTS = [];
let CONTRACT;
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

describe("AvaxTrade - Market", () => {
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

  describe('Collection items', async () => {
    // mapping(uint256 => uint256[]) private COLLECTION_ITEMS;

    it('get items in collection', async () => {
      const result = await CONTRACT.connect(ACCOUNTS[0])._getItemIdsInCollection(1);
      expect(result).to.be.an('array').that.is.empty;
    });
    it('add item in collection', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemIdInCollection(1, 123);
      const result = await CONTRACT.connect(ACCOUNTS[0])._getItemIdsInCollection(1);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(_doesArrayEqual(result, [ethers.BigNumber.from('123')])).to.be.true;
    });
    it('remove item in collection - one item', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemIdInCollection(1, 123);

      let result = await CONTRACT.connect(ACCOUNTS[0])._getItemIdsInCollection(1);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(_doesArrayEqual(result, [ethers.BigNumber.from('123')])).to.be.true;

      await CONTRACT.connect(ACCOUNTS[0])._removeItemIdInCollection(1, 123);

      result = await CONTRACT.connect(ACCOUNTS[0])._getItemIdsInCollection(1);
      expect(result).to.be.an('array').that.is.empty;
    });
    it('remove item in collection - two items', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemIdInCollection(1, 123);
      await CONTRACT.connect(ACCOUNTS[0])._addItemIdInCollection(1, 456);

      let result = await CONTRACT.connect(ACCOUNTS[0])._getItemIdsInCollection(1);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(_doesArrayInclude(result, ethers.BigNumber.from('123'))).to.be.true;
      expect(_doesArrayInclude(result, ethers.BigNumber.from('456'))).to.be.true;

      await CONTRACT.connect(ACCOUNTS[0])._removeItemIdInCollection(1, 123);

      result = await CONTRACT.connect(ACCOUNTS[0])._getItemIdsInCollection(1);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(_doesArrayInclude(result, ethers.BigNumber.from('456'))).to.be.true;
    });
    it('remove collection item', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemIdInCollection(1, 123);
      await CONTRACT.connect(ACCOUNTS[0])._addItemIdInCollection(1, 456);

      let result = await CONTRACT.connect(ACCOUNTS[0])._getItemIdsInCollection(1);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(_doesArrayInclude(result, ethers.BigNumber.from('123'))).to.be.true;
      expect(_doesArrayInclude(result, ethers.BigNumber.from('456'))).to.be.true;

      await CONTRACT.connect(ACCOUNTS[0])._removeCollectionItem(1);

      result = await CONTRACT.connect(ACCOUNTS[0])._getItemIdsInCollection(1);
      expect(result).to.be.an('array').that.is.empty;
    });
  });

});
