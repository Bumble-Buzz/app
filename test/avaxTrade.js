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

describe("AvaxTrade - Main", () => {
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

  describe('Create market sale', async () => {
    beforeEach(async () => {
      await CONTRACT.connect(ACCOUNTS[0]).createLocalCollection(
        'collection name', ACCOUNTS[1].address
      );
      await CONTRACT.connect(ACCOUNTS[0]).createVerifiedCollection(
        'collection name', ACCOUNTS[2].address, 100, 2, 3, ACCOUNTS[3].address
      );
    });

    it('unverified - direct', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).createMarketSale(
        2, ACCOUNTS[5].address, ACCOUNTS[6].address, ethers.utils.parseEther('10'), 0
      );
    });

  });

});
