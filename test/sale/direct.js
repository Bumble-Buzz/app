const _ = require('lodash');
const { assert, expect } = require('chai');
require('chai').use(require('chai-as-promised')).should();
const { ethers } = require("hardhat");


// global variables
let ACCOUNTS = [];
let CONTRACT;

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
describe("AvaxTrade - Direct", () => {
  before(async () => {
    ACCOUNTS = await ethers.getSigners();
  });

  beforeEach(async () => {
    const contractFactory = await ethers.getContractFactory("Sale");
    CONTRACT = await contractFactory.deploy();
    await CONTRACT.deployed();
  });

  it('deploys successfully', async () => {
    const address = await CONTRACT.address;
    assert.notEqual(address, '');
    assert.notEqual(address, 0x0);
  });

  describe('Total direct sales', async () => {
    // uint256[] private TOTAL_DIRECT_SALES;

    it('get total direct sales', async () => {
      const result = await CONTRACT.connect(ACCOUNTS[0])._getTotalDirectSale();
      expect(result).to.be.an('array').that.is.empty;
    });
    it('add total direct sales', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addTotalDirectSale(123);
      const result = await CONTRACT.connect(ACCOUNTS[0])._getTotalDirectSale();
      expect(result).to.be.an('array').that.is.not.empty;
      expect(_doesArrayEqual(result, [ethers.BigNumber.from('123')])).to.be.true;
    });
    it('remove total direct sale - one item', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._createDirectSale(ACCOUNTS[1].address, 123);

      let result = await CONTRACT.connect(ACCOUNTS[0])._getTotalDirectSale();
      expect(result).to.be.an('array').that.is.not.empty;
      expect(_doesArrayEqual(result, [ethers.BigNumber.from('123')])).to.be.true;

      await CONTRACT.connect(ACCOUNTS[0])._removeTotalDirectSale(123);

      result = await CONTRACT.connect(ACCOUNTS[0])._getTotalDirectSale();
      expect(result).to.be.an('array').that.is.empty;
    });
    it('remove total direct sale - two items', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._createDirectSale(ACCOUNTS[1].address, 123);
      await CONTRACT.connect(ACCOUNTS[0])._createDirectSale(ACCOUNTS[1].address, 456);

      let result = await CONTRACT.connect(ACCOUNTS[0])._getTotalDirectSale();
      expect(result).to.be.an('array').that.is.not.empty;
      expect(_doesArrayEqual(result, [ethers.BigNumber.from('123'),ethers.BigNumber.from('456')])).to.be.true;

      await CONTRACT.connect(ACCOUNTS[0])._removeTotalDirectSale(123);

      result = await CONTRACT.connect(ACCOUNTS[0])._getTotalDirectSale();
      expect(result).to.be.an('array').that.is.not.empty;
      expect(_doesArrayInclude(result, ethers.BigNumber.from('456'))).to.be.true;
    });
  });

  describe('Main functions', async () => {
    // mapping(address => uint256[]) private DIRECT_SALES;

    it('get item ids', async () => {
      const result = await CONTRACT.connect(ACCOUNTS[0])._getDirectSaleItemIds(ACCOUNTS[1].address);
      expect(result).to.be.an('array').that.is.empty;
    });
    it('get total item ids', async () => {
      const result = await CONTRACT.connect(ACCOUNTS[0])._getTotalDirectSaleItemIds();
      expect(result).to.be.an('array').that.is.empty;
    });
    it('get item ids count', async () => {
      const result = await CONTRACT.connect(ACCOUNTS[0])._getDirectSaleCount(ACCOUNTS[1].address);
      expect(result).to.be.equal(0);
    });
    it('get total item ids count', async () => {
      const result = await CONTRACT.connect(ACCOUNTS[0])._getTotalDirectSaleCount();
      expect(result).to.be.equal(0);
    });

    it('item id does not exist', async () => {
      expect(await CONTRACT.connect(ACCOUNTS[0])._doesDirectSaleItemIdExists(ACCOUNTS[1].address, 123)).to.be.false;
    });
    it('item id does exist', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._createDirectSale(ACCOUNTS[1].address, 123);
      expect(await CONTRACT.connect(ACCOUNTS[0])._doesDirectSaleItemIdExists(ACCOUNTS[1].address, 123)).to.be.true;
    });

    it('create sale', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._createDirectSale(ACCOUNTS[1].address, 123);
      expect(await CONTRACT.connect(ACCOUNTS[0])._getDirectSaleCount(ACCOUNTS[1].address)).to.be.equal(1);
      expect(await CONTRACT.connect(ACCOUNTS[0])._getTotalDirectSaleCount()).to.be.equal(1);

      let result = await CONTRACT.connect(ACCOUNTS[0])._getDirectSaleItemIds(ACCOUNTS[1].address);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result[0]).to.be.equal(123);
    });
    it('create sale - multiple items - same user', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._createDirectSale(ACCOUNTS[1].address, 123);
      await CONTRACT.connect(ACCOUNTS[0])._createDirectSale(ACCOUNTS[1].address, 456);

      expect(await CONTRACT.connect(ACCOUNTS[0])._getDirectSaleCount(ACCOUNTS[1].address)).to.be.equal(2);
      expect(await CONTRACT.connect(ACCOUNTS[0])._getTotalDirectSaleCount()).to.be.equal(2);

      let result = await CONTRACT.connect(ACCOUNTS[0])._getDirectSaleItemIds(ACCOUNTS[1].address);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result[0]).to.be.equal(123);
      expect(result[1]).to.be.equal(456);

      result = await CONTRACT.connect(ACCOUNTS[0])._getTotalDirectSaleItemIds();
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result[0]).to.be.equal(123);
      expect(result[1]).to.be.equal(456);
    });
    it('create sale - multiple items - different user', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._createDirectSale(ACCOUNTS[1].address, 123);
      await CONTRACT.connect(ACCOUNTS[0])._createDirectSale(ACCOUNTS[2].address, 456);

      expect(await CONTRACT.connect(ACCOUNTS[0])._getDirectSaleCount(ACCOUNTS[1].address)).to.be.equal(1);
      expect(await CONTRACT.connect(ACCOUNTS[0])._getDirectSaleCount(ACCOUNTS[2].address)).to.be.equal(1);
      expect(await CONTRACT.connect(ACCOUNTS[0])._getTotalDirectSaleCount()).to.be.equal(2);

      let result = await CONTRACT.connect(ACCOUNTS[0])._getDirectSaleItemIds(ACCOUNTS[1].address);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result[0]).to.be.equal(123);

      result = await CONTRACT.connect(ACCOUNTS[0])._getDirectSaleItemIds(ACCOUNTS[2].address);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result[0]).to.be.equal(456);

      result = await CONTRACT.connect(ACCOUNTS[0])._getTotalDirectSaleItemIds();
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result[0]).to.be.equal(123);
      expect(result[1]).to.be.equal(456);
    });

    it('remove sale', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._createDirectSale(ACCOUNTS[1].address, 123);
      await CONTRACT.connect(ACCOUNTS[0])._createDirectSale(ACCOUNTS[1].address, 456);
      await CONTRACT.connect(ACCOUNTS[0])._createDirectSale(ACCOUNTS[1].address, 789);

      expect(await CONTRACT.connect(ACCOUNTS[0])._getDirectSaleCount(ACCOUNTS[1].address)).to.be.equal(3);
      expect(await CONTRACT.connect(ACCOUNTS[0])._getTotalDirectSaleCount()).to.be.equal(3);

      let result = await CONTRACT.connect(ACCOUNTS[0])._getDirectSaleItemIds(ACCOUNTS[1].address);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result[0]).to.be.equal(123);
      expect(result[1]).to.be.equal(456);
      expect(result[2]).to.be.equal(789);

      result = await CONTRACT.connect(ACCOUNTS[0])._getTotalDirectSaleItemIds();
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result[0]).to.be.equal(123);
      expect(result[1]).to.be.equal(456);
      expect(result[2]).to.be.equal(789);

      await CONTRACT.connect(ACCOUNTS[0])._removeDirectSale(ACCOUNTS[1].address, 456);

      expect(await CONTRACT.connect(ACCOUNTS[0])._getDirectSaleCount(ACCOUNTS[1].address)).to.be.equal(2);
      expect(await CONTRACT.connect(ACCOUNTS[0])._getTotalDirectSaleCount()).to.be.equal(2);

      result = await CONTRACT.connect(ACCOUNTS[0])._getDirectSaleItemIds(ACCOUNTS[1].address);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result[0]).to.be.equal(123);
      expect(result[1]).to.be.equal(789);

      result = await CONTRACT.connect(ACCOUNTS[0])._getTotalDirectSaleItemIds();
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result[0]).to.be.equal(123);
      expect(result[1]).to.be.equal(789);
    });
    it('remove sale - invalid item id', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._createDirectSale(ACCOUNTS[1].address, 123);
      await CONTRACT.connect(ACCOUNTS[0])._createDirectSale(ACCOUNTS[1].address, 456);
      await CONTRACT.connect(ACCOUNTS[0])._createDirectSale(ACCOUNTS[1].address, 789);

      expect(await CONTRACT.connect(ACCOUNTS[0])._getDirectSaleCount(ACCOUNTS[1].address)).to.be.equal(3);
      expect(await CONTRACT.connect(ACCOUNTS[0])._getTotalDirectSaleCount()).to.be.equal(3);

      let result = await CONTRACT.connect(ACCOUNTS[0])._getDirectSaleItemIds(ACCOUNTS[1].address);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result[0]).to.be.equal(123);
      expect(result[1]).to.be.equal(456);
      expect(result[2]).to.be.equal(789);

      result = await CONTRACT.connect(ACCOUNTS[0])._getTotalDirectSaleItemIds();
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result[0]).to.be.equal(123);
      expect(result[1]).to.be.equal(456);
      expect(result[2]).to.be.equal(789);

      await CONTRACT.connect(ACCOUNTS[0])._removeDirectSale(ACCOUNTS[1].address, 111)
      .should.be.rejectedWith('This item is not a direct sale');
    });
  });
});
