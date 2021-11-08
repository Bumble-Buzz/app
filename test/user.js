const { assert, expect } = require('chai');
require('chai').use(require('chai-as-promised')).should();
const { ethers } = require("hardhat");

let ACCOUNTS = [];
let CONTRACT;
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

  it('owner', async () => {
    const owner = await CONTRACT.owner();
    expect(owner).to.be.equal(ACCOUNTS[0].address);
  });

  describe('user', async () => {
    it('user does not exist', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).getTotalItemsOnSale(ACCOUNTS[0].address)
        .should.be.rejectedWith('The user does not exist');
    });

    it('add user', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addUser(ACCOUNTS[1].address);
      const items = await CONTRACT.connect(ACCOUNTS[0]).getTotalItemsOnSale(ACCOUNTS[1].address);
      expect(items).to.be.equal('0');
    });
  });

  describe('items on sale', async () => {
    beforeEach(async () => {
      await CONTRACT.connect(ACCOUNTS[1]).addUser(ACCOUNTS[1].address);
    });

    it('get total items on sale', async () => {
      const items = await CONTRACT.connect(ACCOUNTS[1]).getTotalItemsOnSale(ACCOUNTS[1].address);
      expect(items).to.be.equal('0');
    });

    it('add item on sale', async () => {
      await CONTRACT.connect(ACCOUNTS[1]).addItemOnSale(ACCOUNTS[1].address, 123);
      const totalItemsOnSale = await CONTRACT.connect(ACCOUNTS[1]).getTotalItemsOnSale(ACCOUNTS[1].address);
      expect(totalItemsOnSale).to.be.equal('1');
      const temsOnSale = await CONTRACT.connect(ACCOUNTS[1]).getItemsOnSale(ACCOUNTS[1].address);
      expect(temsOnSale.length).to.be.equal(1);
      expect(temsOnSale[0]).to.be.equal(123);
    });

    it('add two items on sale', async () => {
      await CONTRACT.connect(ACCOUNTS[1]).addItemOnSale(ACCOUNTS[1].address, 123);
      await CONTRACT.connect(ACCOUNTS[1]).addItemOnSale(ACCOUNTS[1].address, 456);
      const totalItemsOnSale = await CONTRACT.connect(ACCOUNTS[1]).getTotalItemsOnSale(ACCOUNTS[1].address);
      expect(totalItemsOnSale).to.be.equal('2');
      const temsOnSale = await CONTRACT.connect(ACCOUNTS[1]).getItemsOnSale(ACCOUNTS[1].address);
      expect(temsOnSale.length).to.be.equal(2);
      expect(temsOnSale[0]).to.be.equal(123);
      expect(temsOnSale[1]).to.be.equal(456);
    });

    it('remove item from sale', async () => {
      await CONTRACT.connect(ACCOUNTS[1]).addItemOnSale(ACCOUNTS[1].address, 123);
      await CONTRACT.connect(ACCOUNTS[1]).addItemOnSale(ACCOUNTS[1].address, 456);
      await CONTRACT.connect(ACCOUNTS[1]).addItemOnSale(ACCOUNTS[1].address, 789);

      await CONTRACT.connect(ACCOUNTS[1]).removeItemOnSale(ACCOUNTS[1].address, 456);

      totalItemsOnSale = await CONTRACT.connect(ACCOUNTS[1]).getTotalItemsOnSale(ACCOUNTS[1].address);
      expect(totalItemsOnSale).to.be.equal('2');
      const temsOnSale = await CONTRACT.connect(ACCOUNTS[1]).getItemsOnSale(ACCOUNTS[1].address);
      expect(temsOnSale.length).to.be.equal(2);
      expect(temsOnSale[0]).to.be.equal(123);
      expect(temsOnSale[1]).to.be.equal(789);
    });
  });
});
