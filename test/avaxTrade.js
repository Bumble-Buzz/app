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

  // describe('Collection reflection vault', async () => {
  //   // mapping(uint256 => uint256[]) private COLLECTION_REFLECTION_VAULT;

  //   it('get collection reflection vault', async () => {
  //     const result = await CONTRACT.connect(ACCOUNTS[0])._getCollectionReflectionVault(1);
  //     expect(result.length).to.be.equal(0);
  //   });
  //   it('add collection reflection vault', async () => {
  //     await CONTRACT.connect(ACCOUNTS[0])._addCollectionReflectionVault(1, 100);
  //     const result = await CONTRACT.connect(ACCOUNTS[0])._getCollectionReflectionVault(1);
  //     expect(result.length).to.be.equal(100);
  //   });
  //   it('nullify collection reflection vault', async () => {
  //     await CONTRACT.connect(ACCOUNTS[0])._addCollectionReflectionVault(1, 100);

  //     let result = await CONTRACT.connect(ACCOUNTS[0])._getCollectionReflectionVault(1);
  //     expect(result.length).to.be.equal(100);

  //     result = await CONTRACT.connect(ACCOUNTS[0])._getCollectionReflectionVaultIndex(1, 5);
  //     expect(result).to.be.equal(0);

  //     await CONTRACT.connect(ACCOUNTS[0])._increaseCollectionReflectionVault(1, 2);
  //     result = await CONTRACT.connect(ACCOUNTS[0])._getCollectionReflectionVaultIndex(1, 5);
  //     expect(result).to.be.equal(2);

  //     await CONTRACT.connect(ACCOUNTS[0])._nullifyCollectionReflectionVault(1);
  //     result = await CONTRACT.connect(ACCOUNTS[0])._getCollectionReflectionVaultIndex(1, 5);
  //     expect(result).to.be.equal(0);
  //   });
  // });



  // it('get collection reflection vault', async () => {
  //   expect((await CONTRACT.connect(ACCOUNTS[0])._getCollectionReflectionVault(2)).length).to.be.equal(100);
  // });
  // it('update collection reflection vault', async () => {
  //   let vault = await CONTRACT.connect(ACCOUNTS[0])._getCollectionReflectionVault(2);
  //   expect(vault[0]).to.be.equal(0);
  //   expect(vault[1]).to.be.equal(0);
  //   expect(vault[5]).to.be.equal(0);
  //   expect(vault[99]).to.be.equal(0);
  //   await CONTRACT.connect(ACCOUNTS[0])._increaseCollectionReflectionVault(2, 5);
  //   vault = await CONTRACT.connect(ACCOUNTS[0])._getCollectionReflectionVault(2);
  //   expect(vault[0]).to.be.equal(5);
  //   expect(vault[1]).to.be.equal(5);
  //   expect(vault[5]).to.be.equal(5);
  //   expect(vault[99]).to.be.equal(5);
  //   await CONTRACT.connect(ACCOUNTS[0])._increaseCollectionReflectionVault(2, 2);
  //   vault = await CONTRACT.connect(ACCOUNTS[0])._getCollectionReflectionVault(2);
  //   expect(vault[0]).to.be.equal(7);
  //   expect(vault[1]).to.be.equal(7);
  //   expect(vault[5]).to.be.equal(7);
  //   expect(vault[99]).to.be.equal(7);
  // });
  // it('update collection reflection single vault', async () => {
  //   let vault = await CONTRACT.connect(ACCOUNTS[0])._getCollectionReflectionVault(2);
  //   expect(vault[0]).to.be.equal(0);
  //   expect(vault[1]).to.be.equal(0);
  //   expect(vault[5]).to.be.equal(0);
  //   expect(vault[99]).to.be.equal(0);
  //   await CONTRACT.connect(ACCOUNTS[0])._increaseCollectionReflectionVault(2, 5);
  //   vault = await CONTRACT.connect(ACCOUNTS[0])._getCollectionReflectionVault(2);
  //   expect(vault[0]).to.be.equal(5);
  //   expect(vault[1]).to.be.equal(5);
  //   expect(vault[5]).to.be.equal(5);
  //   expect(vault[99]).to.be.equal(5);
  //   await CONTRACT.connect(ACCOUNTS[0])._updateCollectionReflectionVaultIndex(2, 5, 0);
  //   vault = await CONTRACT.connect(ACCOUNTS[0])._getCollectionReflectionVault(2);
  //   expect(vault[0]).to.be.equal(5);
  //   expect(vault[1]).to.be.equal(5);
  //   expect(vault[5]).to.be.equal(0);
  //   expect(vault[99]).to.be.equal(5);
  // });

});
