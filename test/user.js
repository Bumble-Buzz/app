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
describe("AvaxTrade - User", () => {
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

  describe('User addresses', async () => {
    // address[] private USER_ADDRESSES;

    it('get user addresses', async () => {
      const result = await CONTRACT.connect(ACCOUNTS[0])._getUserAddresses();
      expect(result).to.be.an('array').that.is.empty;
    });
    it('add user address', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addUserAddress(ACCOUNTS[1].address);
      const result = await CONTRACT.connect(ACCOUNTS[0])._getUserAddresses();
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result).to.deep.include(ACCOUNTS[1].address);
    });
    it('is user address unique', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addUserAddress(ACCOUNTS[1].address);
      expect(await CONTRACT.connect(ACCOUNTS[0])._isUserAddressesUnique(ACCOUNTS[1].address)).to.be.false;
      expect(await CONTRACT.connect(ACCOUNTS[0])._isUserAddressesUnique(ACCOUNTS[2].address)).to.be.true;
    });
    it('remove user address - one user', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addUser(ACCOUNTS[1].address);

      let result = await CONTRACT.connect(ACCOUNTS[0])._getUserAddresses();
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result).to.deep.include(ACCOUNTS[1].address);

      await CONTRACT.connect(ACCOUNTS[0])._removeUserAddress(ACCOUNTS[1].address);

      result = await CONTRACT.connect(ACCOUNTS[0])._getUserAddresses();
      expect(result).to.be.an('array').that.is.empty;
    });
    it('remove user address - two same users', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addUser(ACCOUNTS[1].address);
      await CONTRACT.connect(ACCOUNTS[0])._addUser(ACCOUNTS[1].address);

      let result = await CONTRACT.connect(ACCOUNTS[0])._getUserAddresses();
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result).to.deep.include(ACCOUNTS[1].address);

      await CONTRACT.connect(ACCOUNTS[0])._removeUserAddress(ACCOUNTS[1].address);

      result = await CONTRACT.connect(ACCOUNTS[0])._getUserAddresses();
      expect(result).to.be.an('array').that.is.empty;
    });
    it('remove user address - two different users', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addUser(ACCOUNTS[1].address);
      await CONTRACT.connect(ACCOUNTS[0])._addUser(ACCOUNTS[2].address);

      let result = await CONTRACT.connect(ACCOUNTS[0])._getUserAddresses();
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result).to.deep.include(ACCOUNTS[1].address);

      await CONTRACT.connect(ACCOUNTS[0])._removeUserAddress(ACCOUNTS[1].address);

      result = await CONTRACT.connect(ACCOUNTS[0])._getUserAddresses();
      expect(result).to.be.an('array').that.is.not.empty;
      expect(_doesArrayInclude(result, ACCOUNTS[2].address)).to.be.true;
      expect(await CONTRACT.connect(ACCOUNTS[0])._isUserAddressesUnique(ACCOUNTS[1].address)).to.be.true;
      expect(await CONTRACT.connect(ACCOUNTS[0])._isUserAddressesUnique(ACCOUNTS[2].address)).to.be.false;
    });
  });

  describe('Main functions', async () => {
    // {
    //   address id; // address of the user
    //   Counters.Counter totalItemsSold;
    //   Counters.Counter totalItemsBought;
    // }

    it('get all users', async () => {
      const result = await CONTRACT.connect(ACCOUNTS[0])._getAllUsers();
      expect(result).to.be.an('array').that.is.empty;
    });
    it('get user 1 - does not exist', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._getUser(ACCOUNTS[1].address)
        .should.be.rejectedWith('The user does not exist');
    });

    it('add user', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addUser(ACCOUNTS[1].address);

      const user = await CONTRACT.connect(ACCOUNTS[0])._getUser(ACCOUNTS[1].address);
      expect(user.id).to.be.equal(ACCOUNTS[1].address);
      expect(user.totalItemsSold).to.be.equal(0);
      expect(user.totalItemsBought).to.be.equal(0);

      const users = await CONTRACT.connect(ACCOUNTS[0])._getAllUsers();
      expect(users).to.be.an('array').that.is.not.empty;
      expect(users.length).to.be.equal(1);
    });
    it('add multiple same users', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addUser(ACCOUNTS[1].address);
      await CONTRACT.connect(ACCOUNTS[0])._addUser(ACCOUNTS[1].address);
      await CONTRACT.connect(ACCOUNTS[0])._addUser(ACCOUNTS[1].address);

      const user = await CONTRACT.connect(ACCOUNTS[0])._getUser(ACCOUNTS[1].address);
      expect(user.id).to.be.equal(ACCOUNTS[1].address);
      expect(user.totalItemsSold).to.be.equal(0);
      expect(user.totalItemsBought).to.be.equal(0);

      const users = await CONTRACT.connect(ACCOUNTS[0])._getAllUsers();
      expect(users).to.be.an('array').that.is.not.empty;
      expect(users.length).to.be.equal(1);
    });
    it('add multiple different users', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addUser(ACCOUNTS[1].address);
      await CONTRACT.connect(ACCOUNTS[0])._addUser(ACCOUNTS[2].address);
      await CONTRACT.connect(ACCOUNTS[0])._addUser(ACCOUNTS[3].address);

      const users = await CONTRACT.connect(ACCOUNTS[0])._getAllUsers();
      expect(users).to.be.an('array').that.is.not.empty;
      expect(users.length).to.be.equal(3);

      expect(users[0].id).to.be.equal(ACCOUNTS[1].address);
      expect(users[0].totalItemsSold).to.be.equal(0);
      expect(users[0].totalItemsBought).to.be.equal(0);

      expect(users[1].id).to.be.equal(ACCOUNTS[2].address);
      expect(users[1].totalItemsSold).to.be.equal(0);
      expect(users[1].totalItemsBought).to.be.equal(0);

      expect(users[2].id).to.be.equal(ACCOUNTS[3].address);
      expect(users[2].totalItemsSold).to.be.equal(0);
      expect(users[2].totalItemsBought).to.be.equal(0);
    });
    it('update user', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addUser(ACCOUNTS[1].address);

      let users = await CONTRACT.connect(ACCOUNTS[0])._getAllUsers();
      expect(users).to.be.an('array').that.is.not.empty;
      expect(users.length).to.be.equal(1);

      expect(users[0].id).to.be.equal(ACCOUNTS[1].address);
      expect(users[0].totalItemsSold).to.be.equal(0);
      expect(users[0].totalItemsBought).to.be.equal(0);

      await CONTRACT.connect(ACCOUNTS[0])._updateUser(ACCOUNTS[1].address, 1, 2);

      users = await CONTRACT.connect(ACCOUNTS[0])._getAllUsers();
      expect(users).to.be.an('array').that.is.not.empty;
      expect(users.length).to.be.equal(1);

      expect(users[0].id).to.be.equal(ACCOUNTS[1].address);
      expect(users[0].totalItemsSold).to.be.equal(1);
      expect(users[0].totalItemsBought).to.be.equal(2);
    });
    it('remove user - no remaining', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addUser(ACCOUNTS[1].address);

      let users = await CONTRACT.connect(ACCOUNTS[0])._getAllUsers();
      expect(users).to.be.an('array').that.is.not.empty;
      expect(users.length).to.be.equal(1);

      expect(users[0].id).to.be.equal(ACCOUNTS[1].address);
      expect(users[0].totalItemsSold).to.be.equal(0);
      expect(users[0].totalItemsBought).to.be.equal(0);

      await CONTRACT.connect(ACCOUNTS[0])._removeUser(ACCOUNTS[1].address);

      users = await CONTRACT.connect(ACCOUNTS[0])._getAllUsers();
      expect(users).to.be.an('array').that.is.empty;
    });
    it('remove user - one remaining', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addUser(ACCOUNTS[1].address);
      await CONTRACT.connect(ACCOUNTS[0])._addUser(ACCOUNTS[2].address);

      let users = await CONTRACT.connect(ACCOUNTS[0])._getAllUsers();
      expect(users).to.be.an('array').that.is.not.empty;
      expect(users.length).to.be.equal(2);
      expect(users[0].id).to.be.equal(ACCOUNTS[1].address);
      expect(users[1].id).to.be.equal(ACCOUNTS[2].address);

      await CONTRACT.connect(ACCOUNTS[0])._removeUser(ACCOUNTS[1].address);

      users = await CONTRACT.connect(ACCOUNTS[0])._getAllUsers();
      expect(users).to.be.an('array').that.is.not.empty;
      expect(users.length).to.be.equal(1);
      expect(users[0].id).to.be.equal(ACCOUNTS[2].address);
      await CONTRACT.connect(ACCOUNTS[0])._getUser(ACCOUNTS[1].address)
        .should.be.rejectedWith('The user does not exist');
    });
  });

  describe('user properties', async () => {
    beforeEach(async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addUser(ACCOUNTS[1].address);
    });

    it('get user total items sold', async () => {
      expect(await CONTRACT.connect(ACCOUNTS[0])._getUserTotalItemsSold(ACCOUNTS[1].address)).to.be.equal(0);
    });
    it('increment user total items sold', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._incrementUserTotalItemsSold(ACCOUNTS[1].address);
      expect(await CONTRACT.connect(ACCOUNTS[0])._getUserTotalItemsSold(ACCOUNTS[1].address)).to.be.equal(1);
    });

    it('get user total items bought', async () => {
      expect(await CONTRACT.connect(ACCOUNTS[0])._getUserTotalItemsBought(ACCOUNTS[1].address)).to.be.equal(0);
    });
    it('increment user total items bought', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._incrementUserTotalItemsBought(ACCOUNTS[1].address);
      expect(await CONTRACT.connect(ACCOUNTS[0])._getUserTotalItemsBought(ACCOUNTS[1].address)).to.be.equal(1);
    });
  });
});
