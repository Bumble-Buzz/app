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
describe("AvaxTrade - Account", () => {
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

  describe('Main functions', async () => {
    // {
    //   address id; // owner of these accounts
    //   uint256 general; // any general reward balance
    //   uint256 commission; // commission reward balance from the item
    //   uint256 reflection; // reflection reward balance from the collection
    //   uint256 collectionCommission; // commission reward balance from the collection
    // }

    it('get accounts', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._getAccounts([ACCOUNTS[1].address, ACCOUNTS[2].address])
        .should.be.rejectedWith('An account in the list does not exist');
    });
    it('get account 1 - does not exist', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._getAccount(ACCOUNTS[1].address)
        .should.be.rejectedWith('The account for this user does not exist');
    });

    it('add account', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addAccount(ACCOUNTS[1].address);

      const account = await CONTRACT.connect(ACCOUNTS[0])._getAccount(ACCOUNTS[1].address);
      expect(account.id).to.be.equal(ACCOUNTS[1].address);
      expect(account.general).to.be.equal(0);
      expect(account.commission).to.be.equal(0);
      expect(account.reflection).to.be.equal(0);
      expect(account.collectionCommission).to.be.equal(0);
    });
    it('add multiple same accounts', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addAccount(ACCOUNTS[1].address);
      await CONTRACT.connect(ACCOUNTS[0])._addAccount(ACCOUNTS[1].address);

      const account = await CONTRACT.connect(ACCOUNTS[0])._getAccount(ACCOUNTS[1].address);
      expect(account.id).to.be.equal(ACCOUNTS[1].address);
      expect(account.general).to.be.equal(0);
      expect(account.commission).to.be.equal(0);
      expect(account.reflection).to.be.equal(0);
      expect(account.collectionCommission).to.be.equal(0);
    });
    it('add multiple different accounts', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addAccount(ACCOUNTS[1].address);
      await CONTRACT.connect(ACCOUNTS[0])._addAccount(ACCOUNTS[2].address);

      let account = await CONTRACT.connect(ACCOUNTS[0])._getAccount(ACCOUNTS[1].address);
      expect(account.id).to.be.equal(ACCOUNTS[1].address);
      expect(account.general).to.be.equal(0);
      expect(account.commission).to.be.equal(0);
      expect(account.reflection).to.be.equal(0);
      expect(account.collectionCommission).to.be.equal(0);

      account = await CONTRACT.connect(ACCOUNTS[0])._getAccount(ACCOUNTS[2].address);
      expect(account.id).to.be.equal(ACCOUNTS[2].address);
      expect(account.general).to.be.equal(0);
      expect(account.commission).to.be.equal(0);
      expect(account.reflection).to.be.equal(0);
      expect(account.collectionCommission).to.be.equal(0);

      const accounts = await CONTRACT.connect(ACCOUNTS[0])._getAccounts([ACCOUNTS[1].address, ACCOUNTS[2].address]);
      expect(accounts.length).to.be.equal(2);

      expect(accounts[0].id).to.be.equal(ACCOUNTS[1].address);
      expect(accounts[0].general).to.be.equal(0);
      expect(accounts[0].commission).to.be.equal(0);
      expect(accounts[0].reflection).to.be.equal(0);
      expect(accounts[0].collectionCommission).to.be.equal(0);

      expect(accounts[1].id).to.be.equal(ACCOUNTS[2].address);
      expect(accounts[1].general).to.be.equal(0);
      expect(accounts[1].commission).to.be.equal(0);
      expect(accounts[1].reflection).to.be.equal(0);
      expect(accounts[1].collectionCommission).to.be.equal(0);
    });

    it('update account', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addAccount(ACCOUNTS[1].address);

      let account = await CONTRACT.connect(ACCOUNTS[0])._getAccount(ACCOUNTS[1].address);
      expect(account.id).to.be.equal(ACCOUNTS[1].address);
      expect(account.general).to.be.equal(0);
      expect(account.commission).to.be.equal(0);
      expect(account.reflection).to.be.equal(0);
      expect(account.collectionCommission).to.be.equal(0);

      await CONTRACT.connect(ACCOUNTS[0])._updateAccount(ACCOUNTS[1].address, 1, 2, 3, 4);

      account = await CONTRACT.connect(ACCOUNTS[0])._getAccount(ACCOUNTS[1].address);
      expect(account.id).to.be.equal(ACCOUNTS[1].address);
      expect(account.general).to.be.equal(1);
      expect(account.commission).to.be.equal(2);
      expect(account.reflection).to.be.equal(3);
      expect(account.collectionCommission).to.be.equal(4);
    });
    it('update one account out of many', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addAccount(ACCOUNTS[1].address);
      await CONTRACT.connect(ACCOUNTS[0])._addAccount(ACCOUNTS[2].address);
      await CONTRACT.connect(ACCOUNTS[0])._addAccount(ACCOUNTS[3].address);

      await CONTRACT.connect(ACCOUNTS[0])._updateAccount(ACCOUNTS[1].address, 1, 2, 3, 4);

      const account = await CONTRACT.connect(ACCOUNTS[0])._getAccount(ACCOUNTS[1].address);
      expect(account.id).to.be.equal(ACCOUNTS[1].address);
      expect(account.general).to.be.equal(1);
      expect(account.commission).to.be.equal(2);
      expect(account.reflection).to.be.equal(3);
      expect(account.collectionCommission).to.be.equal(4);

      const accounts = await CONTRACT.connect(ACCOUNTS[0])._getAccounts(
        [ACCOUNTS[1].address, ACCOUNTS[2].address, ACCOUNTS[3].address]
      );
      expect(accounts.length).to.be.equal(3);

      expect(accounts[0].id).to.be.equal(ACCOUNTS[1].address);
      expect(accounts[0].general).to.be.equal(1);
      expect(accounts[0].commission).to.be.equal(2);
      expect(accounts[0].reflection).to.be.equal(3);
      expect(accounts[0].collectionCommission).to.be.equal(4);

      expect(accounts[1].id).to.be.equal(ACCOUNTS[2].address);
      expect(accounts[1].general).to.be.equal(0);
      expect(accounts[1].commission).to.be.equal(0);
      expect(accounts[1].reflection).to.be.equal(0);
      expect(accounts[1].collectionCommission).to.be.equal(0);

      expect(accounts[2].id).to.be.equal(ACCOUNTS[3].address);
      expect(accounts[2].general).to.be.equal(0);
      expect(accounts[2].commission).to.be.equal(0);
      expect(accounts[2].reflection).to.be.equal(0);
      expect(accounts[2].collectionCommission).to.be.equal(0);
    });
    it('update account then add same account', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addAccount(ACCOUNTS[1].address);
      await CONTRACT.connect(ACCOUNTS[0])._updateAccount(ACCOUNTS[1].address, 1, 2, 3, 4);

      let account = await CONTRACT.connect(ACCOUNTS[0])._getAccount(ACCOUNTS[1].address);
      expect(account.id).to.be.equal(ACCOUNTS[1].address);
      expect(account.general).to.be.equal(1);
      expect(account.commission).to.be.equal(2);
      expect(account.reflection).to.be.equal(3);
      expect(account.collectionCommission).to.be.equal(4);

      await CONTRACT.connect(ACCOUNTS[0])._addAccount(ACCOUNTS[1].address);

      account = await CONTRACT.connect(ACCOUNTS[0])._getAccount(ACCOUNTS[1].address);
      expect(account.id).to.be.equal(ACCOUNTS[1].address);
      expect(account.general).to.be.equal(1);
      expect(account.commission).to.be.equal(2);
      expect(account.reflection).to.be.equal(3);
      expect(account.collectionCommission).to.be.equal(4);
    });

    it('nullify account', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addAccount(ACCOUNTS[1].address);

      let account = await CONTRACT.connect(ACCOUNTS[0])._getAccount(ACCOUNTS[1].address);
      expect(account.id).to.be.equal(ACCOUNTS[1].address);
      expect(account.general).to.be.equal(0);
      expect(account.commission).to.be.equal(0);
      expect(account.reflection).to.be.equal(0);
      expect(account.collectionCommission).to.be.equal(0);

      await CONTRACT.connect(ACCOUNTS[0])._updateAccount(ACCOUNTS[1].address, 1, 2, 3, 4);

      account = await CONTRACT.connect(ACCOUNTS[0])._getAccount(ACCOUNTS[1].address);
      expect(account.id).to.be.equal(ACCOUNTS[1].address);
      expect(account.general).to.be.equal(1);
      expect(account.commission).to.be.equal(2);
      expect(account.reflection).to.be.equal(3);
      expect(account.collectionCommission).to.be.equal(4);

      await CONTRACT.connect(ACCOUNTS[0])._nullifyAccount(ACCOUNTS[1].address);

      account = await CONTRACT.connect(ACCOUNTS[0])._getAccount(ACCOUNTS[1].address);
      expect(account.id).to.be.equal(ACCOUNTS[1].address);
      expect(account.general).to.be.equal(0);
      expect(account.commission).to.be.equal(0);
      expect(account.reflection).to.be.equal(0);
      expect(account.collectionCommission).to.be.equal(0);
    });

    it('remove account', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addAccount(ACCOUNTS[1].address);

      let account = await CONTRACT.connect(ACCOUNTS[0])._getAccount(ACCOUNTS[1].address);
      expect(account.id).to.be.equal(ACCOUNTS[1].address);
      expect(account.general).to.be.equal(0);
      expect(account.commission).to.be.equal(0);
      expect(account.reflection).to.be.equal(0);
      expect(account.collectionCommission).to.be.equal(0);

      await CONTRACT.connect(ACCOUNTS[0])._removeAccount(ACCOUNTS[1].address);

      await CONTRACT.connect(ACCOUNTS[0])._getAccount(ACCOUNTS[1].address)
        .should.be.rejectedWith('The account for this user does not exist');
    });
  });

  describe('account properties', async () => {
    beforeEach(async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addAccount(ACCOUNTS[1].address);
    });

    it('get general account', async () => {
      expect(await CONTRACT.connect(ACCOUNTS[0])._getGeneralAccount(ACCOUNTS[1].address)).to.be.equal(0);
    });
    it('update general account', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._updateGeneralAccount(ACCOUNTS[1].address, 1);
      expect(await CONTRACT.connect(ACCOUNTS[0])._getGeneralAccount(ACCOUNTS[1].address)).to.be.equal(1);
    });

    it('get commission account', async () => {
      expect(await CONTRACT.connect(ACCOUNTS[0])._getCommissionAccount(ACCOUNTS[1].address)).to.be.equal(0);
    });
    it('update commission account', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._updateCommissionAccount(ACCOUNTS[1].address, 1);
      expect(await CONTRACT.connect(ACCOUNTS[0])._getCommissionAccount(ACCOUNTS[1].address)).to.be.equal(1);
    });

    it('get reflection account', async () => {
      expect(await CONTRACT.connect(ACCOUNTS[0])._getReflectionAccount(ACCOUNTS[1].address)).to.be.equal(0);
    });
    it('update reflection account', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._updateReflectionAccount(ACCOUNTS[1].address, 1);
      expect(await CONTRACT.connect(ACCOUNTS[0])._getReflectionAccount(ACCOUNTS[1].address)).to.be.equal(1);
    });

    it('get collection commission account', async () => {
      expect(await CONTRACT.connect(ACCOUNTS[0])._getCollectionCommissionAccount(ACCOUNTS[1].address)).to.be.equal(0);
    });
    it('update collection commission account', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._updateCollectionCommissionAccount(ACCOUNTS[1].address, 1);
      expect(await CONTRACT.connect(ACCOUNTS[0])._getCollectionCommissionAccount(ACCOUNTS[1].address)).to.be.equal(1);
    });
  });
});
