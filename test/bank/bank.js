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
describe("AvaxTrade - Bank", () => {
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

  describe('Bank owner', async () => {
    // address[] private BANK_OWNERS;

    it('get bank owners', async () => {
      const result = await CONTRACT.connect(ACCOUNTS[0])._getBankOwners();
      expect(result).to.be.an('array').that.is.empty;
    });
    it('add bank owner', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addBankOwner(ACCOUNTS[1].address);
      const result = await CONTRACT.connect(ACCOUNTS[0])._getBankOwners();
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result).to.deep.include(ACCOUNTS[1].address);
    });
    it('is bank owner unique', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addBankOwner(ACCOUNTS[1].address);
      expect(await CONTRACT.connect(ACCOUNTS[0])._isBankOwnerUnique(ACCOUNTS[1].address)).to.be.false;
      expect(await CONTRACT.connect(ACCOUNTS[0])._isBankOwnerUnique(ACCOUNTS[2].address)).to.be.true;
    });
    it('remove bank owner - one user', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addBank(ACCOUNTS[1].address);

      let result = await CONTRACT.connect(ACCOUNTS[0])._getBankOwners();
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result).to.deep.include(ACCOUNTS[1].address);

      await CONTRACT.connect(ACCOUNTS[0])._removeBankOwner(ACCOUNTS[1].address);

      result = await CONTRACT.connect(ACCOUNTS[0])._getBankOwners();
      expect(result).to.be.an('array').that.is.empty;
    });
    it('remove bank owner - two same users', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addBank(ACCOUNTS[1].address);
      await CONTRACT.connect(ACCOUNTS[0])._addBank(ACCOUNTS[1].address);

      let result = await CONTRACT.connect(ACCOUNTS[0])._getBankOwners();
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result).to.deep.include(ACCOUNTS[1].address);

      await CONTRACT.connect(ACCOUNTS[0])._removeBankOwner(ACCOUNTS[1].address);

      result = await CONTRACT.connect(ACCOUNTS[0])._getBankOwners();
      expect(result).to.be.an('array').that.is.empty;
    });
    it('remove bank owner - two different users', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addBank(ACCOUNTS[1].address);
      await CONTRACT.connect(ACCOUNTS[0])._addBank(ACCOUNTS[2].address);

      let result = await CONTRACT.connect(ACCOUNTS[0])._getBankOwners();
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result).to.deep.include(ACCOUNTS[1].address);

      await CONTRACT.connect(ACCOUNTS[0])._removeBankOwner(ACCOUNTS[1].address);

      result = await CONTRACT.connect(ACCOUNTS[0])._getBankOwners();
      expect(result).to.be.an('array').that.is.not.empty;
      expect(_doesArrayInclude(result, ACCOUNTS[2].address)).to.be.true;
      expect(await CONTRACT.connect(ACCOUNTS[0])._isBankOwnerUnique(ACCOUNTS[1].address)).to.be.true;
      expect(await CONTRACT.connect(ACCOUNTS[0])._isBankOwnerUnique(ACCOUNTS[2].address)).to.be.false;
    });
  });

  describe('Main functions', async () => {
    // {
    //   address id; // owner of this bank account
    //   AccountDS accounts; // bank accounts
    //   VaultDS vault; // bank vault
    // }

    it('get all banks', async () => {
      const result = await CONTRACT.connect(ACCOUNTS[0])._getBanks([ACCOUNTS[1].address, ACCOUNTS[2].address])
      .should.be.rejectedWith('A user in the list does not own a bank');
    });
    it('get bank 1 - does not exist', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._getBank(ACCOUNTS[1].address)
        .should.be.rejectedWith('The bank for this user does not exist');
    });

    it('add bank', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addBank(ACCOUNTS[1].address);

      const bank = await CONTRACT.connect(ACCOUNTS[0])._getBank(ACCOUNTS[1].address);
      expect(bank.id).to.be.equal(ACCOUNTS[1].address);
      expect(_doesArrayInclude(bank.accounts, ACCOUNTS[1].address)).to.be.true;
      expect(_doesArrayInclude(bank.vault, ACCOUNTS[1].address)).to.be.true;

      expect(bank.accounts.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.accounts.general).to.be.equal(0);
      expect(bank.accounts.collectionCommission).to.be.equal(0);

      expect(bank.vault.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.vault.balance).to.be.equal(0);
    });
    it('add multiple same banks', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addBank(ACCOUNTS[1].address);
      await CONTRACT.connect(ACCOUNTS[0])._addBank(ACCOUNTS[1].address);

      const bank = await CONTRACT.connect(ACCOUNTS[0])._getBank(ACCOUNTS[1].address);
      expect(bank.id).to.be.equal(ACCOUNTS[1].address);
      expect(_doesArrayInclude(bank.accounts, ACCOUNTS[1].address)).to.be.true;
      expect(_doesArrayInclude(bank.vault, ACCOUNTS[1].address)).to.be.true;

      expect(bank.accounts.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.accounts.general).to.be.equal(0);
      expect(bank.accounts.collectionCommission).to.be.equal(0);

      expect(bank.vault.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.vault.balance).to.be.equal(0);
    });
    it('add multiple different banks', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addBank(ACCOUNTS[1].address);
      await CONTRACT.connect(ACCOUNTS[0])._addBank(ACCOUNTS[2].address);

      let bank = await CONTRACT.connect(ACCOUNTS[0])._getBank(ACCOUNTS[1].address);
      expect(bank.id).to.be.equal(ACCOUNTS[1].address);
      expect(_doesArrayInclude(bank.accounts, ACCOUNTS[1].address)).to.be.true;
      expect(_doesArrayInclude(bank.vault, ACCOUNTS[1].address)).to.be.true;

      bank = await CONTRACT.connect(ACCOUNTS[0])._getBank(ACCOUNTS[2].address);
      expect(bank.id).to.be.equal(ACCOUNTS[2].address);
      expect(_doesArrayInclude(bank.accounts, ACCOUNTS[2].address)).to.be.true;
      expect(_doesArrayInclude(bank.vault, ACCOUNTS[2].address)).to.be.true;

      const banks = await CONTRACT.connect(ACCOUNTS[0])._getBanks([ACCOUNTS[1].address, ACCOUNTS[2].address]);
      expect(banks.length).to.be.equal(2);

      expect(banks[0].accounts.id).to.be.equal(ACCOUNTS[1].address);
      expect(banks[0].accounts.general).to.be.equal(0);
      expect(banks[0].accounts.collectionCommission).to.be.equal(0);
      expect(banks[0].vault.id).to.be.equal(ACCOUNTS[1].address);
      expect(banks[0].vault.balance).to.be.equal(0);

      expect(banks[1].accounts.id).to.be.equal(ACCOUNTS[2].address);
      expect(banks[1].accounts.general).to.be.equal(0);
      expect(banks[1].accounts.collectionCommission).to.be.equal(0);
      expect(banks[1].vault.id).to.be.equal(ACCOUNTS[2].address);
      expect(banks[1].vault.balance).to.be.equal(0);
    });

    it('update brank', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addBank(ACCOUNTS[1].address);

      let bank = await CONTRACT.connect(ACCOUNTS[0])._getBank(ACCOUNTS[1].address);

      expect(bank.id).to.be.equal(ACCOUNTS[1].address);
      expect(_doesArrayInclude(bank.accounts, ACCOUNTS[1].address)).to.be.true;
      expect(bank.accounts.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.accounts.general).to.be.equal(0);
      expect(bank.accounts.collectionCommission).to.be.equal(0);

      expect(_doesArrayInclude(bank.vault, ACCOUNTS[1].address)).to.be.true;
      expect(bank.vault.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.vault.balance).to.be.equal(0);

      await CONTRACT.connect(ACCOUNTS[0])._updateBank(ACCOUNTS[1].address, 1, 2, 3, [1,2,3], 4, 5);

      bank = await CONTRACT.connect(ACCOUNTS[0])._getBank(ACCOUNTS[1].address);

      expect(bank.id).to.be.equal(ACCOUNTS[1].address);
      expect(_doesArrayInclude(bank.accounts, ACCOUNTS[1].address)).to.be.true;
      expect(bank.accounts.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.accounts.general).to.be.equal(1);
      expect(bank.accounts.nftCommission).to.be.equal(2);
      expect(bank.accounts.collectionCommission).to.be.equal(3);

      expect(_doesArrayInclude(bank.vault, ACCOUNTS[1].address)).to.be.true;
      expect(bank.vault.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.vault.balance).to.be.equal(5);
    });
    it('update one bank out of many', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addBank(ACCOUNTS[1].address);
      await CONTRACT.connect(ACCOUNTS[0])._addBank(ACCOUNTS[2].address);
      await CONTRACT.connect(ACCOUNTS[0])._addBank(ACCOUNTS[3].address);

      await CONTRACT.connect(ACCOUNTS[0])._updateBank(ACCOUNTS[1].address, 1, 2, 3, [1,2,3], 4, 5);

      const banks = await CONTRACT.connect(ACCOUNTS[0])._getBanks(
        [ACCOUNTS[1].address, ACCOUNTS[2].address, ACCOUNTS[3].address]
      );
      expect(banks.length).to.be.equal(3);

      expect(banks[0].accounts.id).to.be.equal(ACCOUNTS[1].address);
      expect(banks[0].accounts.general).to.be.equal(1);
      expect(banks[0].accounts.nftCommission).to.be.equal(2);
      expect(banks[0].accounts.collectionCommission).to.be.equal(3);
      expect(banks[0].vault.id).to.be.equal(ACCOUNTS[1].address);
      expect(banks[0].vault.balance).to.be.equal(5);

      expect(banks[1].accounts.id).to.be.equal(ACCOUNTS[2].address);
      expect(banks[1].accounts.general).to.be.equal(0);
      expect(banks[1].accounts.collectionCommission).to.be.equal(0);
      expect(banks[1].vault.id).to.be.equal(ACCOUNTS[2].address);
      expect(banks[1].vault.balance).to.be.equal(0);

      expect(banks[2].accounts.id).to.be.equal(ACCOUNTS[3].address);
      expect(banks[2].accounts.general).to.be.equal(0);
      expect(banks[2].accounts.collectionCommission).to.be.equal(0);
      expect(banks[2].vault.id).to.be.equal(ACCOUNTS[3].address);
      expect(banks[2].vault.balance).to.be.equal(0);
    });
    it('update bank then add same bank', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addBank(ACCOUNTS[1].address);
      await CONTRACT.connect(ACCOUNTS[0])._updateBank(ACCOUNTS[1].address, 1, 2, 3, [1,2,3], 4, 5);

      let bank = await CONTRACT.connect(ACCOUNTS[0])._getBank(ACCOUNTS[1].address);

      expect(bank.id).to.be.equal(ACCOUNTS[1].address);
      expect(_doesArrayInclude(bank.accounts, ACCOUNTS[1].address)).to.be.true;
      expect(bank.accounts.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.accounts.general).to.be.equal(1);
      expect(bank.accounts.nftCommission).to.be.equal(2);
      expect(bank.accounts.collectionCommission).to.be.equal(3);

      expect(_doesArrayInclude(bank.vault, ACCOUNTS[1].address)).to.be.true;
      expect(bank.vault.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.vault.balance).to.be.equal(5);

      await CONTRACT.connect(ACCOUNTS[0])._addBank(ACCOUNTS[1].address);

      bank = await CONTRACT.connect(ACCOUNTS[0])._getBank(ACCOUNTS[1].address);

      expect(bank.id).to.be.equal(ACCOUNTS[1].address);
      expect(_doesArrayInclude(bank.accounts, ACCOUNTS[1].address)).to.be.true;
      expect(bank.accounts.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.accounts.general).to.be.equal(1);
      expect(bank.accounts.nftCommission).to.be.equal(2);
      expect(bank.accounts.collectionCommission).to.be.equal(3);

      expect(_doesArrayInclude(bank.vault, ACCOUNTS[1].address)).to.be.true;
      expect(bank.vault.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.vault.balance).to.be.equal(5);
    });

    it('nullify brank', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addBank(ACCOUNTS[1].address);

      let bank = await CONTRACT.connect(ACCOUNTS[0])._getBank(ACCOUNTS[1].address);

      expect(bank.id).to.be.equal(ACCOUNTS[1].address);
      expect(_doesArrayInclude(bank.accounts, ACCOUNTS[1].address)).to.be.true;
      expect(bank.accounts.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.accounts.general).to.be.equal(0);
      expect(bank.accounts.nftCommission).to.be.equal(0);
      expect(bank.accounts.collectionCommission).to.be.equal(0);

      expect(_doesArrayInclude(bank.vault, ACCOUNTS[1].address)).to.be.true;
      expect(bank.vault.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.vault.balance).to.be.equal(0);

      await CONTRACT.connect(ACCOUNTS[0])._updateBank(ACCOUNTS[1].address, 1, 2, 3, [1,2,3], 4, 5);

      bank = await CONTRACT.connect(ACCOUNTS[0])._getBank(ACCOUNTS[1].address);

      expect(bank.id).to.be.equal(ACCOUNTS[1].address);
      expect(_doesArrayInclude(bank.accounts, ACCOUNTS[1].address)).to.be.true;
      expect(bank.accounts.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.accounts.general).to.be.equal(1);
      expect(bank.accounts.nftCommission).to.be.equal(2);
      expect(bank.accounts.collectionCommission).to.be.equal(3);

      expect(_doesArrayInclude(bank.vault, ACCOUNTS[1].address)).to.be.true;
      expect(bank.vault.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.vault.balance).to.be.equal(5);

      await CONTRACT.connect(ACCOUNTS[0])._nullifyBank(ACCOUNTS[1].address);

      bank = await CONTRACT.connect(ACCOUNTS[0])._getBank(ACCOUNTS[1].address);

      expect(bank.id).to.be.equal(ACCOUNTS[1].address);
      expect(_doesArrayInclude(bank.accounts, ACCOUNTS[1].address)).to.be.true;
      expect(bank.accounts.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.accounts.general).to.be.equal(0);
      expect(bank.accounts.nftCommission).to.be.equal(0);
      expect(bank.accounts.collectionCommission).to.be.equal(0);

      expect(_doesArrayInclude(bank.vault, ACCOUNTS[1].address)).to.be.true;
      expect(bank.vault.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.vault.balance).to.be.equal(0);
    });

    it('remove brank', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addBank(ACCOUNTS[1].address);

      let bank = await CONTRACT.connect(ACCOUNTS[0])._getBank(ACCOUNTS[1].address);

      expect(bank.id).to.be.equal(ACCOUNTS[1].address);
      expect(_doesArrayInclude(bank.accounts, ACCOUNTS[1].address)).to.be.true;
      expect(bank.accounts.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.accounts.general).to.be.equal(0);
      expect(bank.accounts.collectionCommission).to.be.equal(0);

      expect(_doesArrayInclude(bank.vault, ACCOUNTS[1].address)).to.be.true;
      expect(bank.vault.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.vault.balance).to.be.equal(0);

      await CONTRACT.connect(ACCOUNTS[0])._removeBank(ACCOUNTS[1].address);

      bank = await CONTRACT.connect(ACCOUNTS[0])._getBank(ACCOUNTS[1].address)
      .should.be.rejectedWith('The bank for this user does not exist');
    });
  });

});
