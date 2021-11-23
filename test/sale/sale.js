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
};const _doesArrayExpect = (_array, _identifier = {}) => {
  const foundDna = _array.find((arrayElement) => {
      return expect(arrayElement).to.be.equal(_identifier);
  });
  return foundDna == undefined ? false : true;
};
const _doesArrayEqual = (_array, expectedArray = []) => {
  return _(_array).differenceWith(expectedArray, _.isEqual).isEmpty();
};
describe("AvaxTrade - Sale", () => {
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

  describe('Sale items', async () => {
    // uint256[] private SALE_ITEMS;

    it('get total sale item ids', async () => {
      const result = await CONTRACT.connect(ACCOUNTS[0])._getTotalSaleItemIds();
      expect(result).to.be.an('array').that.is.empty;
    });
    it('add total sale item id', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addTotalSaleItemId(123);
      const result = await CONTRACT.connect(ACCOUNTS[0])._getTotalSaleItemIds();
      expect(result).to.be.an('array').that.is.not.empty;
      expect(_doesArrayEqual(result, [ethers.BigNumber.from('123')])).to.be.true;
    });
    it('remove total sale item id - one item', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._createEmptySale(1);

      let result = await CONTRACT.connect(ACCOUNTS[0])._getTotalSaleItemIds();
      expect(result).to.be.an('array').that.is.not.empty;
      expect(_doesArrayEqual(result, [ethers.BigNumber.from('1')])).to.be.true;

      await CONTRACT.connect(ACCOUNTS[0])._removeTotalSaleItemId(1);

      result = await CONTRACT.connect(ACCOUNTS[0])._getTotalSaleItemIds();
      expect(result).to.be.an('array').that.is.empty;
    });
    it('remove total sale item id - two items', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._createEmptySale(1);
      await CONTRACT.connect(ACCOUNTS[0])._createEmptySale(2);

      let result = await CONTRACT.connect(ACCOUNTS[0])._getTotalSaleItemIds();
      expect(result).to.be.an('array').that.is.not.empty;
      expect(_doesArrayEqual(result, [ethers.BigNumber.from('1'),ethers.BigNumber.from('2')])).to.be.true;

      await CONTRACT.connect(ACCOUNTS[0])._removeTotalSaleItemId(1);

      result = await CONTRACT.connect(ACCOUNTS[0])._getTotalSaleItemIds();
      expect(result).to.be.an('array').that.is.not.empty;
      expect(_doesArrayInclude(result, ethers.BigNumber.from('2'))).to.be.true;
    });
  });

  describe('Main functions', async () => {
    // mapping(uint256 => SaleDS) private SALES;

    describe('is valid - init', async () => {
      it('is direct sale valid', async () => {
        await CONTRACT.connect(ACCOUNTS[0])._isDirectSaleValid(123, ACCOUNTS[1].address)
          .should.be.rejectedWith('The sale does not exist');
      });
      it('is immediate sale valid', async () => {
        await CONTRACT.connect(ACCOUNTS[0])._isImmediateSaleValid(123, ACCOUNTS[1].address)
          .should.be.rejectedWith('The sale does not exist');
      });
      it('is auction sale valid', async () => {
        await CONTRACT.connect(ACCOUNTS[0])._isAuctionSaleValid(123, ACCOUNTS[1].address)
          .should.be.rejectedWith('The sale does not exist');
      });
      it('is sale valid', async () => {
        expect(await CONTRACT.connect(ACCOUNTS[0])._isSaleValid(123)).to.be.false;
      });
    });

    describe('get sales - init', async () => {
      it('get all direct sales', async () => {
        const result = await CONTRACT.connect(ACCOUNTS[0])._getAllDirectSales();
        expect(result).to.be.an('array').that.is.empty;
      });
      it('get all immediate sales', async () => {
        const result = await CONTRACT.connect(ACCOUNTS[0])._getAllImmediateSales();
        expect(result).to.be.an('array').that.is.empty;
      });
      it('get all auction sales', async () => {
        const result = await CONTRACT.connect(ACCOUNTS[0])._getAllAuctionSales();
        expect(result).to.be.an('array').that.is.empty;
      });
      it('get all sales', async () => {
        const result = await CONTRACT.connect(ACCOUNTS[0])._getAllSales();
        expect(_doesArrayEqual(result, [[],[],[]])).to.be.true;
      });
    });

    describe('get sales for user - init', async () => {
      it('direct sales', async () => {
        expect(await CONTRACT.connect(ACCOUNTS[0])._getDirectSalesForUser(ACCOUNTS[1].address)).to.be.an('array').that.is.empty;
      });
      it('immediate sales', async () => {
        expect(await CONTRACT.connect(ACCOUNTS[0])._getImmediateSalesForUser(ACCOUNTS[1].address)).to.be.an('array').that.is.empty;
      });
      it('auction sales', async () => {
        expect(await CONTRACT.connect(ACCOUNTS[0])._getAuctionSalesForUser(ACCOUNTS[1].address)).to.be.an('array').that.is.empty;
      });
      it('all sales for user', async () => {
        const result = await CONTRACT.connect(ACCOUNTS[0])._getSalesForUser(ACCOUNTS[1].address);
        expect(_doesArrayEqual(result, [ACCOUNTS[1].address,[],[],[]])).to.be.true;
      });
      it('all sales for users', async () => {
        const result = await CONTRACT.connect(ACCOUNTS[0])._getSalesForUsers([ACCOUNTS[1].address, ACCOUNTS[2].address]);
        const expectedArr = [ [ACCOUNTS[1].address,[],[],[]], [ACCOUNTS[2].address,[],[],[]] ];
        expect(_doesArrayEqual(result, expectedArr)).to.be.true;
      });
    });

    describe('create sales - init', async () => {
      it('create empty sale', async () => {
        await CONTRACT.connect(ACCOUNTS[0])._createEmptySale(1);
        await CONTRACT.connect(ACCOUNTS[0])._createEmptySale(1)
          .should.be.rejectedWith('Sale already exists');
      });
      it('create direct sale', async () => {
        await CONTRACT.connect(ACCOUNTS[0])._createSaleDirect(1, ACCOUNTS[1].address);
        await CONTRACT.connect(ACCOUNTS[0])._createSaleDirect(1, ACCOUNTS[1].address)
          .should.be.rejectedWith('Sale already exists - Direct');
      });
      it('create immediate sale', async () => {
        await CONTRACT.connect(ACCOUNTS[0])._createSaleImmediate(1, ACCOUNTS[1].address);
        await CONTRACT.connect(ACCOUNTS[0])._createSaleImmediate(1, ACCOUNTS[1].address)
          .should.be.rejectedWith('Sale already exists - Immediate');
      });
      it('create auction sale', async () => {
        await CONTRACT.connect(ACCOUNTS[0])._createSaleAuction(1, ACCOUNTS[1].address);
        await CONTRACT.connect(ACCOUNTS[0])._createSaleAuction(1, ACCOUNTS[1].address)
          .should.be.rejectedWith('Sale already exists - Auction');
      });
      it('create sale', async () => {
        await CONTRACT.connect(ACCOUNTS[0])._createSale(1, ACCOUNTS[1].address, 0);
        await CONTRACT.connect(ACCOUNTS[0])._createSale(1, ACCOUNTS[1].address, 0)
          .should.be.rejectedWith('Sale already exists');

        await CONTRACT.connect(ACCOUNTS[0])._createSale(1, ACCOUNTS[1].address, 1)
          .should.be.rejectedWith('Sale already exists');
        await CONTRACT.connect(ACCOUNTS[0])._createSale(2, ACCOUNTS[1].address, 1);
        await CONTRACT.connect(ACCOUNTS[0])._createSale(2, ACCOUNTS[1].address, 1)
          .should.be.rejectedWith('Sale already exists');

        await CONTRACT.connect(ACCOUNTS[0])._createSale(2, ACCOUNTS[1].address, 1)
          .should.be.rejectedWith('Sale already exists');
        await CONTRACT.connect(ACCOUNTS[0])._createSale(3, ACCOUNTS[1].address, 2);
        await CONTRACT.connect(ACCOUNTS[0])._createSale(3, ACCOUNTS[1].address, 2)
          .should.be.rejectedWith('Sale already exists');
      });
      it('create sale - invalid sale type', async () => {
        await CONTRACT.connect(ACCOUNTS[0])._createSale(1, ACCOUNTS[1].address, 3)
          .should.be.rejectedWith('Transaction reverted: function was called with incorrect parameters');
      });
    });

    describe('remove sales - init', async () => {
      it('remove sale', async () => {
        await CONTRACT.connect(ACCOUNTS[0])._removeSale(1, ACCOUNTS[1].address)
          .should.be.rejectedWith('The sale does not exist');
      });
    });

    describe('create sales', async () => {
      it('create empty sale', async () => {
        await CONTRACT.connect(ACCOUNTS[0])._createEmptySale(123);

        let result = await CONTRACT.connect(ACCOUNTS[0])._getTotalSaleItemIds();
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(result, [ethers.BigNumber.from('123')])).to.be.true;

        await CONTRACT.connect(ACCOUNTS[0])._isDirectSaleValid(123, ACCOUNTS[1].address)
          .should.be.rejectedWith('This item is not a direct sale');
        await CONTRACT.connect(ACCOUNTS[0])._isImmediateSaleValid(123, ACCOUNTS[1].address)
          .should.be.rejectedWith('This item is not a immediate sale');
        await CONTRACT.connect(ACCOUNTS[0])._isAuctionSaleValid(123, ACCOUNTS[1].address)
          .should.be.rejectedWith('This item is not a auction sale');
        expect(await CONTRACT.connect(ACCOUNTS[0])._isSaleValid(123)).to.be.true;

        expect(await CONTRACT.connect(ACCOUNTS[0])._getAllDirectSales()).to.be.an('array').that.is.empty;
        expect(await CONTRACT.connect(ACCOUNTS[0])._getAllImmediateSales()).to.be.an('array').that.is.empty;
        expect(await CONTRACT.connect(ACCOUNTS[0])._getAllImmediateSales()).to.be.an('array').that.is.empty;
        result = await CONTRACT.connect(ACCOUNTS[0])._getAllSales();
        expect(_doesArrayEqual(result, [[],[],[]])).to.be.true;

        expect(await CONTRACT.connect(ACCOUNTS[0])._getDirectSalesForUser(ACCOUNTS[1].address)).to.be.an('array').that.is.empty;
        expect(await CONTRACT.connect(ACCOUNTS[0])._getImmediateSalesForUser(ACCOUNTS[1].address)).to.be.an('array').that.is.empty;
        expect(await CONTRACT.connect(ACCOUNTS[0])._getAuctionSalesForUser(ACCOUNTS[1].address)).to.be.an('array').that.is.empty;
        result = await CONTRACT.connect(ACCOUNTS[0])._getSalesForUser(ACCOUNTS[1].address);
        expect(_doesArrayEqual(result, [ACCOUNTS[1].address,[],[],[]])).to.be.true;
        result = await CONTRACT.connect(ACCOUNTS[0])._getSalesForUsers([ACCOUNTS[1].address, ACCOUNTS[2].address]);
        expect(_doesArrayEqual(result, [ [ACCOUNTS[1].address,[],[],[]], [ACCOUNTS[2].address,[],[],[]] ])).to.be.true;
      });
      it('create direct sale', async () => {
        await CONTRACT.connect(ACCOUNTS[0])._createSaleDirect(123, ACCOUNTS[1].address);

        let result = await CONTRACT.connect(ACCOUNTS[0])._getTotalSaleItemIds();
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(result, [ethers.BigNumber.from('123')])).to.be.true;

        expect(await CONTRACT.connect(ACCOUNTS[0])._isDirectSaleValid(123, ACCOUNTS[1].address)).to.be.true;
        await CONTRACT.connect(ACCOUNTS[0])._isImmediateSaleValid(123, ACCOUNTS[1].address)
          .should.be.rejectedWith('This item is not a immediate sale');
        await CONTRACT.connect(ACCOUNTS[0])._isAuctionSaleValid(123, ACCOUNTS[1].address)
          .should.be.rejectedWith('This item is not a auction sale');
        expect(await CONTRACT.connect(ACCOUNTS[0])._isSaleValid(123)).to.be.true;

        result = await CONTRACT.connect(ACCOUNTS[0])._getAllDirectSales();
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(result, [ethers.BigNumber.from('123')])).to.be.true;
        expect(await CONTRACT.connect(ACCOUNTS[0])._getAllImmediateSales()).to.be.an('array').that.is.empty;
        expect(await CONTRACT.connect(ACCOUNTS[0])._getAllAuctionSales()).to.be.an('array').that.is.empty;
        result = await CONTRACT.connect(ACCOUNTS[0])._getAllSales();
        expect(_doesArrayEqual(result, [[ethers.BigNumber.from('123')],[],[]])).to.be.true;

        result = await CONTRACT.connect(ACCOUNTS[0])._getDirectSalesForUser(ACCOUNTS[1].address);
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(result, [ethers.BigNumber.from('123')])).to.be.true;
        expect(await CONTRACT.connect(ACCOUNTS[0])._getImmediateSalesForUser(ACCOUNTS[1].address)).to.be.an('array').that.is.empty;
        expect(await CONTRACT.connect(ACCOUNTS[0])._getAuctionSalesForUser(ACCOUNTS[1].address)).to.be.an('array').that.is.empty;
        result = await CONTRACT.connect(ACCOUNTS[0])._getSalesForUser(ACCOUNTS[1].address);
        expect(_doesArrayEqual(result, [ACCOUNTS[1].address,[ethers.BigNumber.from('123')],[],[]])).to.be.true;
        result = await CONTRACT.connect(ACCOUNTS[0])._getSalesForUsers([ACCOUNTS[1].address, ACCOUNTS[2].address]);
        expect(_doesArrayEqual(result, [ [ACCOUNTS[1].address,[ethers.BigNumber.from('123')],[],[]], [ACCOUNTS[2].address,[],[],[]] ])).to.be.true;
      });
      it('create immediate sale', async () => {
        await CONTRACT.connect(ACCOUNTS[0])._createSaleImmediate(123, ACCOUNTS[1].address);

        let result = await CONTRACT.connect(ACCOUNTS[0])._getTotalSaleItemIds();
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(result, [ethers.BigNumber.from('123')])).to.be.true;

        await CONTRACT.connect(ACCOUNTS[0])._isDirectSaleValid(123, ACCOUNTS[1].address)
          .should.be.rejectedWith('This item is not a direct sale');
        expect(await CONTRACT.connect(ACCOUNTS[0])._isImmediateSaleValid(123, ACCOUNTS[1].address)).to.be.true;
        await CONTRACT.connect(ACCOUNTS[0])._isAuctionSaleValid(123, ACCOUNTS[1].address)
          .should.be.rejectedWith('This item is not a auction sale');
        expect(await CONTRACT.connect(ACCOUNTS[0])._isSaleValid(123)).to.be.true;

        expect(await CONTRACT.connect(ACCOUNTS[0])._getAllDirectSales()).to.be.an('array').that.is.empty;
        result = await CONTRACT.connect(ACCOUNTS[0])._getAllImmediateSales();
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(result, [ethers.BigNumber.from('123')])).to.be.true;
        expect(await CONTRACT.connect(ACCOUNTS[0])._getAllAuctionSales()).to.be.an('array').that.is.empty;
        result = await CONTRACT.connect(ACCOUNTS[0])._getAllSales();
        expect(_doesArrayEqual(result, [[],[ethers.BigNumber.from('123')],[]])).to.be.true;

        expect(await CONTRACT.connect(ACCOUNTS[0])._getDirectSalesForUser(ACCOUNTS[1].address)).to.be.an('array').that.is.empty;
        result = await CONTRACT.connect(ACCOUNTS[0])._getImmediateSalesForUser(ACCOUNTS[1].address);
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(result, [ethers.BigNumber.from('123')])).to.be.true;
        expect(await CONTRACT.connect(ACCOUNTS[0])._getAuctionSalesForUser(ACCOUNTS[1].address)).to.be.an('array').that.is.empty;
        result = await CONTRACT.connect(ACCOUNTS[0])._getSalesForUser(ACCOUNTS[1].address);
        expect(_doesArrayEqual(result, [ACCOUNTS[1].address,[],[ethers.BigNumber.from('123')],[]])).to.be.true;
        result = await CONTRACT.connect(ACCOUNTS[0])._getSalesForUsers([ACCOUNTS[1].address, ACCOUNTS[2].address]);
        expect(_doesArrayEqual(result, [ [ACCOUNTS[1].address,[],[ethers.BigNumber.from('123')],[]], [ACCOUNTS[2].address,[],[],[]] ])).to.be.true;
      });
      it('create auction sale', async () => {
        await CONTRACT.connect(ACCOUNTS[0])._createSaleAuction(123, ACCOUNTS[1].address);

        let result = await CONTRACT.connect(ACCOUNTS[0])._getTotalSaleItemIds();
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(result, [ethers.BigNumber.from('123')])).to.be.true;

        await CONTRACT.connect(ACCOUNTS[0])._isDirectSaleValid(123, ACCOUNTS[1].address)
          .should.be.rejectedWith('This item is not a direct sale');
        await CONTRACT.connect(ACCOUNTS[0])._isImmediateSaleValid(123, ACCOUNTS[1].address)
          .should.be.rejectedWith('This item is not a immediate sale');
        expect(await CONTRACT.connect(ACCOUNTS[0])._isAuctionSaleValid(123, ACCOUNTS[1].address)).to.be.true;
        expect(await CONTRACT.connect(ACCOUNTS[0])._isSaleValid(123)).to.be.true;

        expect(await CONTRACT.connect(ACCOUNTS[0])._getAllDirectSales()).to.be.an('array').that.is.empty;
        expect(await CONTRACT.connect(ACCOUNTS[0])._getAllImmediateSales()).to.be.an('array').that.is.empty;
        result = await CONTRACT.connect(ACCOUNTS[0])._getAllAuctionSales();
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(result, [ethers.BigNumber.from('123')])).to.be.true;
        result = await CONTRACT.connect(ACCOUNTS[0])._getAllSales();
        expect(_doesArrayEqual(result, [[],[],[ethers.BigNumber.from('123')]])).to.be.true;

        expect(await CONTRACT.connect(ACCOUNTS[0])._getDirectSalesForUser(ACCOUNTS[1].address)).to.be.an('array').that.is.empty;
        expect(await CONTRACT.connect(ACCOUNTS[0])._getImmediateSalesForUser(ACCOUNTS[1].address)).to.be.an('array').that.is.empty;
        result = await CONTRACT.connect(ACCOUNTS[0])._getAuctionSalesForUser(ACCOUNTS[1].address);
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(result, [ethers.BigNumber.from('123')])).to.be.true;
        result = await CONTRACT.connect(ACCOUNTS[0])._getSalesForUser(ACCOUNTS[1].address);
        expect(_doesArrayEqual(result, [ACCOUNTS[1].address,[],[],[ethers.BigNumber.from('123')]])).to.be.true;
        result = await CONTRACT.connect(ACCOUNTS[0])._getSalesForUsers([ACCOUNTS[1].address, ACCOUNTS[2].address]);
        expect(_doesArrayEqual(result, [ [ACCOUNTS[1].address,[],[],[ethers.BigNumber.from('123')]], [ACCOUNTS[2].address,[],[],[]] ])).to.be.true;
      });
      it('create sale - direct', async () => {
        await CONTRACT.connect(ACCOUNTS[0])._createSale(123, ACCOUNTS[1].address, 0);

        let result = await CONTRACT.connect(ACCOUNTS[0])._getTotalSaleItemIds();
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(result, [ethers.BigNumber.from('123')])).to.be.true;

        expect(await CONTRACT.connect(ACCOUNTS[0])._isDirectSaleValid(123, ACCOUNTS[1].address)).to.be.true;
        await CONTRACT.connect(ACCOUNTS[0])._isImmediateSaleValid(123, ACCOUNTS[1].address)
          .should.be.rejectedWith('This item is not a immediate sale');
        await CONTRACT.connect(ACCOUNTS[0])._isAuctionSaleValid(123, ACCOUNTS[1].address)
          .should.be.rejectedWith('This item is not a auction sale');
        expect(await CONTRACT.connect(ACCOUNTS[0])._isSaleValid(123)).to.be.true;

        result = await CONTRACT.connect(ACCOUNTS[0])._getAllDirectSales();
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(result, [ethers.BigNumber.from('123')])).to.be.true;
        expect(await CONTRACT.connect(ACCOUNTS[0])._getAllImmediateSales()).to.be.an('array').that.is.empty;
        expect(await CONTRACT.connect(ACCOUNTS[0])._getAllAuctionSales()).to.be.an('array').that.is.empty;
        result = await CONTRACT.connect(ACCOUNTS[0])._getAllSales();
        expect(_doesArrayEqual(result, [[ethers.BigNumber.from('123')],[],[]])).to.be.true;

        result = await CONTRACT.connect(ACCOUNTS[0])._getDirectSalesForUser(ACCOUNTS[1].address);
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(result, [ethers.BigNumber.from('123')])).to.be.true;
        expect(await CONTRACT.connect(ACCOUNTS[0])._getImmediateSalesForUser(ACCOUNTS[1].address)).to.be.an('array').that.is.empty;
        expect(await CONTRACT.connect(ACCOUNTS[0])._getAuctionSalesForUser(ACCOUNTS[1].address)).to.be.an('array').that.is.empty;
        result = await CONTRACT.connect(ACCOUNTS[0])._getSalesForUser(ACCOUNTS[1].address);
        expect(_doesArrayEqual(result, [ACCOUNTS[1].address,[ethers.BigNumber.from('123')],[],[]])).to.be.true;
        result = await CONTRACT.connect(ACCOUNTS[0])._getSalesForUsers([ACCOUNTS[1].address, ACCOUNTS[2].address]);
        expect(_doesArrayEqual(result, [ [ACCOUNTS[1].address,[ethers.BigNumber.from('123')],[],[]], [ACCOUNTS[2].address,[],[],[]] ])).to.be.true;
      });
      it('create sale - immediate', async () => {
        await CONTRACT.connect(ACCOUNTS[0])._createSale(123, ACCOUNTS[1].address, 1);

        let result = await CONTRACT.connect(ACCOUNTS[0])._getTotalSaleItemIds();
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(result, [ethers.BigNumber.from('123')])).to.be.true;

        await CONTRACT.connect(ACCOUNTS[0])._isDirectSaleValid(123, ACCOUNTS[1].address)
          .should.be.rejectedWith('This item is not a direct sale');
        expect(await CONTRACT.connect(ACCOUNTS[0])._isImmediateSaleValid(123, ACCOUNTS[1].address)).to.be.true;
        await CONTRACT.connect(ACCOUNTS[0])._isAuctionSaleValid(123, ACCOUNTS[1].address)
          .should.be.rejectedWith('This item is not a auction sale');
        expect(await CONTRACT.connect(ACCOUNTS[0])._isSaleValid(123)).to.be.true;

        expect(await CONTRACT.connect(ACCOUNTS[0])._getAllDirectSales()).to.be.an('array').that.is.empty;
        result = await CONTRACT.connect(ACCOUNTS[0])._getAllImmediateSales();
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(result, [ethers.BigNumber.from('123')])).to.be.true;
        expect(await CONTRACT.connect(ACCOUNTS[0])._getAllAuctionSales()).to.be.an('array').that.is.empty;
        result = await CONTRACT.connect(ACCOUNTS[0])._getAllSales();
        expect(_doesArrayEqual(result, [[],[ethers.BigNumber.from('123')],[]])).to.be.true;

        expect(await CONTRACT.connect(ACCOUNTS[0])._getDirectSalesForUser(ACCOUNTS[1].address)).to.be.an('array').that.is.empty;
        result = await CONTRACT.connect(ACCOUNTS[0])._getImmediateSalesForUser(ACCOUNTS[1].address);
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(result, [ethers.BigNumber.from('123')])).to.be.true;
        expect(await CONTRACT.connect(ACCOUNTS[0])._getAuctionSalesForUser(ACCOUNTS[1].address)).to.be.an('array').that.is.empty;
        result = await CONTRACT.connect(ACCOUNTS[0])._getSalesForUser(ACCOUNTS[1].address);
        expect(_doesArrayEqual(result, [ACCOUNTS[1].address,[],[ethers.BigNumber.from('123')],[]])).to.be.true;
        result = await CONTRACT.connect(ACCOUNTS[0])._getSalesForUsers([ACCOUNTS[1].address, ACCOUNTS[2].address]);
        expect(_doesArrayEqual(result, [ [ACCOUNTS[1].address,[],[ethers.BigNumber.from('123')],[]], [ACCOUNTS[2].address,[],[],[]] ])).to.be.true;
      });
      it('create sale - auction', async () => {
        await CONTRACT.connect(ACCOUNTS[0])._createSale(123, ACCOUNTS[1].address, 2);

        let result = await CONTRACT.connect(ACCOUNTS[0])._getTotalSaleItemIds();
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(result, [ethers.BigNumber.from('123')])).to.be.true;

        await CONTRACT.connect(ACCOUNTS[0])._isDirectSaleValid(123, ACCOUNTS[1].address)
          .should.be.rejectedWith('This item is not a direct sale');
        await CONTRACT.connect(ACCOUNTS[0])._isImmediateSaleValid(123, ACCOUNTS[1].address)
          .should.be.rejectedWith('This item is not a immediate sale');
        expect(await CONTRACT.connect(ACCOUNTS[0])._isAuctionSaleValid(123, ACCOUNTS[1].address)).to.be.true;
        expect(await CONTRACT.connect(ACCOUNTS[0])._isSaleValid(123)).to.be.true;

        expect(await CONTRACT.connect(ACCOUNTS[0])._getAllDirectSales()).to.be.an('array').that.is.empty;
        expect(await CONTRACT.connect(ACCOUNTS[0])._getAllImmediateSales()).to.be.an('array').that.is.empty;
        result = await CONTRACT.connect(ACCOUNTS[0])._getAllAuctionSales();
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(result, [ethers.BigNumber.from('123')])).to.be.true;
        result = await CONTRACT.connect(ACCOUNTS[0])._getAllSales();
        expect(_doesArrayEqual(result, [[],[],[ethers.BigNumber.from('123')]])).to.be.true;

        expect(await CONTRACT.connect(ACCOUNTS[0])._getDirectSalesForUser(ACCOUNTS[1].address)).to.be.an('array').that.is.empty;
        expect(await CONTRACT.connect(ACCOUNTS[0])._getImmediateSalesForUser(ACCOUNTS[1].address)).to.be.an('array').that.is.empty;
        result = await CONTRACT.connect(ACCOUNTS[0])._getAuctionSalesForUser(ACCOUNTS[1].address);
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(result, [ethers.BigNumber.from('123')])).to.be.true;
        result = await CONTRACT.connect(ACCOUNTS[0])._getSalesForUser(ACCOUNTS[1].address);
        expect(_doesArrayEqual(result, [ACCOUNTS[1].address,[],[],[ethers.BigNumber.from('123')]])).to.be.true;
        result = await CONTRACT.connect(ACCOUNTS[0])._getSalesForUsers([ACCOUNTS[1].address, ACCOUNTS[2].address]);
        expect(_doesArrayEqual(result, [ [ACCOUNTS[1].address,[],[],[ethers.BigNumber.from('123')]], [ACCOUNTS[2].address,[],[],[]] ])).to.be.true;
      });
    });

    describe('create sale - multiple sales - one user', async () => {
      it('direct, immediate, auction', async () => {
        await CONTRACT.connect(ACCOUNTS[0])._createSale(123, ACCOUNTS[1].address, 0);
        await CONTRACT.connect(ACCOUNTS[0])._createSale(456, ACCOUNTS[1].address, 1);
        await CONTRACT.connect(ACCOUNTS[0])._createSale(789, ACCOUNTS[1].address, 2);

        let result = await CONTRACT.connect(ACCOUNTS[0])._getTotalSaleItemIds();
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(
          result,
          [ethers.BigNumber.from('123'),ethers.BigNumber.from('456'),ethers.BigNumber.from('789')])
        ).to.be.true;

        expect(await CONTRACT.connect(ACCOUNTS[0])._isDirectSaleValid(123, ACCOUNTS[1].address)).to.be.true;
        expect(await CONTRACT.connect(ACCOUNTS[0])._isImmediateSaleValid(456, ACCOUNTS[1].address)).to.be.true;
        expect(await CONTRACT.connect(ACCOUNTS[0])._isAuctionSaleValid(789, ACCOUNTS[1].address)).to.be.true;
        expect(await CONTRACT.connect(ACCOUNTS[0])._isSaleValid(123)).to.be.true;
        expect(await CONTRACT.connect(ACCOUNTS[0])._isSaleValid(456)).to.be.true;
        expect(await CONTRACT.connect(ACCOUNTS[0])._isSaleValid(789)).to.be.true;

        result = await CONTRACT.connect(ACCOUNTS[0])._getAllDirectSales();
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(result, [ethers.BigNumber.from('123')])).to.be.true;
        result = await CONTRACT.connect(ACCOUNTS[0])._getAllImmediateSales();
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(result, [ethers.BigNumber.from('456')])).to.be.true;
        result = await CONTRACT.connect(ACCOUNTS[0])._getAllAuctionSales();
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(result, [ethers.BigNumber.from('789')])).to.be.true;
        result = await CONTRACT.connect(ACCOUNTS[0])._getAllSales();
        expect(_doesArrayEqual(
          result,
          [ [ethers.BigNumber.from('123')],[ethers.BigNumber.from('456')],[ethers.BigNumber.from('789')] ]
        )).to.be.true;

        result = await CONTRACT.connect(ACCOUNTS[0])._getDirectSalesForUser(ACCOUNTS[1].address);
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(result, [ethers.BigNumber.from('123')])).to.be.true;
        result = await CONTRACT.connect(ACCOUNTS[0])._getImmediateSalesForUser(ACCOUNTS[1].address);
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(result, [ethers.BigNumber.from('456')])).to.be.true;
        result = await CONTRACT.connect(ACCOUNTS[0])._getAuctionSalesForUser(ACCOUNTS[1].address);
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(result, [ethers.BigNumber.from('789')])).to.be.true;
        result = await CONTRACT.connect(ACCOUNTS[0])._getSalesForUser(ACCOUNTS[1].address);
        expect(_doesArrayEqual(
          result,
          [ ACCOUNTS[1].address,[ethers.BigNumber.from('123')],[ethers.BigNumber.from('456')],[ethers.BigNumber.from('789')] ]
        )).to.be.true;
        result = await CONTRACT.connect(ACCOUNTS[0])._getSalesForUsers([ACCOUNTS[1].address, ACCOUNTS[2].address]);
        expect(_doesArrayEqual(
          result,
          [
            [ACCOUNTS[1].address,[ethers.BigNumber.from('123')],[ethers.BigNumber.from('456')],[ethers.BigNumber.from('789')]],
            [ACCOUNTS[2].address,[],[],[]]
          ]
        )).to.be.true;
      });
      it('multiple sales', async () => {
        await CONTRACT.connect(ACCOUNTS[0])._createSale(12, ACCOUNTS[1].address, 0);
        await CONTRACT.connect(ACCOUNTS[0])._createSale(34, ACCOUNTS[1].address, 1);
        await CONTRACT.connect(ACCOUNTS[0])._createSale(56, ACCOUNTS[1].address, 2);
        await CONTRACT.connect(ACCOUNTS[0])._createSale(78, ACCOUNTS[1].address, 2);
        await CONTRACT.connect(ACCOUNTS[0])._createSale(90, ACCOUNTS[1].address, 1);

        let result = await CONTRACT.connect(ACCOUNTS[0])._getTotalSaleItemIds();
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(
          result,
          [
            ethers.BigNumber.from('12'),
            ethers.BigNumber.from('34'),
            ethers.BigNumber.from('56'),
            ethers.BigNumber.from('78'),
            ethers.BigNumber.from('90')
          ]
        )).to.be.true;

        expect(await CONTRACT.connect(ACCOUNTS[0])._isDirectSaleValid(12, ACCOUNTS[1].address)).to.be.true;
        expect(await CONTRACT.connect(ACCOUNTS[0])._isImmediateSaleValid(34, ACCOUNTS[1].address)).to.be.true;
        expect(await CONTRACT.connect(ACCOUNTS[0])._isImmediateSaleValid(90, ACCOUNTS[1].address)).to.be.true;
        expect(await CONTRACT.connect(ACCOUNTS[0])._isAuctionSaleValid(56, ACCOUNTS[1].address)).to.be.true;
        expect(await CONTRACT.connect(ACCOUNTS[0])._isAuctionSaleValid(78, ACCOUNTS[1].address)).to.be.true;
        expect(await CONTRACT.connect(ACCOUNTS[0])._isSaleValid(12)).to.be.true;
        expect(await CONTRACT.connect(ACCOUNTS[0])._isSaleValid(34)).to.be.true;
        expect(await CONTRACT.connect(ACCOUNTS[0])._isSaleValid(56)).to.be.true;
        expect(await CONTRACT.connect(ACCOUNTS[0])._isSaleValid(78)).to.be.true;
        expect(await CONTRACT.connect(ACCOUNTS[0])._isSaleValid(90)).to.be.true;

        result = await CONTRACT.connect(ACCOUNTS[0])._getAllDirectSales();
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(result, [ethers.BigNumber.from('12')])).to.be.true;
        result = await CONTRACT.connect(ACCOUNTS[0])._getAllImmediateSales();
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(result, [ethers.BigNumber.from('34'),ethers.BigNumber.from('90')])).to.be.true;
        result = await CONTRACT.connect(ACCOUNTS[0])._getAllAuctionSales();
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(result, [ethers.BigNumber.from('56'),ethers.BigNumber.from('78')])).to.be.true;
        result = await CONTRACT.connect(ACCOUNTS[0])._getAllSales();
        expect(_doesArrayEqual(
          result,
          [
            [ethers.BigNumber.from('12')],
            [ethers.BigNumber.from('34'),ethers.BigNumber.from('90')],
            [ethers.BigNumber.from('56'),ethers.BigNumber.from('78')]
          ]
        )).to.be.true;

        result = await CONTRACT.connect(ACCOUNTS[0])._getDirectSalesForUser(ACCOUNTS[1].address);
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(result, [ethers.BigNumber.from('12')])).to.be.true;
        result = await CONTRACT.connect(ACCOUNTS[0])._getImmediateSalesForUser(ACCOUNTS[1].address);
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(result, [ethers.BigNumber.from('34'),ethers.BigNumber.from('90')])).to.be.true;
        result = await CONTRACT.connect(ACCOUNTS[0])._getAuctionSalesForUser(ACCOUNTS[1].address);
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(result, [ethers.BigNumber.from('56'),ethers.BigNumber.from('78')])).to.be.true;
        result = await CONTRACT.connect(ACCOUNTS[0])._getSalesForUser(ACCOUNTS[1].address);
        expect(_doesArrayEqual(
          result,
          [
            ACCOUNTS[1].address,
            [ethers.BigNumber.from('12')],
            [ethers.BigNumber.from('34'),ethers.BigNumber.from('90')],
            [ethers.BigNumber.from('56'),ethers.BigNumber.from('78')]
          ]
        )).to.be.true;
        result = await CONTRACT.connect(ACCOUNTS[0])._getSalesForUsers([ACCOUNTS[1].address, ACCOUNTS[2].address]);
        expect(_doesArrayEqual(
          result,
          [
            [
              ACCOUNTS[1].address,
              [ethers.BigNumber.from('12')],
              [ethers.BigNumber.from('34'),ethers.BigNumber.from('90')],
              [ethers.BigNumber.from('56'),ethers.BigNumber.from('78')]
            ],
            [ACCOUNTS[2].address,[],[],[]]
          ]
        )).to.be.true;
      });
    });

    describe('create sale - multiple sales - two users', async () => {
      it('direct, immediate, auction', async () => {
        await CONTRACT.connect(ACCOUNTS[0])._createSale(123, ACCOUNTS[1].address, 0);
        await CONTRACT.connect(ACCOUNTS[0])._createSale(456, ACCOUNTS[2].address, 1);
        await CONTRACT.connect(ACCOUNTS[0])._createSale(789, ACCOUNTS[1].address, 2);

        let result = await CONTRACT.connect(ACCOUNTS[0])._getTotalSaleItemIds();
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(
          result,
          [ethers.BigNumber.from('123'),ethers.BigNumber.from('456'),ethers.BigNumber.from('789')])
        ).to.be.true;

        expect(await CONTRACT.connect(ACCOUNTS[0])._isDirectSaleValid(123, ACCOUNTS[1].address)).to.be.true;
        expect(await CONTRACT.connect(ACCOUNTS[0])._isImmediateSaleValid(456, ACCOUNTS[2].address)).to.be.true;
        expect(await CONTRACT.connect(ACCOUNTS[0])._isAuctionSaleValid(789, ACCOUNTS[1].address)).to.be.true;
        expect(await CONTRACT.connect(ACCOUNTS[0])._isSaleValid(123)).to.be.true;
        expect(await CONTRACT.connect(ACCOUNTS[0])._isSaleValid(456)).to.be.true;
        expect(await CONTRACT.connect(ACCOUNTS[0])._isSaleValid(789)).to.be.true;

        result = await CONTRACT.connect(ACCOUNTS[0])._getAllDirectSales();
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(result, [ethers.BigNumber.from('123')])).to.be.true;
        result = await CONTRACT.connect(ACCOUNTS[0])._getAllImmediateSales();
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(result, [ethers.BigNumber.from('456')])).to.be.true;
        result = await CONTRACT.connect(ACCOUNTS[0])._getAllAuctionSales();
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(result, [ethers.BigNumber.from('789')])).to.be.true;
        result = await CONTRACT.connect(ACCOUNTS[0])._getAllSales();
        expect(_doesArrayEqual(
          result,
          [ [ethers.BigNumber.from('123')],[ethers.BigNumber.from('456')],[ethers.BigNumber.from('789')] ]
        )).to.be.true;

        result = await CONTRACT.connect(ACCOUNTS[0])._getDirectSalesForUser(ACCOUNTS[1].address);
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(result, [ethers.BigNumber.from('123')])).to.be.true;
        result = await CONTRACT.connect(ACCOUNTS[0])._getImmediateSalesForUser(ACCOUNTS[2].address);
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(result, [ethers.BigNumber.from('456')])).to.be.true;
        result = await CONTRACT.connect(ACCOUNTS[0])._getAuctionSalesForUser(ACCOUNTS[1].address);
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(result, [ethers.BigNumber.from('789')])).to.be.true;
        result = await CONTRACT.connect(ACCOUNTS[0])._getSalesForUser(ACCOUNTS[1].address);
        expect(_doesArrayEqual(
          result,
          [ ACCOUNTS[1].address,[ethers.BigNumber.from('123')],[],[ethers.BigNumber.from('789')] ]
        )).to.be.true;
        result = await CONTRACT.connect(ACCOUNTS[0])._getSalesForUser(ACCOUNTS[2].address);
        expect(_doesArrayEqual(
          result,
          [ ACCOUNTS[2].address,[],[ethers.BigNumber.from('456')],[] ]
        )).to.be.true;
        result = await CONTRACT.connect(ACCOUNTS[0])._getSalesForUsers([ACCOUNTS[1].address, ACCOUNTS[2].address]);
        expect(_doesArrayEqual(
          result,
          [
            [ACCOUNTS[1].address,[ethers.BigNumber.from('123')],[],[ethers.BigNumber.from('789')]],
            [ACCOUNTS[2].address,[],[ethers.BigNumber.from('456')],[]]
          ]
        )).to.be.true;
      });
      it('multiple sales', async () => {
        await CONTRACT.connect(ACCOUNTS[0])._createSale(12, ACCOUNTS[1].address, 0);
        await CONTRACT.connect(ACCOUNTS[0])._createSale(34, ACCOUNTS[2].address, 1);
        await CONTRACT.connect(ACCOUNTS[0])._createSale(56, ACCOUNTS[1].address, 2);
        await CONTRACT.connect(ACCOUNTS[0])._createSale(78, ACCOUNTS[2].address, 2);
        await CONTRACT.connect(ACCOUNTS[0])._createSale(90, ACCOUNTS[1].address, 1);

        let result = await CONTRACT.connect(ACCOUNTS[0])._getTotalSaleItemIds();
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(
          result,
          [
            ethers.BigNumber.from('12'),
            ethers.BigNumber.from('34'),
            ethers.BigNumber.from('56'),
            ethers.BigNumber.from('78'),
            ethers.BigNumber.from('90')
          ]
        )).to.be.true;

        expect(await CONTRACT.connect(ACCOUNTS[0])._isDirectSaleValid(12, ACCOUNTS[1].address)).to.be.true;
        expect(await CONTRACT.connect(ACCOUNTS[0])._isImmediateSaleValid(34, ACCOUNTS[2].address)).to.be.true;
        expect(await CONTRACT.connect(ACCOUNTS[0])._isImmediateSaleValid(90, ACCOUNTS[1].address)).to.be.true;
        expect(await CONTRACT.connect(ACCOUNTS[0])._isAuctionSaleValid(56, ACCOUNTS[1].address)).to.be.true;
        expect(await CONTRACT.connect(ACCOUNTS[0])._isAuctionSaleValid(78, ACCOUNTS[2].address)).to.be.true;
        expect(await CONTRACT.connect(ACCOUNTS[0])._isSaleValid(12)).to.be.true;
        expect(await CONTRACT.connect(ACCOUNTS[0])._isSaleValid(34)).to.be.true;
        expect(await CONTRACT.connect(ACCOUNTS[0])._isSaleValid(56)).to.be.true;
        expect(await CONTRACT.connect(ACCOUNTS[0])._isSaleValid(78)).to.be.true;
        expect(await CONTRACT.connect(ACCOUNTS[0])._isSaleValid(90)).to.be.true;

        result = await CONTRACT.connect(ACCOUNTS[0])._getAllDirectSales();
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(result, [ethers.BigNumber.from('12')])).to.be.true;
        result = await CONTRACT.connect(ACCOUNTS[0])._getAllImmediateSales();
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(result, [ethers.BigNumber.from('34'),ethers.BigNumber.from('90')])).to.be.true;
        result = await CONTRACT.connect(ACCOUNTS[0])._getAllAuctionSales();
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(result, [ethers.BigNumber.from('56'),ethers.BigNumber.from('78')])).to.be.true;
        result = await CONTRACT.connect(ACCOUNTS[0])._getAllSales();
        expect(_doesArrayEqual(
          result,
          [
            [ethers.BigNumber.from('12')],
            [ethers.BigNumber.from('34'),ethers.BigNumber.from('90')],
            [ethers.BigNumber.from('56'),ethers.BigNumber.from('78')]
          ]
        )).to.be.true;

        result = await CONTRACT.connect(ACCOUNTS[0])._getDirectSalesForUser(ACCOUNTS[1].address);
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(result, [ethers.BigNumber.from('12')])).to.be.true;
        result = await CONTRACT.connect(ACCOUNTS[0])._getImmediateSalesForUser(ACCOUNTS[1].address);
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(result, [ethers.BigNumber.from('34'),ethers.BigNumber.from('90')])).to.be.true;
        result = await CONTRACT.connect(ACCOUNTS[0])._getAuctionSalesForUser(ACCOUNTS[1].address);
        expect(result).to.be.an('array').that.is.not.empty;
        expect(_doesArrayEqual(result, [ethers.BigNumber.from('56'),ethers.BigNumber.from('78')])).to.be.true;
        result = await CONTRACT.connect(ACCOUNTS[0])._getSalesForUser(ACCOUNTS[1].address);
        expect(_doesArrayEqual(
          result,
          [
            ACCOUNTS[1].address,
            [ethers.BigNumber.from('12')],
            [ethers.BigNumber.from('90')],
            [ethers.BigNumber.from('56')]
          ]
        )).to.be.true;
        result = await CONTRACT.connect(ACCOUNTS[0])._getSalesForUser(ACCOUNTS[2].address);
        expect(_doesArrayEqual(
          result,
          [
            ACCOUNTS[2].address,
            [],
            [ethers.BigNumber.from('34')],
            [ethers.BigNumber.from('78')]
          ]
        )).to.be.true;
        result = await CONTRACT.connect(ACCOUNTS[0])._getSalesForUsers([ACCOUNTS[1].address, ACCOUNTS[2].address]);
        expect(_doesArrayEqual(
          result,
          [
            [
              ACCOUNTS[1].address,
              [ethers.BigNumber.from('12')],
              [ethers.BigNumber.from('90')],
              [ethers.BigNumber.from('56')]
            ],
            [
              ACCOUNTS[2].address,
              [],
              [ethers.BigNumber.from('34')],
              [ethers.BigNumber.from('78')]
            ]
          ]
        )).to.be.true;
      });
    });

  });

});
