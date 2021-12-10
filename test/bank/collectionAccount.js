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
describe("AvaxTrade - Collection Account", () => {
  before(async () => {
    ACCOUNTS = await ethers.getSigners();
  });

  beforeEach(async () => {
    const contractFactory = await ethers.getContractFactory("Bank");
    CONTRACT = await contractFactory.deploy();
    await CONTRACT.deployed();
  });

  it('deploys successfully', async () => {
    const address = await CONTRACT.address;
    assert.notEqual(address, '');
    assert.notEqual(address, 0x0);
  });

  describe('Main functions', async () => {
    // {
    //   address id; // owner of these collection accounts (contract address)
    //   uint256[] reflectionVault; //reflection fewards for each token id
    //   uint256 incentiveVault; // collection reward vault given upon completion of market sale
    // }

    it('get accounts', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._getCollectionAccounts([ACCOUNTS[1].address, ACCOUNTS[2].address])
        .should.be.rejectedWith('An account in the list does not exist');
    });
    it('get account 1 - does not exist', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._getCollectionAccount(ACCOUNTS[1].address)
        .should.be.rejectedWith('The account for this collection does not exist');
    });

    it('add account', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addCollectionAccount(ACCOUNTS[1].address);

      const account = await CONTRACT.connect(ACCOUNTS[0])._getCollectionAccount(ACCOUNTS[1].address);
      expect(account.id).to.be.equal(ACCOUNTS[1].address);
      expect(account.reflectionVault).to.be.an('array').that.is.empty;
      expect(account.incentiveVault).to.be.equal(0);
    });
    it('add multiple same accounts', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addCollectionAccount(ACCOUNTS[1].address);
      await CONTRACT.connect(ACCOUNTS[0])._addCollectionAccount(ACCOUNTS[1].address);

      const account = await CONTRACT.connect(ACCOUNTS[0])._getCollectionAccount(ACCOUNTS[1].address);
      expect(account.id).to.be.equal(ACCOUNTS[1].address);
      expect(account.reflectionVault).to.be.an('array').that.is.empty;
      expect(account.incentiveVault).to.be.equal(0);
    });
    it('add multiple different accounts', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addCollectionAccount(ACCOUNTS[1].address);
      await CONTRACT.connect(ACCOUNTS[0])._addCollectionAccount(ACCOUNTS[2].address);

      let account = await CONTRACT.connect(ACCOUNTS[0])._getCollectionAccount(ACCOUNTS[1].address);
      expect(account.id).to.be.equal(ACCOUNTS[1].address);
      expect(account.reflectionVault).to.be.an('array').that.is.empty;
      expect(account.incentiveVault).to.be.equal(0);
      account = await CONTRACT.connect(ACCOUNTS[0])._getCollectionAccount(ACCOUNTS[2].address);
      expect(account.id).to.be.equal(ACCOUNTS[2].address);
      expect(account.reflectionVault).to.be.an('array').that.is.empty;
      expect(account.incentiveVault).to.be.equal(0);

      const accounts = await CONTRACT.connect(ACCOUNTS[0])._getCollectionAccounts([ACCOUNTS[1].address, ACCOUNTS[2].address]);
      expect(accounts.length).to.be.equal(2);

      expect(accounts[0].id).to.be.equal(ACCOUNTS[1].address);
      expect(accounts[0].reflectionVault).to.be.an('array').that.is.empty;
      expect(accounts[0].incentiveVault).to.be.equal(0);

      expect(accounts[1].id).to.be.equal(ACCOUNTS[2].address);
      expect(accounts[1].reflectionVault).to.be.an('array').that.is.empty;
      expect(accounts[1].incentiveVault).to.be.equal(0);
    });

    it('update account', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addCollectionAccount(ACCOUNTS[1].address);

      let account = await CONTRACT.connect(ACCOUNTS[0])._getCollectionAccount(ACCOUNTS[1].address);
      expect(account.id).to.be.equal(ACCOUNTS[1].address);
      expect(account.reflectionVault).to.be.an('array').that.is.empty;
      expect(account.incentiveVault).to.be.equal(0);

      await CONTRACT.connect(ACCOUNTS[0])._updateCollectionAccount(ACCOUNTS[1].address, [1,2,3], 2);

      account = await CONTRACT.connect(ACCOUNTS[0])._getCollectionAccount(ACCOUNTS[1].address);
      expect(account.id).to.be.equal(ACCOUNTS[1].address);
      expect(account.reflectionVault).to.be.an('array').that.is.not.empty;
      expect(_doesArrayEqual(account.reflectionVault, [
        ethers.BigNumber.from('1'), ethers.BigNumber.from('2'), ethers.BigNumber.from('3')
      ])).to.be.true;
      expect(account.incentiveVault).to.be.equal(2);
    });
    it('update one account out of many', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addCollectionAccount(ACCOUNTS[1].address);
      await CONTRACT.connect(ACCOUNTS[0])._addCollectionAccount(ACCOUNTS[2].address);
      await CONTRACT.connect(ACCOUNTS[0])._addCollectionAccount(ACCOUNTS[3].address);

      await CONTRACT.connect(ACCOUNTS[0])._updateCollectionAccount(ACCOUNTS[1].address, [1,2,3], 2);

      const account = await CONTRACT.connect(ACCOUNTS[0])._getCollectionAccount(ACCOUNTS[1].address);
      expect(account.id).to.be.equal(ACCOUNTS[1].address);
      expect(account.reflectionVault).to.be.an('array').that.is.not.empty;
      expect(_doesArrayEqual(account.reflectionVault, [
        ethers.BigNumber.from('1'), ethers.BigNumber.from('2'), ethers.BigNumber.from('3')
      ])).to.be.true;
      expect(account.incentiveVault).to.be.equal(2);

      const accounts = await CONTRACT.connect(ACCOUNTS[0])._getCollectionAccounts(
        [ACCOUNTS[1].address, ACCOUNTS[2].address, ACCOUNTS[3].address]
      );
      expect(accounts.length).to.be.equal(3);

      expect(accounts[0].id).to.be.equal(ACCOUNTS[1].address);
      expect(accounts[0].reflectionVault).to.be.an('array').that.is.not.empty;
      expect(_doesArrayEqual(accounts[0].reflectionVault, [
        ethers.BigNumber.from('1'), ethers.BigNumber.from('2'), ethers.BigNumber.from('3')
      ])).to.be.true;
      expect(accounts[0].incentiveVault).to.be.equal(2);

      expect(accounts[1].id).to.be.equal(ACCOUNTS[2].address);
      expect(accounts[1].reflectionVault).to.be.an('array').that.is.empty;
      expect(accounts[1].incentiveVault).to.be.equal(0);

      expect(accounts[2].id).to.be.equal(ACCOUNTS[3].address);
      expect(accounts[2].reflectionVault).to.be.an('array').that.is.empty;
      expect(accounts[2].incentiveVault).to.be.equal(0);
    });
    it('update account then add same account', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addCollectionAccount(ACCOUNTS[1].address);
      await CONTRACT.connect(ACCOUNTS[0])._updateCollectionAccount(ACCOUNTS[1].address, [1,2,3], 2);

      let account = await CONTRACT.connect(ACCOUNTS[0])._getCollectionAccount(ACCOUNTS[1].address);
      expect(account.id).to.be.equal(ACCOUNTS[1].address);
      expect(account.reflectionVault).to.be.an('array').that.is.not.empty;
      expect(_doesArrayEqual(account.reflectionVault, [
        ethers.BigNumber.from('1'), ethers.BigNumber.from('2'), ethers.BigNumber.from('3')
      ])).to.be.true;
      expect(account.incentiveVault).to.be.equal(2);

      await CONTRACT.connect(ACCOUNTS[0])._addCollectionAccount(ACCOUNTS[1].address);

      account = await CONTRACT.connect(ACCOUNTS[0])._getCollectionAccount(ACCOUNTS[1].address);
      expect(account.id).to.be.equal(ACCOUNTS[1].address);
      expect(account.reflectionVault).to.be.an('array').that.is.not.empty;
      expect(_doesArrayEqual(account.reflectionVault, [
        ethers.BigNumber.from('1'), ethers.BigNumber.from('2'), ethers.BigNumber.from('3')
      ])).to.be.true;
      expect(account.incentiveVault).to.be.equal(2);
    });

    it('increment account - reflection vault not set', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addCollectionAccount(ACCOUNTS[1].address);

      let account = await CONTRACT.connect(ACCOUNTS[0])._getCollectionAccount(ACCOUNTS[1].address);
      expect(account.id).to.be.equal(ACCOUNTS[1].address);
      expect(account.reflectionVault).to.be.an('array').that.is.empty;
      expect(account.incentiveVault).to.be.equal(0);

      await CONTRACT.connect(ACCOUNTS[0])._incrementCollectionAccount(ACCOUNTS[1].address, 1, 2);

      account = await CONTRACT.connect(ACCOUNTS[0])._getCollectionAccount(ACCOUNTS[1].address);
      expect(account.id).to.be.equal(ACCOUNTS[1].address);
      expect(account.reflectionVault).to.be.an('array').that.is.empty;
      expect(account.incentiveVault).to.be.equal(2);

      await CONTRACT.connect(ACCOUNTS[0])._incrementCollectionAccount(ACCOUNTS[1].address, 3, 3);

      account = await CONTRACT.connect(ACCOUNTS[0])._getCollectionAccount(ACCOUNTS[1].address);
      expect(account.id).to.be.equal(ACCOUNTS[1].address);
      expect(account.reflectionVault).to.be.an('array').that.is.empty;
      expect(account.incentiveVault).to.be.equal(5);
    });
    it('increment account - reflection vault set', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addCollectionAccount(ACCOUNTS[1].address);
      await CONTRACT.connect(ACCOUNTS[0])._initReflectionVaultCollectionAccount(ACCOUNTS[1].address, 4);

      let account = await CONTRACT.connect(ACCOUNTS[0])._getCollectionAccount(ACCOUNTS[1].address);
      expect(account.id).to.be.equal(ACCOUNTS[1].address);
      expect(account.reflectionVault).to.be.an('array').that.is.not.empty;
      expect(_doesArrayEqual(account.reflectionVault, [
        ethers.BigNumber.from('0'), ethers.BigNumber.from('0'), ethers.BigNumber.from('0'), ethers.BigNumber.from('0')
      ])).to.be.true;
      expect(account.incentiveVault).to.be.equal(0);

      await CONTRACT.connect(ACCOUNTS[0])._incrementCollectionAccount(ACCOUNTS[1].address, 3, 2);

      account = await CONTRACT.connect(ACCOUNTS[0])._getCollectionAccount(ACCOUNTS[1].address);
      expect(account.id).to.be.equal(ACCOUNTS[1].address);
      expect(account.reflectionVault).to.be.an('array').that.is.not.empty;
      expect(_doesArrayEqual(account.reflectionVault, [
        ethers.BigNumber.from('3'), ethers.BigNumber.from('3'), ethers.BigNumber.from('3'), ethers.BigNumber.from('3')
      ])).to.be.true;
      expect(account.incentiveVault).to.be.equal(2);

      await CONTRACT.connect(ACCOUNTS[0])._incrementCollectionAccount(ACCOUNTS[1].address, 1, 3);

      account = await CONTRACT.connect(ACCOUNTS[0])._getCollectionAccount(ACCOUNTS[1].address);
      expect(account.id).to.be.equal(ACCOUNTS[1].address);
      expect(account.reflectionVault).to.be.an('array').that.is.not.empty;
      expect(_doesArrayEqual(account.reflectionVault, [
        ethers.BigNumber.from('4'), ethers.BigNumber.from('4'), ethers.BigNumber.from('4'), ethers.BigNumber.from('4')
      ])).to.be.true;
      expect(account.incentiveVault).to.be.equal(5);
    });
    it('increment one account out of many', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addCollectionAccount(ACCOUNTS[1].address);
      await CONTRACT.connect(ACCOUNTS[0])._addCollectionAccount(ACCOUNTS[2].address);
      await CONTRACT.connect(ACCOUNTS[0])._addCollectionAccount(ACCOUNTS[3].address);

      await CONTRACT.connect(ACCOUNTS[0])._initReflectionVaultCollectionAccount(ACCOUNTS[1].address, 3);
      await CONTRACT.connect(ACCOUNTS[0])._initReflectionVaultCollectionAccount(ACCOUNTS[2].address, 4);
      await CONTRACT.connect(ACCOUNTS[0])._initReflectionVaultCollectionAccount(ACCOUNTS[3].address, 5);

      await CONTRACT.connect(ACCOUNTS[0])._updateCollectionAccount(ACCOUNTS[1].address, [1,2,3], 2);
      await CONTRACT.connect(ACCOUNTS[0])._incrementCollectionAccount(ACCOUNTS[1].address, 5, 4);

      const account = await CONTRACT.connect(ACCOUNTS[0])._getCollectionAccount(ACCOUNTS[1].address);
      expect(account.id).to.be.equal(ACCOUNTS[1].address);
      expect(account.reflectionVault).to.be.an('array').that.is.not.empty;
      expect(_doesArrayEqual(account.reflectionVault, [
        ethers.BigNumber.from('6'), ethers.BigNumber.from('7'), ethers.BigNumber.from('8')
      ])).to.be.true;
      expect(account.incentiveVault).to.be.equal(6);

      const accounts = await CONTRACT.connect(ACCOUNTS[0])._getCollectionAccounts(
        [ACCOUNTS[1].address, ACCOUNTS[2].address, ACCOUNTS[3].address]
      );
      expect(accounts.length).to.be.equal(3);

      expect(accounts[0].id).to.be.equal(ACCOUNTS[1].address);
      expect(accounts[0].reflectionVault).to.be.an('array').that.is.not.empty;
      expect(_doesArrayEqual(accounts[0].reflectionVault, [
        ethers.BigNumber.from('6'), ethers.BigNumber.from('7'), ethers.BigNumber.from('8')
      ])).to.be.true;
      expect(accounts[0].incentiveVault).to.be.equal(6);

      expect(accounts[1].id).to.be.equal(ACCOUNTS[2].address);
      expect(accounts[1].reflectionVault).to.be.an('array').that.is.not.empty;
      expect(_doesArrayEqual(accounts[1].reflectionVault, [
        ethers.BigNumber.from('0'), ethers.BigNumber.from('0'), ethers.BigNumber.from('0'), ethers.BigNumber.from('0')
      ])).to.be.true;
      expect(accounts[1].incentiveVault).to.be.equal(0);

      expect(accounts[2].id).to.be.equal(ACCOUNTS[3].address);
      expect(accounts[2].reflectionVault).to.be.an('array').that.is.not.empty;
      expect(_doesArrayEqual(accounts[1].reflectionVault, [
        ethers.BigNumber.from('0'), ethers.BigNumber.from('0'), ethers.BigNumber.from('0'), ethers.BigNumber.from('0'), ethers.BigNumber.from('0')
      ])).to.be.true;
      expect(accounts[2].incentiveVault).to.be.equal(0);
    });

    it('nullify account', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addCollectionAccount(ACCOUNTS[1].address);
      await CONTRACT.connect(ACCOUNTS[0])._initReflectionVaultCollectionAccount(ACCOUNTS[1].address, 3);

      let account = await CONTRACT.connect(ACCOUNTS[0])._getCollectionAccount(ACCOUNTS[1].address);
      expect(account.id).to.be.equal(ACCOUNTS[1].address);
      expect(account.reflectionVault).to.be.an('array').that.is.not.empty;
      expect(_doesArrayEqual(account.reflectionVault, [
        ethers.BigNumber.from('0'), ethers.BigNumber.from('0'), ethers.BigNumber.from('0')
      ])).to.be.true;
      expect(account.incentiveVault).to.be.equal(0);

      await CONTRACT.connect(ACCOUNTS[0])._updateCollectionAccount(ACCOUNTS[1].address, [1,2,3], 2);

      account = await CONTRACT.connect(ACCOUNTS[0])._getCollectionAccount(ACCOUNTS[1].address);
      expect(account.id).to.be.equal(ACCOUNTS[1].address);
      expect(account.reflectionVault).to.be.an('array').that.is.not.empty;
      expect(_doesArrayEqual(account.reflectionVault, [
        ethers.BigNumber.from('1'), ethers.BigNumber.from('2'), ethers.BigNumber.from('3')
      ])).to.be.true;
      expect(account.incentiveVault).to.be.equal(2);

      await CONTRACT.connect(ACCOUNTS[0])._nullifyCollectionAccount(ACCOUNTS[1].address);

      account = await CONTRACT.connect(ACCOUNTS[0])._getCollectionAccount(ACCOUNTS[1].address);
      expect(account.id).to.be.equal(ACCOUNTS[1].address);
      expect(account.reflectionVault).to.be.an('array').that.is.not.empty;
      expect(_doesArrayEqual(account.reflectionVault, [
        ethers.BigNumber.from('0'), ethers.BigNumber.from('0'), ethers.BigNumber.from('0')
      ])).to.be.true;
      expect(account.incentiveVault).to.be.equal(0);
    });

    it('remove account', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addCollectionAccount(ACCOUNTS[1].address);
      await CONTRACT.connect(ACCOUNTS[0])._initReflectionVaultCollectionAccount(ACCOUNTS[1].address, 3);

      let account = await CONTRACT.connect(ACCOUNTS[0])._getCollectionAccount(ACCOUNTS[1].address);
      expect(account.id).to.be.equal(ACCOUNTS[1].address);
      expect(account.reflectionVault).to.be.an('array').that.is.not.empty;
      expect(_doesArrayEqual(account.reflectionVault, [
        ethers.BigNumber.from('0'), ethers.BigNumber.from('0'), ethers.BigNumber.from('0')
      ])).to.be.true;
      expect(account.incentiveVault).to.be.equal(0);

      await CONTRACT.connect(ACCOUNTS[0])._removeCollectionAccount(ACCOUNTS[1].address);

      await CONTRACT.connect(ACCOUNTS[0])._getCollectionAccount(ACCOUNTS[1].address)
        .should.be.rejectedWith('The account for this collection does not exist');
    });

  });

  describe('collection properties', async () => {
    beforeEach(async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addCollectionAccount(ACCOUNTS[1].address);
    });

    it('get collection reflection vault', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._getReflectionVaultCollectionAccount(ACCOUNTS[2].address)
        .should.be.rejectedWith('The account for this collection does not exist');
    });
    it('add collection reflection vault', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._initReflectionVaultCollectionAccount(ACCOUNTS[1].address, 100);
      const result = await CONTRACT.connect(ACCOUNTS[0])._getReflectionVaultCollectionAccount(ACCOUNTS[1].address);
      expect(result.length).to.be.equal(100);
    });
    it('nullify collection reflection vault', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._initReflectionVaultCollectionAccount(ACCOUNTS[1].address, 100);

      let result = await CONTRACT.connect(ACCOUNTS[0])._getReflectionVaultCollectionAccount(ACCOUNTS[1].address);
      expect(result.length).to.be.equal(100);

      result = await CONTRACT.connect(ACCOUNTS[0])._getReflectionVaultIndexCollectionAccount(ACCOUNTS[1].address, 5);
      expect(result).to.be.equal(0);

      await CONTRACT.connect(ACCOUNTS[0])._increaseReflectionVaultCollectionAccount(ACCOUNTS[1].address, 2);
      result = await CONTRACT.connect(ACCOUNTS[0])._getReflectionVaultIndexCollectionAccount(ACCOUNTS[1].address, 5);
      expect(result).to.be.equal(2);

      await CONTRACT.connect(ACCOUNTS[0])._nullifyReflectionVaultCollectionAccount(ACCOUNTS[1].address);
      result = await CONTRACT.connect(ACCOUNTS[0])._getReflectionVaultIndexCollectionAccount(ACCOUNTS[1].address, 5);
      expect(result).to.be.equal(0);
    });

    it('get collection incentive vault', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._getIncentiveVaultCollectionAccount(ACCOUNTS[2].address)
        .should.be.rejectedWith('The account for this collection does not exist');
    });
    it('update collection incentive vault', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._updateIncentiveVaultCollectionAccount(ACCOUNTS[1].address, 2);
      const result = await CONTRACT.connect(ACCOUNTS[0])._getIncentiveVaultCollectionAccount(ACCOUNTS[1].address);
      expect(result).to.be.equal(2);
    });
  });

});
