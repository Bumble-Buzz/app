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
    const contractFactory = await ethers.getContractFactory("Bank");
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
      await CONTRACT.connect(ACCOUNTS[0]).addBank(ACCOUNTS[1].address);

      let result = await CONTRACT.connect(ACCOUNTS[0])._getBankOwners();
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result).to.deep.include(ACCOUNTS[1].address);

      await CONTRACT.connect(ACCOUNTS[0])._removeBankOwner(ACCOUNTS[1].address);

      result = await CONTRACT.connect(ACCOUNTS[0])._getBankOwners();
      expect(result).to.be.an('array').that.is.empty;
    });
    it('remove bank owner - two same users', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addBank(ACCOUNTS[1].address);
      await CONTRACT.connect(ACCOUNTS[0]).addBank(ACCOUNTS[1].address);

      let result = await CONTRACT.connect(ACCOUNTS[0])._getBankOwners();
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result).to.deep.include(ACCOUNTS[1].address);

      await CONTRACT.connect(ACCOUNTS[0])._removeBankOwner(ACCOUNTS[1].address);

      result = await CONTRACT.connect(ACCOUNTS[0])._getBankOwners();
      expect(result).to.be.an('array').that.is.empty;
    });
    it('remove bank owner - two different users', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addBank(ACCOUNTS[1].address);
      await CONTRACT.connect(ACCOUNTS[0]).addBank(ACCOUNTS[2].address);

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
    //   UserAccountDS user; // user account
    //   CollectionAccountDS collection; // collection account
    //   VaultDS vault; // bank vault
    // }

    it('get all banks', async () => {
      const result = await CONTRACT.connect(ACCOUNTS[0]).getBanks([ACCOUNTS[1].address, ACCOUNTS[2].address])
      .should.be.rejectedWith('A user in the list does not own a bank');
    });
    it('get bank 1 - does not exist', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).getBank(ACCOUNTS[1].address)
        .should.be.rejectedWith('The bank for this user does not exist');
    });

    it('add bank', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addBank(ACCOUNTS[1].address);

      const bank = await CONTRACT.connect(ACCOUNTS[0]).getBank(ACCOUNTS[1].address);
      expect(bank.id).to.be.equal(ACCOUNTS[1].address);
      expect(_doesArrayInclude(bank.user, ACCOUNTS[1].address)).to.be.true;
      expect(_doesArrayInclude(bank.collection, ACCOUNTS[1].address)).to.be.true;
      expect(_doesArrayInclude(bank.vault, ACCOUNTS[1].address)).to.be.true;

      expect(bank.user.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.user.general).to.be.equal(0);
      expect(bank.user.collectionCommission).to.be.equal(0);

      expect(bank.collection.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.collection.reflectionVault).to.be.an('array').that.is.empty;
      expect(bank.collection.incentiveVault).to.be.equal(0);

      expect(bank.vault.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.vault.balance).to.be.equal(0);
    });
    it('add multiple same banks', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addBank(ACCOUNTS[1].address);
      await CONTRACT.connect(ACCOUNTS[0]).addBank(ACCOUNTS[1].address);

      const bank = await CONTRACT.connect(ACCOUNTS[0]).getBank(ACCOUNTS[1].address);
      expect(bank.id).to.be.equal(ACCOUNTS[1].address);
      expect(_doesArrayInclude(bank.user, ACCOUNTS[1].address)).to.be.true;
      expect(_doesArrayInclude(bank.collection, ACCOUNTS[1].address)).to.be.true;
      expect(_doesArrayInclude(bank.vault, ACCOUNTS[1].address)).to.be.true;

      expect(bank.user.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.user.general).to.be.equal(0);
      expect(bank.user.collectionCommission).to.be.equal(0);

      expect(bank.collection.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.collection.reflectionVault).to.be.an('array').that.is.empty;
      expect(bank.collection.incentiveVault).to.be.equal(0);

      expect(bank.vault.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.vault.balance).to.be.equal(0);
    });
    it('add multiple different banks', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addBank(ACCOUNTS[1].address);
      await CONTRACT.connect(ACCOUNTS[0]).addBank(ACCOUNTS[2].address);

      let bank = await CONTRACT.connect(ACCOUNTS[0]).getBank(ACCOUNTS[1].address);
      expect(bank.id).to.be.equal(ACCOUNTS[1].address);
      expect(_doesArrayInclude(bank.user, ACCOUNTS[1].address)).to.be.true;
      expect(_doesArrayInclude(bank.collection, ACCOUNTS[1].address)).to.be.true;
      expect(_doesArrayInclude(bank.vault, ACCOUNTS[1].address)).to.be.true;

      bank = await CONTRACT.connect(ACCOUNTS[0]).getBank(ACCOUNTS[2].address);
      expect(bank.id).to.be.equal(ACCOUNTS[2].address);
      expect(_doesArrayInclude(bank.user, ACCOUNTS[2].address)).to.be.true;
      expect(_doesArrayInclude(bank.collection, ACCOUNTS[2].address)).to.be.true;
      expect(_doesArrayInclude(bank.vault, ACCOUNTS[2].address)).to.be.true;

      const banks = await CONTRACT.connect(ACCOUNTS[0]).getBanks([ACCOUNTS[1].address, ACCOUNTS[2].address]);
      expect(banks.length).to.be.equal(2);

      expect(banks[0].user.id).to.be.equal(ACCOUNTS[1].address);
      expect(banks[0].user.general).to.be.equal(0);
      expect(banks[0].user.collectionCommission).to.be.equal(0);
      expect(banks[0].collection.id).to.be.equal(ACCOUNTS[1].address);
      expect(banks[0].collection.reflectionVault).to.be.an('array').that.is.empty;
      expect(banks[0].collection.incentiveVault).to.be.equal(0);
      expect(banks[0].vault.id).to.be.equal(ACCOUNTS[1].address);
      expect(banks[0].vault.balance).to.be.equal(0);

      expect(banks[1].user.id).to.be.equal(ACCOUNTS[2].address);
      expect(banks[1].user.general).to.be.equal(0);
      expect(banks[1].user.collectionCommission).to.be.equal(0);
      expect(banks[1].collection.id).to.be.equal(ACCOUNTS[2].address);
      expect(banks[1].collection.reflectionVault).to.be.an('array').that.is.empty;
      expect(banks[1].collection.incentiveVault).to.be.equal(0);
      expect(banks[1].vault.id).to.be.equal(ACCOUNTS[2].address);
      expect(banks[1].vault.balance).to.be.equal(0);
    });

    it('update brank', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addBank(ACCOUNTS[1].address);

      let bank = await CONTRACT.connect(ACCOUNTS[0]).getBank(ACCOUNTS[1].address);
      expect(bank.id).to.be.equal(ACCOUNTS[1].address);

      expect(_doesArrayInclude(bank.user, ACCOUNTS[1].address)).to.be.true;
      expect(bank.user.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.user.general).to.be.equal(0);
      expect(bank.user.collectionCommission).to.be.equal(0);

      expect(_doesArrayInclude(bank.collection, ACCOUNTS[1].address)).to.be.true;
      expect(bank.collection.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.collection.reflectionVault).to.be.an('array').that.is.empty;
      expect(bank.collection.incentiveVault).to.be.equal(0);

      expect(_doesArrayInclude(bank.vault, ACCOUNTS[1].address)).to.be.true;
      expect(bank.vault.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.vault.balance).to.be.equal(0);

      await CONTRACT.connect(ACCOUNTS[0]).updateBank(ACCOUNTS[1].address, 1, 2, 3, [1,2,3], 4, 5);

      bank = await CONTRACT.connect(ACCOUNTS[0]).getBank(ACCOUNTS[1].address);
      expect(bank.id).to.be.equal(ACCOUNTS[1].address);

      expect(_doesArrayInclude(bank.user, ACCOUNTS[1].address)).to.be.true;
      expect(bank.user.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.user.general).to.be.equal(1);
      expect(bank.user.nftCommission).to.be.equal(2);
      expect(bank.user.collectionCommission).to.be.equal(3);

      expect(_doesArrayInclude(bank.collection, ACCOUNTS[1].address)).to.be.true;
      expect(bank.collection.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.collection.reflectionVault).to.be.an('array').that.is.not.empty;
      expect(_doesArrayEqual(bank.collection.reflectionVault, [
        ethers.BigNumber.from('1'), ethers.BigNumber.from('2'), ethers.BigNumber.from('3')
      ])).to.be.true;
      expect(bank.collection.incentiveVault).to.be.equal(4);

      expect(_doesArrayInclude(bank.vault, ACCOUNTS[1].address)).to.be.true;
      expect(bank.vault.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.vault.balance).to.be.equal(5);
    });
    it('update brank - not owner', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addBank(ACCOUNTS[1].address);

      let bank = await CONTRACT.connect(ACCOUNTS[0]).getBank(ACCOUNTS[1].address);
      expect(bank.id).to.be.equal(ACCOUNTS[1].address);

      expect(_doesArrayInclude(bank.user, ACCOUNTS[1].address)).to.be.true;
      expect(bank.user.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.user.general).to.be.equal(0);
      expect(bank.user.collectionCommission).to.be.equal(0);

      expect(_doesArrayInclude(bank.collection, ACCOUNTS[1].address)).to.be.true;
      expect(bank.collection.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.collection.reflectionVault).to.be.an('array').that.is.empty;
      expect(bank.collection.incentiveVault).to.be.equal(0);

      expect(_doesArrayInclude(bank.vault, ACCOUNTS[1].address)).to.be.true;
      expect(bank.vault.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.vault.balance).to.be.equal(0);

      await CONTRACT.connect(ACCOUNTS[1]).updateBank(ACCOUNTS[1].address, 1, 2, 3, [1,2,3], 4, 5)
        .should.be.rejectedWith('Ownable: caller is not the owner');
    });
    it('update one bank out of many', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addBank(ACCOUNTS[1].address);
      await CONTRACT.connect(ACCOUNTS[0]).addBank(ACCOUNTS[2].address);
      await CONTRACT.connect(ACCOUNTS[0]).addBank(ACCOUNTS[3].address);

      await CONTRACT.connect(ACCOUNTS[0]).updateBank(ACCOUNTS[1].address, 1, 2, 3, [1,2,3], 4, 5);

      const banks = await CONTRACT.connect(ACCOUNTS[0]).getBanks(
        [ACCOUNTS[1].address, ACCOUNTS[2].address, ACCOUNTS[3].address]
      );
      expect(banks.length).to.be.equal(3);

      expect(banks[0].user.id).to.be.equal(ACCOUNTS[1].address);
      expect(banks[0].user.general).to.be.equal(1);
      expect(banks[0].user.nftCommission).to.be.equal(2);
      expect(banks[0].user.collectionCommission).to.be.equal(3);
      expect(banks[0].collection.id).to.be.equal(ACCOUNTS[1].address);
      expect(banks[0].collection.reflectionVault).to.be.an('array').that.is.not.empty;
      expect(_doesArrayEqual(banks[0].collection.reflectionVault, [
        ethers.BigNumber.from('1'), ethers.BigNumber.from('2'), ethers.BigNumber.from('3')
      ])).to.be.true;
      expect(banks[0].collection.incentiveVault).to.be.equal(4);
      expect(banks[0].vault.id).to.be.equal(ACCOUNTS[1].address);
      expect(banks[0].vault.balance).to.be.equal(5);

      expect(banks[1].user.id).to.be.equal(ACCOUNTS[2].address);
      expect(banks[1].user.general).to.be.equal(0);
      expect(banks[1].user.collectionCommission).to.be.equal(0);
      expect(banks[1].collection.id).to.be.equal(ACCOUNTS[2].address);
      expect(banks[1].collection.reflectionVault).to.be.an('array').that.is.empty;
      expect(banks[1].vault.id).to.be.equal(ACCOUNTS[2].address);
      expect(banks[1].vault.balance).to.be.equal(0);

      expect(banks[2].user.id).to.be.equal(ACCOUNTS[3].address);
      expect(banks[2].user.general).to.be.equal(0);
      expect(banks[2].user.collectionCommission).to.be.equal(0);
      expect(banks[2].collection.id).to.be.equal(ACCOUNTS[3].address);
      expect(banks[2].collection.reflectionVault).to.be.an('array').that.is.empty;
      expect(banks[2].vault.id).to.be.equal(ACCOUNTS[3].address);
      expect(banks[2].vault.balance).to.be.equal(0);
    });
    it('update bank then add same bank', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addBank(ACCOUNTS[1].address);
      await CONTRACT.connect(ACCOUNTS[0]).updateBank(ACCOUNTS[1].address, 1, 2, 3, [1,2,3], 4, 5);

      let bank = await CONTRACT.connect(ACCOUNTS[0]).getBank(ACCOUNTS[1].address);

      expect(bank.id).to.be.equal(ACCOUNTS[1].address);
      expect(_doesArrayInclude(bank.user, ACCOUNTS[1].address)).to.be.true;
      expect(bank.user.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.user.general).to.be.equal(1);
      expect(bank.user.nftCommission).to.be.equal(2);
      expect(bank.user.collectionCommission).to.be.equal(3);

      expect(_doesArrayInclude(bank.collection, ACCOUNTS[1].address)).to.be.true;
      expect(bank.collection.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.collection.reflectionVault).to.be.an('array').that.is.not.empty;
      expect(_doesArrayEqual(bank.collection.reflectionVault, [
        ethers.BigNumber.from('1'), ethers.BigNumber.from('2'), ethers.BigNumber.from('3')
      ])).to.be.true;
      expect(bank.collection.incentiveVault).to.be.equal(4);

      expect(_doesArrayInclude(bank.vault, ACCOUNTS[1].address)).to.be.true;
      expect(bank.vault.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.vault.balance).to.be.equal(5);

      await CONTRACT.connect(ACCOUNTS[0]).addBank(ACCOUNTS[1].address);

      bank = await CONTRACT.connect(ACCOUNTS[0]).getBank(ACCOUNTS[1].address);

      expect(bank.id).to.be.equal(ACCOUNTS[1].address);
      expect(_doesArrayInclude(bank.user, ACCOUNTS[1].address)).to.be.true;
      expect(bank.user.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.user.general).to.be.equal(1);
      expect(bank.user.nftCommission).to.be.equal(2);
      expect(bank.user.collectionCommission).to.be.equal(3);

      expect(_doesArrayInclude(bank.collection, ACCOUNTS[1].address)).to.be.true;
      expect(bank.collection.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.collection.reflectionVault).to.be.an('array').that.is.not.empty;
      expect(_doesArrayEqual(bank.collection.reflectionVault, [
        ethers.BigNumber.from('1'), ethers.BigNumber.from('2'), ethers.BigNumber.from('3')
      ])).to.be.true;
      expect(bank.collection.incentiveVault).to.be.equal(4);

      expect(_doesArrayInclude(bank.vault, ACCOUNTS[1].address)).to.be.true;
      expect(bank.vault.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.vault.balance).to.be.equal(5);
    });

    it('nullify brank', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addBank(ACCOUNTS[1].address);

      let bank = await CONTRACT.connect(ACCOUNTS[0]).getBank(ACCOUNTS[1].address);

      expect(bank.id).to.be.equal(ACCOUNTS[1].address);
      expect(_doesArrayInclude(bank.user, ACCOUNTS[1].address)).to.be.true;
      expect(bank.user.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.user.general).to.be.equal(0);
      expect(bank.user.nftCommission).to.be.equal(0);
      expect(bank.user.collectionCommission).to.be.equal(0);

      expect(_doesArrayInclude(bank.collection, ACCOUNTS[1].address)).to.be.true;
      expect(bank.collection.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.collection.reflectionVault).to.be.an('array').that.is.empty;
      expect(bank.collection.incentiveVault).to.be.equal(0);

      expect(_doesArrayInclude(bank.vault, ACCOUNTS[1].address)).to.be.true;
      expect(bank.vault.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.vault.balance).to.be.equal(0);

      await CONTRACT.connect(ACCOUNTS[0]).updateBank(ACCOUNTS[1].address, 1, 2, 3, [1,2,3], 4, 5);

      bank = await CONTRACT.connect(ACCOUNTS[0]).getBank(ACCOUNTS[1].address);

      expect(bank.id).to.be.equal(ACCOUNTS[1].address);
      expect(_doesArrayInclude(bank.user, ACCOUNTS[1].address)).to.be.true;
      expect(bank.user.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.user.general).to.be.equal(1);
      expect(bank.user.nftCommission).to.be.equal(2);
      expect(bank.user.collectionCommission).to.be.equal(3);

      expect(_doesArrayInclude(bank.collection, ACCOUNTS[1].address)).to.be.true;
      expect(bank.collection.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.collection.reflectionVault).to.be.an('array').that.is.not.empty;
      expect(_doesArrayEqual(bank.collection.reflectionVault, [
        ethers.BigNumber.from('1'), ethers.BigNumber.from('2'), ethers.BigNumber.from('3')
      ])).to.be.true;
      expect(bank.collection.incentiveVault).to.be.equal(4);

      expect(_doesArrayInclude(bank.vault, ACCOUNTS[1].address)).to.be.true;
      expect(bank.vault.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.vault.balance).to.be.equal(5);

      await CONTRACT.connect(ACCOUNTS[0])._nullifyBank(ACCOUNTS[1].address);

      bank = await CONTRACT.connect(ACCOUNTS[0]).getBank(ACCOUNTS[1].address);

      expect(bank.id).to.be.equal(ACCOUNTS[1].address);
      expect(_doesArrayInclude(bank.user, ACCOUNTS[1].address)).to.be.true;
      expect(bank.user.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.user.general).to.be.equal(0);
      expect(bank.user.nftCommission).to.be.equal(0);
      expect(bank.user.collectionCommission).to.be.equal(0);

      expect(_doesArrayInclude(bank.collection, ACCOUNTS[1].address)).to.be.true;
      expect(bank.collection.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.collection.reflectionVault).to.be.an('array').that.is.not.empty;
      expect(_doesArrayEqual(bank.collection.reflectionVault, [
        ethers.BigNumber.from('0'), ethers.BigNumber.from('0'), ethers.BigNumber.from('0')
      ])).to.be.true;
      expect(bank.collection.incentiveVault).to.be.equal(0);

      expect(_doesArrayInclude(bank.vault, ACCOUNTS[1].address)).to.be.true;
      expect(bank.vault.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.vault.balance).to.be.equal(0);
    });

    it('remove brank', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addBank(ACCOUNTS[1].address);

      let bank = await CONTRACT.connect(ACCOUNTS[0]).getBank(ACCOUNTS[1].address);

      expect(bank.id).to.be.equal(ACCOUNTS[1].address);
      expect(_doesArrayInclude(bank.user, ACCOUNTS[1].address)).to.be.true;
      expect(bank.user.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.user.general).to.be.equal(0);
      expect(bank.user.collectionCommission).to.be.equal(0);

      expect(_doesArrayInclude(bank.collection, ACCOUNTS[1].address)).to.be.true;
      expect(bank.collection.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.collection.reflectionVault).to.be.an('array').that.is.empty;
      expect(bank.collection.incentiveVault).to.be.equal(0);

      expect(_doesArrayInclude(bank.vault, ACCOUNTS[1].address)).to.be.true;
      expect(bank.vault.id).to.be.equal(ACCOUNTS[1].address);
      expect(bank.vault.balance).to.be.equal(0);

      await CONTRACT.connect(ACCOUNTS[0])._removeBank(ACCOUNTS[1].address);

      bank = await CONTRACT.connect(ACCOUNTS[0]).getBank(ACCOUNTS[1].address)
      .should.be.rejectedWith('The bank for this user does not exist');
    });
  });

  describe('Monetary functions', async () => {

    it('claim general reward user account - not owner', async () => {
      await CONTRACT.connect(ACCOUNTS[1]).claimGeneralRewardUserAccount(ACCOUNTS[1].address)
        .should.be.rejectedWith('Ownable: caller is not the owner');
    });
    it('claim general reward user account - owner account does not exist', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).claimGeneralRewardUserAccount(ACCOUNTS[0].address)
        .should.be.rejectedWith('The account for this user does not exist');
    });
    it('claim general reward user account - no balance', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addBank(ACCOUNTS[1].address);

      let balance = await CONTRACT.provider.getBalance(CONTRACT.address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      balance = await CONTRACT.connect(ACCOUNTS[0]).getGeneralUserAccount(ACCOUNTS[1].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');

      await CONTRACT.connect(ACCOUNTS[0]).claimGeneralRewardUserAccount(ACCOUNTS[1].address);

      balance = await CONTRACT.provider.getBalance(CONTRACT.address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      balance = await CONTRACT.connect(ACCOUNTS[0]).getGeneralUserAccount(ACCOUNTS[1].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
    });
    it('claim general reward user account - yes balance', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addBank(ACCOUNTS[1].address);
      await CONTRACT.connect(ACCOUNTS[0]).incrementUserAccount(ACCOUNTS[1].address, ethers.utils.parseEther('5'), 0, 0);

      let balance = await CONTRACT.provider.getBalance(CONTRACT.address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      balance = await CONTRACT.connect(ACCOUNTS[0]).getGeneralUserAccount(ACCOUNTS[1].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('5.0');

      await CONTRACT.connect(ACCOUNTS[0]).claimGeneralRewardUserAccount(ACCOUNTS[1].address);

      balance = await CONTRACT.provider.getBalance(CONTRACT.address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      balance = await CONTRACT.connect(ACCOUNTS[0]).getGeneralUserAccount(ACCOUNTS[1].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
    });

    it('claim nft commission reward user account - not owner', async () => {
      await CONTRACT.connect(ACCOUNTS[1]).claimNftCommissionRewardUserAccount(ACCOUNTS[1].address)
        .should.be.rejectedWith('Ownable: caller is not the owner');
    });
    it('claim nft commission reward user account - owner account does not exist', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).claimNftCommissionRewardUserAccount(ACCOUNTS[0].address)
        .should.be.rejectedWith('The account for this user does not exist');
    });
    it('claim nft commission reward user account - no balance', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addBank(ACCOUNTS[1].address);

      let balance = await CONTRACT.provider.getBalance(CONTRACT.address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      balance = await CONTRACT.connect(ACCOUNTS[0]).getNftCommissionUserAccount(ACCOUNTS[1].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');

      await CONTRACT.connect(ACCOUNTS[0]).claimNftCommissionRewardUserAccount(ACCOUNTS[1].address);

      balance = await CONTRACT.provider.getBalance(CONTRACT.address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      balance = await CONTRACT.connect(ACCOUNTS[0]).getNftCommissionUserAccount(ACCOUNTS[1].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
    });
    it('claim nft commission reward user account - yes balance', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addBank(ACCOUNTS[1].address);
      await CONTRACT.connect(ACCOUNTS[0]).incrementUserAccount(ACCOUNTS[1].address, 0, ethers.utils.parseEther('5'), 0);

      let balance = await CONTRACT.provider.getBalance(CONTRACT.address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      balance = await CONTRACT.connect(ACCOUNTS[0]).getNftCommissionUserAccount(ACCOUNTS[1].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('5.0');

      await CONTRACT.connect(ACCOUNTS[0]).claimNftCommissionRewardUserAccount(ACCOUNTS[1].address);

      balance = await CONTRACT.provider.getBalance(CONTRACT.address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      balance = await CONTRACT.connect(ACCOUNTS[0]).getNftCommissionUserAccount(ACCOUNTS[1].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
    });

    it('claim collection commission reward user account - not owner', async () => {
      await CONTRACT.connect(ACCOUNTS[1]).claimCollectionCommissionRewardUserAccount(ACCOUNTS[1].address)
        .should.be.rejectedWith('Ownable: caller is not the owner');
    });
    it('claim collection commission reward user account - account does not exist', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).claimCollectionCommissionRewardUserAccount(ACCOUNTS[0].address)
        .should.be.rejectedWith('The account for this user does not exist');
    });
    it('claim collection commission reward user account - no balance', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addBank(ACCOUNTS[1].address);

      let balance = await CONTRACT.provider.getBalance(CONTRACT.address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      balance = await CONTRACT.connect(ACCOUNTS[0]).getCollectionCommissionUserAccount(ACCOUNTS[1].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');

      await CONTRACT.connect(ACCOUNTS[0]).claimCollectionCommissionRewardUserAccount(ACCOUNTS[1].address);

      balance = await CONTRACT.provider.getBalance(CONTRACT.address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      balance = await CONTRACT.connect(ACCOUNTS[0]).getCollectionCommissionUserAccount(ACCOUNTS[1].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
    });
    it('claim collection commission reward user account - yes balance', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addBank(ACCOUNTS[1].address);
      await CONTRACT.connect(ACCOUNTS[0]).incrementUserAccount(ACCOUNTS[1].address, 0, 0, ethers.utils.parseEther('5'));

      let balance = await CONTRACT.provider.getBalance(CONTRACT.address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      balance = await CONTRACT.connect(ACCOUNTS[0]).getCollectionCommissionUserAccount(ACCOUNTS[1].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('5.0');

      await CONTRACT.connect(ACCOUNTS[0]).claimCollectionCommissionRewardUserAccount(ACCOUNTS[1].address);

      balance = await CONTRACT.provider.getBalance(CONTRACT.address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      balance = await CONTRACT.connect(ACCOUNTS[0]).getCollectionCommissionUserAccount(ACCOUNTS[1].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
    });

    it('claim reflection reward collection account - not owner', async () => {
      await CONTRACT.connect(ACCOUNTS[1]).claimReflectionRewardCollectionAccount(2, ACCOUNTS[2].address)
        .should.be.rejectedWith('Ownable: caller is not the owner');
    });
    it('claim reflection reward collection account - account does not exist', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).claimReflectionRewardCollectionAccount(2, ACCOUNTS[2].address)
        .should.be.rejectedWith('The account for this collection does not exist');
    });
    it('claim reflection reward collection account - bank exists - token id out of bounds', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addBank(ACCOUNTS[2].address);

      await CONTRACT.connect(ACCOUNTS[0]).claimReflectionRewardCollectionAccount(1, ACCOUNTS[2].address)
        .should.be.rejectedWith('CollectionAccount: Index out of bounds');
    });
    it('claim reflection reward collection account - bank & vault exists - token id out of bounds', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addBank(ACCOUNTS[2].address);
      await CONTRACT.connect(ACCOUNTS[0]).initReflectionVaultCollectionAccount(ACCOUNTS[2].address, 3);

      await CONTRACT.connect(ACCOUNTS[0]).claimReflectionRewardCollectionAccount(4, ACCOUNTS[2].address)
        .should.be.rejectedWith('CollectionAccount: Index out of bounds');
    });
    it('claim reflection reward collection account - invalid token id', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addBank(ACCOUNTS[2].address);
      await CONTRACT.connect(ACCOUNTS[0]).initReflectionVaultCollectionAccount(ACCOUNTS[2].address, 3);

      await CONTRACT.connect(ACCOUNTS[0]).claimReflectionRewardCollectionAccount(0, ACCOUNTS[2].address)
        .should.be.rejectedWith('Bank: Invalid token id provided');
    });
    it('claim reflection reward collection account - no balance', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addBank(ACCOUNTS[2].address);
      await CONTRACT.connect(ACCOUNTS[0]).initReflectionVaultCollectionAccount(ACCOUNTS[2].address, 3);

      let balance = await CONTRACT.provider.getBalance(CONTRACT.address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      balance = await CONTRACT.connect(ACCOUNTS[0]).getCollectionCommissionUserAccount(ACCOUNTS[2].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');

      await CONTRACT.connect(ACCOUNTS[0]).claimReflectionRewardCollectionAccount(2, ACCOUNTS[2].address);

      balance = await CONTRACT.provider.getBalance(CONTRACT.address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      balance = await CONTRACT.connect(ACCOUNTS[0]).getCollectionCommissionUserAccount(ACCOUNTS[2].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
    });
    it('claim reflection reward collection account - yes balance', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addBank(ACCOUNTS[2].address);
      await CONTRACT.connect(ACCOUNTS[0]).initReflectionVaultCollectionAccount(ACCOUNTS[2].address, 3);
      await CONTRACT.connect(ACCOUNTS[0]).incrementCollectionAccount(ACCOUNTS[2].address, ethers.utils.parseEther('5'), 0);

      let balance = await CONTRACT.provider.getBalance(CONTRACT.address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      balance = await CONTRACT.connect(ACCOUNTS[0]).getReflectionRewardCollectionAccount(2, ACCOUNTS[2].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('5.0');

      await CONTRACT.connect(ACCOUNTS[0]).claimReflectionRewardCollectionAccount(2, ACCOUNTS[2].address);

      balance = await CONTRACT.provider.getBalance(CONTRACT.address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      balance = await CONTRACT.connect(ACCOUNTS[0]).getCollectionCommissionUserAccount(ACCOUNTS[2].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
    });

    it('distribute collection reflection - not owner', async () => {
      await CONTRACT.connect(ACCOUNTS[1]).distributeCollectionReflectionReward(ACCOUNTS[2].address, 3, ethers.utils.parseEther('6'))
        .should.be.rejectedWith('Ownable: caller is not the owner');
    });
    it('distribute collection reflection - account does not exist', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).distributeCollectionReflectionReward(ACCOUNTS[2].address, 3, ethers.utils.parseEther('6'))
        .should.be.rejectedWith('The account for this collection does not exist');
    });
    it('distribute collection reflection - no existing balance', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addBank(ACCOUNTS[2].address);
      await CONTRACT.connect(ACCOUNTS[0]).initReflectionVaultCollectionAccount(ACCOUNTS[2].address, 3);

      let balance = await CONTRACT.provider.getBalance(CONTRACT.address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      balance = await CONTRACT.connect(ACCOUNTS[0]).getReflectionRewardCollectionAccount(1, ACCOUNTS[2].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');

      // distribute 2 ether among 3 users
      await CONTRACT.connect(ACCOUNTS[0]).distributeCollectionReflectionReward(ACCOUNTS[2].address, 3, ethers.utils.parseEther('6'));

      balance = await CONTRACT.provider.getBalance(CONTRACT.address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      balance = await CONTRACT.connect(ACCOUNTS[0]).getReflectionRewardCollectionAccount(1, ACCOUNTS[2].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('2.0');
    });
    it('distribute collection reflection - yes existing balance', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addBank(ACCOUNTS[2].address);
      await CONTRACT.connect(ACCOUNTS[0]).initReflectionVaultCollectionAccount(ACCOUNTS[2].address, 3);
      await CONTRACT.connect(ACCOUNTS[0]).incrementCollectionAccount(ACCOUNTS[2].address, ethers.utils.parseEther('5'), 0);

      let balance = await CONTRACT.provider.getBalance(CONTRACT.address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      balance = await CONTRACT.connect(ACCOUNTS[0]).getReflectionRewardCollectionAccount(1, ACCOUNTS[2].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('5.0');

      // distribute 2 ether among 3 users
      await CONTRACT.connect(ACCOUNTS[0]).distributeCollectionReflectionReward(ACCOUNTS[2].address, 3, ethers.utils.parseEther('3'));
      await CONTRACT.connect(ACCOUNTS[0]).distributeCollectionReflectionReward(ACCOUNTS[2].address, 3, ethers.utils.parseEther('6'));

      balance = await CONTRACT.provider.getBalance(CONTRACT.address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      balance = await CONTRACT.connect(ACCOUNTS[0]).getReflectionRewardCollectionAccount(1, ACCOUNTS[2].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('8.0');
    });

    it('update collection incentive reward - increase - not owner', async () => {
      await CONTRACT.connect(ACCOUNTS[1]).updateCollectionIncentiveReward(ACCOUNTS[2].address, ethers.utils.parseEther('5'), true)
        .should.be.rejectedWith('Ownable: caller is not the owner');
    });
    it('update collection incentive reward - decrease - not owner', async () => {
      await CONTRACT.connect(ACCOUNTS[1]).updateCollectionIncentiveReward(ACCOUNTS[2].address, ethers.utils.parseEther('5'), false)
        .should.be.rejectedWith('Ownable: caller is not the owner');
    });
    it('update collection incentive reward - increase - account does not exist', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).updateCollectionIncentiveReward(ACCOUNTS[2].address, ethers.utils.parseEther('5'), true)
        .should.be.rejectedWith('The account for this collection does not exist');
    });
    it('update collection incentive reward - decrease - account does not exist', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).updateCollectionIncentiveReward(ACCOUNTS[2].address, ethers.utils.parseEther('5'), false)
        .should.be.rejectedWith('The account for this collection does not exist');
    });
    it('update collection incentive reward - increase - no existing balance', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addBank(ACCOUNTS[2].address);

      let balance = await CONTRACT.provider.getBalance(CONTRACT.address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      balance = await CONTRACT.connect(ACCOUNTS[0]).getIncentiveVaultCollectionAccount(ACCOUNTS[2].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');

      await CONTRACT.connect(ACCOUNTS[0]).updateCollectionIncentiveReward(ACCOUNTS[2].address, ethers.utils.parseEther('5'), true);

      balance = await CONTRACT.provider.getBalance(CONTRACT.address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      balance = await CONTRACT.connect(ACCOUNTS[0]).getIncentiveVaultCollectionAccount(ACCOUNTS[2].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('5.0');
    });
    it('update collection incentive reward - increase - yes existing balance', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addBank(ACCOUNTS[2].address);
      await CONTRACT.connect(ACCOUNTS[0]).incrementCollectionAccount(ACCOUNTS[2].address, 0, ethers.utils.parseEther('4'));

      let balance = await CONTRACT.provider.getBalance(CONTRACT.address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      balance = await CONTRACT.connect(ACCOUNTS[0]).getIncentiveVaultCollectionAccount(ACCOUNTS[2].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('4.0');

      await CONTRACT.connect(ACCOUNTS[0]).updateCollectionIncentiveReward(ACCOUNTS[2].address, ethers.utils.parseEther('5'), true);

      balance = await CONTRACT.provider.getBalance(CONTRACT.address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      balance = await CONTRACT.connect(ACCOUNTS[0]).getIncentiveVaultCollectionAccount(ACCOUNTS[2].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('9.0');
    });
    it('update collection incentive reward - decrease - no existing balance', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addBank(ACCOUNTS[2].address);

      let balance = await CONTRACT.provider.getBalance(CONTRACT.address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      balance = await CONTRACT.connect(ACCOUNTS[0]).getIncentiveVaultCollectionAccount(ACCOUNTS[2].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');

      await CONTRACT.connect(ACCOUNTS[0]).updateCollectionIncentiveReward(ACCOUNTS[2].address, ethers.utils.parseEther('5'), false)
        .should.be.rejectedWith('Bank: Passed in value must be greater than vault balance');
    });
    it('update collection incentive reward - decrease - yes existing balance', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addBank(ACCOUNTS[2].address);
      await CONTRACT.connect(ACCOUNTS[0]).incrementCollectionAccount(ACCOUNTS[2].address, 0, ethers.utils.parseEther('5'));

      let balance = await CONTRACT.provider.getBalance(CONTRACT.address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      balance = await CONTRACT.connect(ACCOUNTS[0]).getIncentiveVaultCollectionAccount(ACCOUNTS[2].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('5.0');

      await CONTRACT.connect(ACCOUNTS[0]).updateCollectionIncentiveReward(ACCOUNTS[2].address, ethers.utils.parseEther('4'), false);

      balance = await CONTRACT.provider.getBalance(CONTRACT.address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      balance = await CONTRACT.connect(ACCOUNTS[0]).getIncentiveVaultCollectionAccount(ACCOUNTS[2].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('1.0');
    });
    it('update collection incentive reward - decrease - yes existing balance - all', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addBank(ACCOUNTS[2].address);
      await CONTRACT.connect(ACCOUNTS[0]).incrementCollectionAccount(ACCOUNTS[2].address, 0, ethers.utils.parseEther('5'));

      let balance = await CONTRACT.provider.getBalance(CONTRACT.address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      balance = await CONTRACT.connect(ACCOUNTS[0]).getIncentiveVaultCollectionAccount(ACCOUNTS[2].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('5.0');

      await CONTRACT.connect(ACCOUNTS[0]).updateCollectionIncentiveReward(ACCOUNTS[2].address, ethers.utils.parseEther('5'), false);

      balance = await CONTRACT.provider.getBalance(CONTRACT.address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      balance = await CONTRACT.connect(ACCOUNTS[0]).getIncentiveVaultCollectionAccount(ACCOUNTS[2].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
    });
    it('update collection incentive reward - decrease - yes existing balance - overdraft', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addBank(ACCOUNTS[2].address);
      await CONTRACT.connect(ACCOUNTS[0]).incrementCollectionAccount(ACCOUNTS[2].address, 0, ethers.utils.parseEther('4'));

      let balance = await CONTRACT.provider.getBalance(CONTRACT.address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.0');
      balance = await CONTRACT.connect(ACCOUNTS[0]).getIncentiveVaultCollectionAccount(ACCOUNTS[2].address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('4.0');

      await CONTRACT.connect(ACCOUNTS[0]).updateCollectionIncentiveReward(ACCOUNTS[2].address, ethers.utils.parseEther('5'), false)
        .should.be.rejectedWith('Bank: Passed in value must be greater than vault balance');
    });

  });

});
