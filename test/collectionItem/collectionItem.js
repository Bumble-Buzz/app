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

describe("AvaxTrade - CollectionItem", () => {
  before(async () => {
    ACCOUNTS = await ethers.getSigners();
  });

  beforeEach(async () => {
    const contractFactory = await ethers.getContractFactory("CollectionItem");
    CONTRACT = await contractFactory.deploy(ACCOUNTS[0].address, ACCOUNTS[1].address);
    await CONTRACT.deployed();
  });

  it('deploys successfully', async () => {
    const address = await CONTRACT.address;
    assert.notEqual(address, '');
    assert.notEqual(address, 0x0);
  });

  describe('Public Functions', async () => {
    beforeEach(async () => {
      await CONTRACT.connect(ACCOUNTS[0]).createVerifiedCollection(
        'collection name', ACCOUNTS[2].address, 100, 2, 3, ACCOUNTS[3].address, false
      );
      await CONTRACT.connect(ACCOUNTS[0]).createLocalCollection(
        'collection name', ACCOUNTS[5].address, ACCOUNTS[6].address
      );
    });

    it('get item id - item ids does not exist', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address)
        .should.be.rejectedWith('The item does not exist');
    });
    it('get item id - item ids exist, not for token id', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );

      await CONTRACT.connect(ACCOUNTS[0]).getItemId(3, ACCOUNTS[1].address, ACCOUNTS[2].address)
        .should.be.rejectedWith('The item does not exist');
    });
    it('get item id - item ids exist, not for owner', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );

      await CONTRACT.connect(ACCOUNTS[0]).getItemId(2, ACCOUNTS[1].address, ACCOUNTS[3].address)
        .should.be.rejectedWith('The item does not exist');
    });
    it('get item id - item ids exist, not for contract', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );

      await CONTRACT.connect(ACCOUNTS[0]).getItemId(2, ACCOUNTS[3].address, ACCOUNTS[2].address)
        .should.be.rejectedWith('The item does not exist');
    });
    it('get item id - exists', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );

      const itemId = await CONTRACT.connect(ACCOUNTS[0]).getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      expect(item.id).to.be.equal(itemId);
    });

    it('get items in collection - empty', async () => {
      const result = await CONTRACT.connect(ACCOUNTS[0]).getItemsInCollection(1);
      expect(result).to.be.an('array').that.is.empty;
    });
    it('get items in collection - not empty - unverified', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        2, ACCOUNTS[9].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );

      const result = await CONTRACT.connect(ACCOUNTS[0]).getItemsInCollection(1);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result.length).to.be.equal(1);

      expect(result[0].collectionId).to.be.equal(1);
      expect(result[0].tokenId).to.be.equal(2);
      expect(result[0].contractAddress).to.be.equal(ACCOUNTS[9].address);
    });
    it('get items in collection - not empty - verified', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        2, ACCOUNTS[2].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );

      const result = await CONTRACT.connect(ACCOUNTS[0]).getItemsInCollection(2);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result.length).to.be.equal(1);

      expect(result[0].collectionId).to.be.equal(2);
      expect(result[0].tokenId).to.be.equal(2);
      expect(result[0].contractAddress).to.be.equal(ACCOUNTS[2].address);
    });
    it('get items in collection - not empty - local', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        2, ACCOUNTS[5].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );

      const result = await CONTRACT.connect(ACCOUNTS[0]).getItemsInCollection(3);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result.length).to.be.equal(1);

      expect(result[0].collectionId).to.be.equal(3);
      expect(result[0].tokenId).to.be.equal(2);
      expect(result[0].contractAddress).to.be.equal(ACCOUNTS[5].address);
    });
    it('get items in collection - not empty - multiple', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        2, ACCOUNTS[5].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        2, ACCOUNTS[2].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        2, ACCOUNTS[2].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        2, ACCOUNTS[2].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        2, ACCOUNTS[5].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );

      let result = await CONTRACT.connect(ACCOUNTS[0]).getItemsInCollection(1);
      expect(result).to.be.an('array').that.is.empty;
      expect(result.length).to.be.equal(0);

      result = await CONTRACT.connect(ACCOUNTS[0]).getItemsInCollection(2);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result.length).to.be.equal(3);

      result = await CONTRACT.connect(ACCOUNTS[0]).getItemsInCollection(3);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result.length).to.be.equal(2);
    });

    it('get owner of collection - invalid', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).getOwnerOfCollection(11)
        .should.be.rejectedWith('The collection does not exist');
    });
    it('get owner of collection - valid unverified', async () => {
      const collectionOwner = await CONTRACT.connect(ACCOUNTS[0]).getOwnerOfCollection(1);
      expect(collectionOwner).to.be.equal(ACCOUNTS[1].address);
    });
    it('get owner of collection - valid verified', async () => {
      const collectionOwner = await CONTRACT.connect(ACCOUNTS[0]).getOwnerOfCollection(2);
      expect(collectionOwner).to.be.equal(ACCOUNTS[3].address);
    });
    it('get owner of collection - valid local', async () => {
      const collectionOwner = await CONTRACT.connect(ACCOUNTS[0]).getOwnerOfCollection(3);
      expect(collectionOwner).to.be.equal(ACCOUNTS[6].address);
    });

    it('get owner of item collection - unverified', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        2, ACCOUNTS[9].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );

      const itemId = await CONTRACT.connect(ACCOUNTS[0]).getItemId(2, ACCOUNTS[9].address, ACCOUNTS[2].address);
      const collectionOwner = await CONTRACT.connect(ACCOUNTS[0]).getOwnerOfItemCollection(itemId);
      expect(collectionOwner).to.be.equal(ACCOUNTS[1].address);
    });
    it('get owner of item collection - verified', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        2, ACCOUNTS[2].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );

      const itemId = await CONTRACT.connect(ACCOUNTS[0]).getItemId(2, ACCOUNTS[2].address, ACCOUNTS[2].address);
      const collectionOwner = await CONTRACT.connect(ACCOUNTS[0]).getOwnerOfItemCollection(itemId);
      expect(collectionOwner).to.be.equal(ACCOUNTS[3].address);
    });
    it('get owner of item collection - local', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        2, ACCOUNTS[5].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );

      const itemId = await CONTRACT.connect(ACCOUNTS[0]).getItemId(2, ACCOUNTS[5].address, ACCOUNTS[2].address);
      const collectionOwner = await CONTRACT.connect(ACCOUNTS[0]).getOwnerOfItemCollection(itemId);
      expect(collectionOwner).to.be.equal(ACCOUNTS[6].address);
    });

    it('get creator of item - unverified', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        2, ACCOUNTS[2].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );

      const itemId = await CONTRACT.connect(ACCOUNTS[0]).getItemId(2, ACCOUNTS[2].address, ACCOUNTS[2].address);
      const itemCreator = await CONTRACT.connect(ACCOUNTS[0]).getCreatorOfItem(itemId);
      expect(itemCreator).to.be.equal(EMPTY_ADDRESS);
    });
    it('get creator of item - verified', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );

      const itemId = await CONTRACT.connect(ACCOUNTS[0]).getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const itemCreator = await CONTRACT.connect(ACCOUNTS[0]).getCreatorOfItem(itemId);
      expect(itemCreator).to.be.equal(EMPTY_ADDRESS);
    });
    it('get creator of item - local', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        2, ACCOUNTS[5].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );

      const itemId = await CONTRACT.connect(ACCOUNTS[0]).getItemId(2, ACCOUNTS[5].address, ACCOUNTS[2].address);
      const itemCreator = await CONTRACT.connect(ACCOUNTS[0]).getCreatorOfItem(itemId);
      expect(itemCreator).to.be.equal(CONTRACT.address);
    });
  });

  describe('Access Control Check', async () => {

    it('add item to collection - not owner', async () => {
      await CONTRACT.connect(ACCOUNTS[2]).addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      ).should.be.rejectedWith(
        'AccessControl: account 0x5ca6ec5718ac9ac8916b8cecab2c0d6051dbba92 is missing role 0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775'
      );
    });
    it('add item to collection - yes owner', async () => {
      await CONTRACT.connect(ACCOUNTS[1]).addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0]).getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      expect(itemId).to.be.equal(1);
    });
    it('add item to collection - yes admin', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0]).getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      expect(itemId).to.be.equal(1);
    });

    it('cancel item in collection - not owner', async () => {
      await CONTRACT.connect(ACCOUNTS[2]).cancelItemInCollection(2, ACCOUNTS[1].address, ACCOUNTS[2].address)
        .should.be.rejectedWith(
        'AccessControl: account 0x5ca6ec5718ac9ac8916b8cecab2c0d6051dbba92 is missing role 0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775'
      );
    });
    it('cancel item in collection - yes owner', async () => {
      await CONTRACT.connect(ACCOUNTS[1]).cancelItemInCollection(2, ACCOUNTS[1].address, ACCOUNTS[2].address)
        .should.be.rejectedWith('The item does not exist');
    });
    it('cancel item in collection - yes admin', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).cancelItemInCollection(2, ACCOUNTS[1].address, ACCOUNTS[2].address)
        .should.be.rejectedWith('The item does not exist');
    });

    it('mark item sold in collection - not owner', async () => {
      await CONTRACT.connect(ACCOUNTS[2]).markItemSoldInCollection(2, ACCOUNTS[1].address, ACCOUNTS[2].address)
        .should.be.rejectedWith(
        'AccessControl: account 0x5ca6ec5718ac9ac8916b8cecab2c0d6051dbba92 is missing role 0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775'
      );
    });
    it('mark item sold in collection - yes owner', async () => {
      await CONTRACT.connect(ACCOUNTS[1]).markItemSoldInCollection(2, ACCOUNTS[1].address, ACCOUNTS[2].address)
        .should.be.rejectedWith('The item does not exist');
    });
    it('mark item sold in collection - yes admin', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).markItemSoldInCollection(2, ACCOUNTS[1].address, ACCOUNTS[2].address)
        .should.be.rejectedWith('The item does not exist');
    });

    it('activate collection - not owner', async () => {
      await CONTRACT.connect(ACCOUNTS[2]).activateCollection(1)
        .should.be.rejectedWith(
        'AccessControl: account 0x5ca6ec5718ac9ac8916b8cecab2c0d6051dbba92 is missing role 0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775'
      );
    });
    it('activate collection - yes owner', async () => {
      await CONTRACT.connect(ACCOUNTS[1]).activateCollection(2)
        .should.be.rejectedWith('The collection does not exist');
    });
    it('activate collection - yes admin', async () => {
      await CONTRACT.connect(ACCOUNTS[1]).activateCollection(2)
        .should.be.rejectedWith('The collection does not exist');
    });

    it('deactivate collection - not owner', async () => {
      await CONTRACT.connect(ACCOUNTS[2]).deactivateCollection(1)
        .should.be.rejectedWith(
        'AccessControl: account 0x5ca6ec5718ac9ac8916b8cecab2c0d6051dbba92 is missing role 0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775'
      );
    });
    it('deactivate collection - yes owner', async () => {
      await CONTRACT.connect(ACCOUNTS[1]).deactivateCollection(2)
        .should.be.rejectedWith('The collection does not exist');
    });
    it('deactivate collection - yes admin', async () => {
      await CONTRACT.connect(ACCOUNTS[1]).deactivateCollection(2)
        .should.be.rejectedWith('The collection does not exist');
    });

    it('activate item - not owner', async () => {
      await CONTRACT.connect(ACCOUNTS[2]).activateItem(1)
        .should.be.rejectedWith(
        'AccessControl: account 0x5ca6ec5718ac9ac8916b8cecab2c0d6051dbba92 is missing role 0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775'
      );
    });
    it('activate item - yes owner', async () => {
      await CONTRACT.connect(ACCOUNTS[1]).activateItem(2)
        .should.be.rejectedWith('The item does not exist');
    });
    it('activate item - yes admin', async () => {
      await CONTRACT.connect(ACCOUNTS[1]).activateItem(2)
        .should.be.rejectedWith('The item does not exist');
    });

    it('deactivate item - not owner', async () => {
      await CONTRACT.connect(ACCOUNTS[2]).deactivateItem(1)
        .should.be.rejectedWith(
        'AccessControl: account 0x5ca6ec5718ac9ac8916b8cecab2c0d6051dbba92 is missing role 0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775'
      );
    });
    it('deactivate item - yes owner', async () => {
      await CONTRACT.connect(ACCOUNTS[1]).deactivateItem(2)
        .should.be.rejectedWith('The item does not exist');
    });
    it('deactivate item - yes admin', async () => {
      await CONTRACT.connect(ACCOUNTS[1]).deactivateItem(2)
        .should.be.rejectedWith('The item does not exist');
    });

  });

  describe('Unverified collection', async () => {
    /**
     * No need to add unverified collection, it is created when contract
     * is created
    */

    it('get items collections', async () => {
      const result = await CONTRACT.connect(ACCOUNTS[0]).getItemsInCollection(1);
      expect(result).to.be.an('array').that.is.empty;
    });
    it('add item to collection', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0]).getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);

      const result = await CONTRACT.connect(ACCOUNTS[0]).getItemsInCollection(item.collectionId);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result.length).to.be.equal(1);

      expect(result[0].collectionId).to.be.equal(item.collectionId);
      expect(result[0].tokenId).to.be.equal(2);
      expect(result[0].contractAddress).to.be.equal(ACCOUNTS[1].address);
      expect(result[0].seller).to.be.equal(ACCOUNTS[2].address);
      expect(result[0].buyer).to.be.equal(EMPTY_ADDRESS);
      expect(result[0].price).to.be.equal(111);
      expect(result[0].commission).to.be.equal(0);
      expect(result[0].creator).to.be.equal(EMPTY_ADDRESS);
      expect(result[0].sold).to.be.equal(false);
      expect(result[0].active).to.be.equal(true);
    });
    it('add duplicate item to collection', async () => {
      /**
       * This use case does not need to be handled in a special way.
       * When the item is first put in the collection, at the end the item (nft) ownership
       * is transfered to the marketplace. Once that happens, the marketplace owns this item.
       * When melicious user tries to put the same item on sale, it won't work because in the end
       * when we try to transfer ownership of that item to marketplace, that will fail, thus
       * causing the entire transaction to revert.
       */
    });
    it('add items to collection - same user', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        3, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 222
      );

      // are both items are under unverified collection
      const itemId1 = await CONTRACT.connect(ACCOUNTS[0]).getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const item1 = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId1);
      const itemId2 = await CONTRACT.connect(ACCOUNTS[0]).getItemId(3, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const item2 = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId2);
      expect(item1.collectionId).to.be.equal(item2.collectionId);

      const result = await CONTRACT.connect(ACCOUNTS[0]).getItemsInCollection(item1.collectionId);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result.length).to.be.equal(2);

      expect(result[0].collectionId).to.be.equal(item1.collectionId);
      expect(result[0].tokenId).to.be.equal(2);
      expect(result[0].contractAddress).to.be.equal(ACCOUNTS[1].address);
      expect(result[0].seller).to.be.equal(ACCOUNTS[2].address);
      expect(result[0].buyer).to.be.equal(EMPTY_ADDRESS);
      expect(result[0].price).to.be.equal(111);
      expect(result[0].commission).to.be.equal(0);
      expect(result[0].creator).to.be.equal(EMPTY_ADDRESS);
      expect(result[0].sold).to.be.equal(false);
      expect(result[0].active).to.be.equal(true);

      expect(result[1].collectionId).to.be.equal(item2.collectionId);
      expect(result[1].tokenId).to.be.equal(3);
      expect(result[1].contractAddress).to.be.equal(ACCOUNTS[1].address);
      expect(result[1].seller).to.be.equal(ACCOUNTS[2].address);
      expect(result[1].buyer).to.be.equal(EMPTY_ADDRESS);
      expect(result[1].price).to.be.equal(222);
      expect(result[1].commission).to.be.equal(0);
      expect(result[1].creator).to.be.equal(EMPTY_ADDRESS);
      expect(result[1].sold).to.be.equal(false);
      expect(result[1].active).to.be.equal(true);
    });
    it('add items to collection - different users', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        3, ACCOUNTS[1].address, ACCOUNTS[3].address, EMPTY_ADDRESS, 222
      );

      // are both items are under unverified collection
      const itemId1 = await CONTRACT.connect(ACCOUNTS[0]).getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const item1 = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId1);
      const itemId2 = await CONTRACT.connect(ACCOUNTS[0]).getItemId(3, ACCOUNTS[1].address, ACCOUNTS[3].address);
      const item2 = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId2);
      expect(item1.collectionId).to.be.equal(item2.collectionId);

      const result = await CONTRACT.connect(ACCOUNTS[0]).getItemsInCollection(item1.collectionId);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result.length).to.be.equal(2);

      expect(result[0].collectionId).to.be.equal(item1.collectionId);
      expect(result[0].tokenId).to.be.equal(2);
      expect(result[0].contractAddress).to.be.equal(ACCOUNTS[1].address);
      expect(result[0].seller).to.be.equal(ACCOUNTS[2].address);
      expect(result[0].buyer).to.be.equal(EMPTY_ADDRESS);
      expect(result[0].price).to.be.equal(111);
      expect(result[0].commission).to.be.equal(0);
      expect(result[0].creator).to.be.equal(EMPTY_ADDRESS);
      expect(result[0].sold).to.be.equal(false);
      expect(result[0].active).to.be.equal(true);

      expect(result[1].collectionId).to.be.equal(item2.collectionId);
      expect(result[1].tokenId).to.be.equal(3);
      expect(result[1].contractAddress).to.be.equal(ACCOUNTS[1].address);
      expect(result[1].seller).to.be.equal(ACCOUNTS[3].address);
      expect(result[1].buyer).to.be.equal(EMPTY_ADDRESS);
      expect(result[1].price).to.be.equal(222);
      expect(result[1].commission).to.be.equal(0);
      expect(result[1].creator).to.be.equal(EMPTY_ADDRESS);
      expect(result[1].sold).to.be.equal(false);
      expect(result[1].active).to.be.equal(true);
    });

    it('cancel item in collection - valid item id', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0]).getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);

      let item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      expect(item.id).to.be.equal(itemId);
      expect(item.sold).to.be.equal(false);
      expect(item.active).to.be.equal(true);

      await CONTRACT.connect(ACCOUNTS[0]).cancelItemInCollection(2, ACCOUNTS[1].address, ACCOUNTS[2].address);

      item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      expect(item.id).to.be.equal(itemId);
      expect(item.sold).to.be.equal(false);
      expect(item.active).to.be.equal(false);
    });
    it('cancel item in collection - invalid item id', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0]).getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      
      let item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      expect(item.id).to.be.equal(itemId);
      expect(item.sold).to.be.equal(false);
      expect(item.active).to.be.equal(true);

      await CONTRACT.connect(ACCOUNTS[0]).cancelItemInCollection(11, ACCOUNTS[1].address, ACCOUNTS[2].address)
        .should.be.rejectedWith('The item does not exist');
    });

    it('mark item sold in collection - valid item id', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0]).getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);

      let item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      expect(item.id).to.be.equal(itemId);
      expect(item.sold).to.be.equal(false);
      expect(item.active).to.be.equal(true);

      await CONTRACT.connect(ACCOUNTS[0]).markItemSoldInCollection(2, ACCOUNTS[1].address, ACCOUNTS[2].address);

      item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      expect(item.id).to.be.equal(itemId);
      expect(item.sold).to.be.equal(true);
      expect(item.active).to.be.equal(true);
    });
    it('mark item sold in collection - invalid item id', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0]).getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);

      let item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      expect(item.id).to.be.equal(itemId);
      expect(item.sold).to.be.equal(false);
      expect(item.active).to.be.equal(true);

      await CONTRACT.connect(ACCOUNTS[0]).markItemSoldInCollection(11, ACCOUNTS[1].address, ACCOUNTS[2].address)
        .should.be.rejectedWith('The item does not exist');
    });

    it('create collection - not owner', async () => {
      await CONTRACT.connect(ACCOUNTS[2]).createUnvariviedCollection(
        'collection name', ACCOUNTS[2].address
      ).should.be.rejectedWith(
        'AccessControl: account 0x5ca6ec5718ac9ac8916b8cecab2c0d6051dbba92 is missing role 0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775'
      );
    });
    it('create collection - yes owner', async () => {
      await CONTRACT.connect(ACCOUNTS[1]).createUnvariviedCollection(
        'collection name', ACCOUNTS[1].address
      );
      const collection = await CONTRACT.connect(ACCOUNTS[1]).getCollection(2);
      expect(collection.collectionType).to.be.equal(2);
    });
    it('create collection - yes admin', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).createUnvariviedCollection(
        'collection name', ACCOUNTS[0].address
      );
      const collection = await CONTRACT.connect(ACCOUNTS[1]).getCollection(2);
      expect(collection.collectionType).to.be.equal(2);
    });
    it('create collection', async () => {
      await CONTRACT.connect(ACCOUNTS[1]).createUnvariviedCollection(
        'collection name', ACCOUNTS[0].address
      );
      const collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(2);
      expect(collection.id).to.be.equal(2);
      expect(collection.name).to.be.equal('collection name');
      expect(collection.collectionType).to.be.equal(2);
      expect(collection.contractAddress).to.be.equal(EMPTY_ADDRESS);
      expect(collection.owner).to.be.equal(ACCOUNTS[0].address);
    });

    it('update collection - not owner (regular user)', async () => {
      await CONTRACT.connect(ACCOUNTS[2]).updateCollection(
        1, 'collection name', ACCOUNTS[2].address, 0, 0, 0, ACCOUNTS[3].address
      ).should.be.rejectedWith(
        'AccessControl: account 0x5ca6ec5718ac9ac8916b8cecab2c0d6051dbba92 is missing role 0xb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6'
      );
    });
    it('update collection - not owner (contract owner)', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).updateCollection(
        1, 'collection name', ACCOUNTS[2].address, 0, 0, 0, ACCOUNTS[3].address
      ).should.be.rejectedWith(
        'AccessControl: account 0xda121ab48c7675e4f25e28636e3efe602e49eec6 is missing role 0xb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6'
      );
    });
    it('update collection - yes owner', async () => {
      await CONTRACT.connect(ACCOUNTS[1]).updateCollection(
        1, 'collection name', ACCOUNTS[2].address, 0, 0, 0, ACCOUNTS[5].address
      );
      const collection = await CONTRACT.connect(ACCOUNTS[1]).getCollection(1);
      expect(collection.collectionType).to.be.equal(2);
    });

  });

  describe('Local collection', async () => {
    beforeEach(async () => {
      await CONTRACT.connect(ACCOUNTS[0]).createLocalCollection(
        'collection name', ACCOUNTS[1].address, ACCOUNTS[2].address
      );
    });

    it('get items collections', async () => {
      const result = await CONTRACT.connect(ACCOUNTS[0]).getItemsInCollection(2);
      expect(result).to.be.an('array').that.is.empty;
    });

    it('add item to collection', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0]).getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);

      const result = await CONTRACT.connect(ACCOUNTS[0]).getItemsInCollection(item.collectionId);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result.length).to.be.equal(1);

      expect(result[0].collectionId).to.be.equal(item.collectionId);
      expect(result[0].tokenId).to.be.equal(2);
      expect(result[0].contractAddress).to.be.equal(ACCOUNTS[1].address);
      expect(result[0].seller).to.be.equal(ACCOUNTS[2].address);
      expect(result[0].buyer).to.be.equal(EMPTY_ADDRESS);
      expect(result[0].price).to.be.equal(111);
      expect(result[0].commission).to.be.equal(2);
      expect(result[0].creator).to.be.equal(CONTRACT.address);
      expect(result[0].sold).to.be.equal(false);
      expect(result[0].active).to.be.equal(true);
    });
    it('add duplicate item to collection', async () => {
      /**
       * This use case does not need to be handled in a special way.
       * When the item is first put in the collection, at the end the item (nft) ownership
       * is transfered to the marketplace. Once that happens, the marketplace owns this item.
       * When melicious user tries to put the same item on sale, it won't work because in the end
       * when we try to transfer ownership of that item to marketplace, that will fail, thus
       * causing the entire transaction to revert.
       */
    });
    it('add items to collection - same user', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        3, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 222
      );

      // are both items are under unverified collection
      const itemId1 = await CONTRACT.connect(ACCOUNTS[0]).getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const item1 = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId1);
      const itemId2 = await CONTRACT.connect(ACCOUNTS[0]).getItemId(3, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const item2 = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId2);
      expect(item1.collectionId).to.be.equal(item2.collectionId);

      const result = await CONTRACT.connect(ACCOUNTS[0]).getItemsInCollection(item1.collectionId);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result.length).to.be.equal(2);

      expect(result[0].collectionId).to.be.equal(item1.collectionId);
      expect(result[0].tokenId).to.be.equal(2);
      expect(result[0].contractAddress).to.be.equal(ACCOUNTS[1].address);
      expect(result[0].seller).to.be.equal(ACCOUNTS[2].address);
      expect(result[0].buyer).to.be.equal(EMPTY_ADDRESS);
      expect(result[0].price).to.be.equal(111);
      expect(result[0].commission).to.be.equal(2);
      expect(result[0].creator).to.be.equal(CONTRACT.address);
      expect(result[0].sold).to.be.equal(false);
      expect(result[0].active).to.be.equal(true);

      expect(result[1].collectionId).to.be.equal(item2.collectionId);
      expect(result[1].tokenId).to.be.equal(3);
      expect(result[1].contractAddress).to.be.equal(ACCOUNTS[1].address);
      expect(result[1].seller).to.be.equal(ACCOUNTS[2].address);
      expect(result[1].buyer).to.be.equal(EMPTY_ADDRESS);
      expect(result[1].price).to.be.equal(222);
      expect(result[1].commission).to.be.equal(2);
      expect(result[1].creator).to.be.equal(CONTRACT.address);
      expect(result[1].sold).to.be.equal(false);
      expect(result[1].active).to.be.equal(true);
    });
    it('add items to collection - different users', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        3, ACCOUNTS[1].address, ACCOUNTS[3].address, EMPTY_ADDRESS, 222
      );

      // are both items are under unverified collection
      const itemId1 = await CONTRACT.connect(ACCOUNTS[0]).getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const item1 = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId1);
      const itemId2 = await CONTRACT.connect(ACCOUNTS[0]).getItemId(3, ACCOUNTS[1].address, ACCOUNTS[3].address);
      const item2 = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId2);
      expect(item1.collectionId).to.be.equal(item2.collectionId);

      const result = await CONTRACT.connect(ACCOUNTS[0]).getItemsInCollection(item1.collectionId);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result.length).to.be.equal(2);

      expect(result[0].collectionId).to.be.equal(item1.collectionId);
      expect(result[0].tokenId).to.be.equal(2);
      expect(result[0].contractAddress).to.be.equal(ACCOUNTS[1].address);
      expect(result[0].seller).to.be.equal(ACCOUNTS[2].address);
      expect(result[0].buyer).to.be.equal(EMPTY_ADDRESS);
      expect(result[0].price).to.be.equal(111);
      expect(result[0].commission).to.be.equal(2);
      expect(result[0].creator).to.be.equal(CONTRACT.address);
      expect(result[0].sold).to.be.equal(false);
      expect(result[0].active).to.be.equal(true);

      expect(result[1].collectionId).to.be.equal(item2.collectionId);
      expect(result[1].tokenId).to.be.equal(3);
      expect(result[1].contractAddress).to.be.equal(ACCOUNTS[1].address);
      expect(result[1].seller).to.be.equal(ACCOUNTS[3].address);
      expect(result[1].buyer).to.be.equal(EMPTY_ADDRESS);
      expect(result[1].price).to.be.equal(222);
      expect(result[1].commission).to.be.equal(2);
      expect(result[1].creator).to.be.equal(CONTRACT.address);
      expect(result[1].sold).to.be.equal(false);
      expect(result[1].active).to.be.equal(true);
    });

    it('cancel item in collection - valid item id', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0]).getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);

      let item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      expect(item.id).to.be.equal(itemId);
      expect(item.sold).to.be.equal(false);
      expect(item.active).to.be.equal(true);

      await CONTRACT.connect(ACCOUNTS[0]).cancelItemInCollection(2, ACCOUNTS[1].address, ACCOUNTS[2].address);

      item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      expect(item.id).to.be.equal(itemId);
      expect(item.sold).to.be.equal(false);
      expect(item.active).to.be.equal(false);
    });
    it('cancel item in collection - invalid item id', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0]).getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      
      let item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      expect(item.id).to.be.equal(itemId);
      expect(item.sold).to.be.equal(false);
      expect(item.active).to.be.equal(true);

      await CONTRACT.connect(ACCOUNTS[0]).cancelItemInCollection(11, ACCOUNTS[1].address, ACCOUNTS[2].address)
        .should.be.rejectedWith('The item does not exist');
    });

    it('mark item sold in collection - valid item id', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0]).getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);

      let item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      expect(item.id).to.be.equal(itemId);
      expect(item.sold).to.be.equal(false);
      expect(item.active).to.be.equal(true);

      await CONTRACT.connect(ACCOUNTS[0]).markItemSoldInCollection(2, ACCOUNTS[1].address, ACCOUNTS[2].address);

      item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      expect(item.id).to.be.equal(itemId);
      expect(item.sold).to.be.equal(true);
      expect(item.active).to.be.equal(true);
    });
    it('mark item sold in collection - invalid item id', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0]).getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);

      let item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      expect(item.id).to.be.equal(itemId);
      expect(item.sold).to.be.equal(false);
      expect(item.active).to.be.equal(true);

      await CONTRACT.connect(ACCOUNTS[0]).markItemSoldInCollection(11, ACCOUNTS[1].address, ACCOUNTS[2].address)
        .should.be.rejectedWith('The item does not exist');
    });

    it('create collection - not owner', async () => {
      await CONTRACT.connect(ACCOUNTS[2]).createLocalCollection(
        'collection name', ACCOUNTS[1].address, ACCOUNTS[2].address
      ).should.be.rejectedWith(
        'AccessControl: account 0x5ca6ec5718ac9ac8916b8cecab2c0d6051dbba92 is missing role 0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775'
      );
    });
    it('create collection - yes owner', async () => {
      await CONTRACT.connect(ACCOUNTS[1]).createLocalCollection(
        'collection name', ACCOUNTS[1].address, ACCOUNTS[1].address
      );
      const collection = await CONTRACT.connect(ACCOUNTS[1]).getCollection(3);
      expect(collection.collectionType).to.be.equal(0);
    });
    it('create collection - yes admin', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).createLocalCollection(
        'collection name', ACCOUNTS[1].address, ACCOUNTS[0].address
      );
      const collection = await CONTRACT.connect(ACCOUNTS[1]).getCollection(3);
      expect(collection.collectionType).to.be.equal(0);
    });
    it('create collection', async () => {
      await CONTRACT.connect(ACCOUNTS[1]).createLocalCollection(
        'collection name', ACCOUNTS[1].address, ACCOUNTS[0].address
      );
      const collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(3);
      expect(collection.id).to.be.equal(3);
      expect(collection.name).to.be.equal('collection name');
      expect(collection.collectionType).to.be.equal(0);
      expect(collection.contractAddress).to.be.equal(ACCOUNTS[1].address);
      expect(collection.owner).to.be.equal(ACCOUNTS[0].address);
    });

    it('update collection - not owner (regular user)', async () => {
      await CONTRACT.connect(ACCOUNTS[3]).updateCollection(
        2, 'collection name 2', ACCOUNTS[1].address, 0, 0, 0, ACCOUNTS[3].address
      ).should.be.rejectedWith(
        'AccessControl: account 0x2142c9e89f53770c174b6f211ab4ec58d1d632f8 is missing role 0x405787fa12a823e0f2b7631cc41b3ba8828b3321ca811111fa75cd3aa3bb5ace'
      );
    });
    it('update collection - not owner (contract owner)', async () => {
      await CONTRACT.connect(ACCOUNTS[1]).updateCollection(
        2, 'collection name 2', ACCOUNTS[1].address, 0, 0, 0, ACCOUNTS[3].address
      ).should.be.rejectedWith(
        'AccessControl: account 0xc0e62f2f7fdfff0679ab940e29210e229cdcb8ed is missing role 0x405787fa12a823e0f2b7631cc41b3ba8828b3321ca811111fa75cd3aa3bb5ace'
      );
    });
    it('update collection - not owner (admin)', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).updateCollection(
        2, 'collection name 2', ACCOUNTS[1].address, 0, 0, 0, ACCOUNTS[3].address
      ).should.be.rejectedWith(
        'AccessControl: account 0xda121ab48c7675e4f25e28636e3efe602e49eec6 is missing role 0x405787fa12a823e0f2b7631cc41b3ba8828b3321ca811111fa75cd3aa3bb5ace'
      );
    });
    it('update collection - yes owner', async () => {
      await CONTRACT.connect(ACCOUNTS[2]).updateCollection(
        2, 'collection name 2', ACCOUNTS[1].address, 0, 0, 0, ACCOUNTS[5].address
      );
      const collection = await CONTRACT.connect(ACCOUNTS[1]).getCollection(2);
      expect(collection.collectionType).to.be.equal(0);
      expect(collection.name).to.be.equal('collection name 2');
    });

  });

  describe('Verified collection', async () => {
    beforeEach(async () => {
      await CONTRACT.connect(ACCOUNTS[0]).createVerifiedCollection(
        'collection name', ACCOUNTS[1].address, 100, 2, 3, ACCOUNTS[2].address, false
      );
    });

    it('get items collections', async () => {
      const result = await CONTRACT.connect(ACCOUNTS[0]).getItemsInCollection(2);
      expect(result).to.be.an('array').that.is.empty;
    });

    it('add item to collection', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0]).getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);

      const result = await CONTRACT.connect(ACCOUNTS[0]).getItemsInCollection(item.collectionId);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result.length).to.be.equal(1);

      expect(result[0].collectionId).to.be.equal(item.collectionId);
      expect(result[0].tokenId).to.be.equal(2);
      expect(result[0].contractAddress).to.be.equal(ACCOUNTS[1].address);
      expect(result[0].seller).to.be.equal(ACCOUNTS[2].address);
      expect(result[0].buyer).to.be.equal(EMPTY_ADDRESS);
      expect(result[0].price).to.be.equal(111);
      expect(result[0].commission).to.be.equal(0);
      expect(result[0].creator).to.be.equal(EMPTY_ADDRESS);
      expect(result[0].sold).to.be.equal(false);
      expect(result[0].active).to.be.equal(true);
    });
    it('add duplicate item to collection', async () => {
      /**
       * This use case does not need to be handled in a special way.
       * When the item is first put in the collection, at the end the item (nft) ownership
       * is transfered to the marketplace. Once that happens, the marketplace owns this item.
       * When melicious user tries to put the same item on sale, it won't work because in the end
       * when we try to transfer ownership of that item to marketplace, that will fail, thus
       * causing the entire transaction to revert.
       */
    });
    it('add items to collection - same user', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        3, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 222
      );

      // are both items are under unverified collection
      const itemId1 = await CONTRACT.connect(ACCOUNTS[0]).getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const item1 = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId1);
      const itemId2 = await CONTRACT.connect(ACCOUNTS[0]).getItemId(3, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const item2 = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId2);
      expect(item1.collectionId).to.be.equal(item2.collectionId);

      const result = await CONTRACT.connect(ACCOUNTS[0]).getItemsInCollection(item1.collectionId);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result.length).to.be.equal(2);

      expect(result[0].collectionId).to.be.equal(item1.collectionId);
      expect(result[0].tokenId).to.be.equal(2);
      expect(result[0].contractAddress).to.be.equal(ACCOUNTS[1].address);
      expect(result[0].seller).to.be.equal(ACCOUNTS[2].address);
      expect(result[0].buyer).to.be.equal(EMPTY_ADDRESS);
      expect(result[0].price).to.be.equal(111);
      expect(result[0].commission).to.be.equal(0);
      expect(result[0].creator).to.be.equal(EMPTY_ADDRESS);
      expect(result[0].sold).to.be.equal(false);
      expect(result[0].active).to.be.equal(true);

      expect(result[1].collectionId).to.be.equal(item2.collectionId);
      expect(result[1].tokenId).to.be.equal(3);
      expect(result[1].contractAddress).to.be.equal(ACCOUNTS[1].address);
      expect(result[1].seller).to.be.equal(ACCOUNTS[2].address);
      expect(result[1].buyer).to.be.equal(EMPTY_ADDRESS);
      expect(result[1].price).to.be.equal(222);
      expect(result[1].commission).to.be.equal(0);
      expect(result[1].creator).to.be.equal(EMPTY_ADDRESS);
      expect(result[1].sold).to.be.equal(false);
      expect(result[1].active).to.be.equal(true);
    });
    it('add items to collection - different users', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        3, ACCOUNTS[1].address, ACCOUNTS[3].address, EMPTY_ADDRESS, 222
      );

      // are both items are under unverified collection
      const itemId1 = await CONTRACT.connect(ACCOUNTS[0]).getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const item1 = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId1);
      const itemId2 = await CONTRACT.connect(ACCOUNTS[0]).getItemId(3, ACCOUNTS[1].address, ACCOUNTS[3].address);
      const item2 = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId2);
      expect(item1.collectionId).to.be.equal(item2.collectionId);

      const result = await CONTRACT.connect(ACCOUNTS[0]).getItemsInCollection(item1.collectionId);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result.length).to.be.equal(2);

      expect(result[0].collectionId).to.be.equal(item1.collectionId);
      expect(result[0].tokenId).to.be.equal(2);
      expect(result[0].contractAddress).to.be.equal(ACCOUNTS[1].address);
      expect(result[0].seller).to.be.equal(ACCOUNTS[2].address);
      expect(result[0].buyer).to.be.equal(EMPTY_ADDRESS);
      expect(result[0].price).to.be.equal(111);
      expect(result[0].commission).to.be.equal(0);
      expect(result[0].creator).to.be.equal(EMPTY_ADDRESS);
      expect(result[0].sold).to.be.equal(false);
      expect(result[0].active).to.be.equal(true);

      expect(result[1].collectionId).to.be.equal(item2.collectionId);
      expect(result[1].tokenId).to.be.equal(3);
      expect(result[1].contractAddress).to.be.equal(ACCOUNTS[1].address);
      expect(result[1].seller).to.be.equal(ACCOUNTS[3].address);
      expect(result[1].buyer).to.be.equal(EMPTY_ADDRESS);
      expect(result[1].price).to.be.equal(222);
      expect(result[1].commission).to.be.equal(0);
      expect(result[1].creator).to.be.equal(EMPTY_ADDRESS);
      expect(result[1].sold).to.be.equal(false);
      expect(result[1].active).to.be.equal(true);
    });

    it('cancel item in collection - valid item id', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0]).getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);

      let item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      expect(item.id).to.be.equal(itemId);
      expect(item.sold).to.be.equal(false);
      expect(item.active).to.be.equal(true);

      await CONTRACT.connect(ACCOUNTS[0]).cancelItemInCollection(2, ACCOUNTS[1].address, ACCOUNTS[2].address);

      item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      expect(item.id).to.be.equal(itemId);
      expect(item.sold).to.be.equal(false);
      expect(item.active).to.be.equal(false);
    });
    it('cancel item in collection - invalid item id', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0]).getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      
      let item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      expect(item.id).to.be.equal(itemId);
      expect(item.sold).to.be.equal(false);
      expect(item.active).to.be.equal(true);

      await CONTRACT.connect(ACCOUNTS[0]).cancelItemInCollection(11, ACCOUNTS[1].address, ACCOUNTS[2].address)
        .should.be.rejectedWith('The item does not exist');
    });

    it('mark item sold in collection - valid item id', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0]).getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);

      let item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      expect(item.id).to.be.equal(itemId);
      expect(item.sold).to.be.equal(false);
      expect(item.active).to.be.equal(true);

      await CONTRACT.connect(ACCOUNTS[0]).markItemSoldInCollection(2, ACCOUNTS[1].address, ACCOUNTS[2].address);

      item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      expect(item.id).to.be.equal(itemId);
      expect(item.sold).to.be.equal(true);
      expect(item.active).to.be.equal(true);
    });
    it('mark item sold in collection - invalid item id', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0]).getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);

      let item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      expect(item.id).to.be.equal(itemId);
      expect(item.sold).to.be.equal(false);
      expect(item.active).to.be.equal(true);

      await CONTRACT.connect(ACCOUNTS[0]).markItemSoldInCollection(11, ACCOUNTS[1].address, ACCOUNTS[2].address)
        .should.be.rejectedWith('The item does not exist');
    });

    it('create collection - not owner', async () => {
      await CONTRACT.connect(ACCOUNTS[2]).createVerifiedCollection(
        'collection name', ACCOUNTS[1].address, 0, 0, 0, ACCOUNTS[2].address, false
      ).should.be.rejectedWith(
        'AccessControl: account 0x5ca6ec5718ac9ac8916b8cecab2c0d6051dbba92 is missing role 0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775'
      );
    });
    it('create collection - yes owner', async () => {
      await CONTRACT.connect(ACCOUNTS[1]).createVerifiedCollection(
        'collection name', ACCOUNTS[1].address, 0, 0, 0, ACCOUNTS[1].address, false
      );
      const collection = await CONTRACT.connect(ACCOUNTS[1]).getCollection(3);
      expect(collection.collectionType).to.be.equal(1);
    });
    it('create collection - yes admin', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).createVerifiedCollection(
        'collection name', ACCOUNTS[1].address, 0, 0, 0, ACCOUNTS[0].address, false
      );
      const collection = await CONTRACT.connect(ACCOUNTS[1]).getCollection(3);
      expect(collection.collectionType).to.be.equal(1);
    });
    it('create collection', async () => {
      await CONTRACT.connect(ACCOUNTS[1]).createVerifiedCollection(
        'collection name', ACCOUNTS[1].address, 0, 0, 0, ACCOUNTS[0].address, false
      );
      const collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(3);
      expect(collection.id).to.be.equal(3);
      expect(collection.name).to.be.equal('collection name');
      expect(collection.collectionType).to.be.equal(1);
      expect(collection.contractAddress).to.be.equal(ACCOUNTS[1].address);
      expect(collection.owner).to.be.equal(ACCOUNTS[0].address);
    });

    it('update collection - not owner (regular user)', async () => {
      await CONTRACT.connect(ACCOUNTS[3]).updateCollection(
        2, 'collection name 2', ACCOUNTS[1].address, 0, 0, 0, ACCOUNTS[3].address
      ).should.be.rejectedWith(
        'AccessControl: account 0x2142c9e89f53770c174b6f211ab4ec58d1d632f8 is missing role 0x405787fa12a823e0f2b7631cc41b3ba8828b3321ca811111fa75cd3aa3bb5ace'
      );
    });
    it('update collection - not owner (contract owner)', async () => {
      await CONTRACT.connect(ACCOUNTS[1]).updateCollection(
        2, 'collection name 2', ACCOUNTS[1].address, 0, 0, 0, ACCOUNTS[3].address
      ).should.be.rejectedWith(
        'AccessControl: account 0xc0e62f2f7fdfff0679ab940e29210e229cdcb8ed is missing role 0x405787fa12a823e0f2b7631cc41b3ba8828b3321ca811111fa75cd3aa3bb5ace'
      );
    });
    it('update collection - not owner (admin)', async () => {
      await CONTRACT.connect(ACCOUNTS[0]).updateCollection(
        2, 'collection name 2', ACCOUNTS[1].address, 0, 0, 0, ACCOUNTS[3].address
      ).should.be.rejectedWith(
        'AccessControl: account 0xda121ab48c7675e4f25e28636e3efe602e49eec6 is missing role 0x405787fa12a823e0f2b7631cc41b3ba8828b3321ca811111fa75cd3aa3bb5ace'
      );
    });
    it('update collection - yes owner', async () => {
      await CONTRACT.connect(ACCOUNTS[2]).updateCollection(
        2, 'collection name 2', ACCOUNTS[1].address, 0, 0, 0, ACCOUNTS[5].address
      );
      const collection = await CONTRACT.connect(ACCOUNTS[1]).getCollection(2);
      expect(collection.collectionType).to.be.equal(1);
      expect(collection.name).to.be.equal('collection name 2');
    });

  });

  describe('Multiple collections', async () => {
    beforeEach(async () => {
      await CONTRACT.connect(ACCOUNTS[0]).createLocalCollection(
        'collection name', ACCOUNTS[1].address, ACCOUNTS[2].address
      );
      await CONTRACT.connect(ACCOUNTS[0]).createVerifiedCollection(
        'collection name', ACCOUNTS[5].address, 100, 2, 3, ACCOUNTS[6].address, false
      );
    });

    it('get items collections', async () => {
      let result = await CONTRACT.connect(ACCOUNTS[0]).getItemsInCollection(1);
      expect(result).to.be.an('array').that.is.empty;
      result = await CONTRACT.connect(ACCOUNTS[0]).getItemsInCollection(2);
      expect(result).to.be.an('array').that.is.empty;
      result = await CONTRACT.connect(ACCOUNTS[0]).getItemsInCollection(3);
      expect(result).to.be.an('array').that.is.empty;
    });

    it('add items to collections', async () => {
      // unverified
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        2, ACCOUNTS[8].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        22, ACCOUNTS[9].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        33, ACCOUNTS[9].address, ACCOUNTS[3].address, EMPTY_ADDRESS, 111
      );

      // local
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        5, ACCOUNTS[1].address, ACCOUNTS[3].address, EMPTY_ADDRESS, 111
      );
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        55, ACCOUNTS[1].address, ACCOUNTS[3].address, EMPTY_ADDRESS, 111
      );
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        56, ACCOUNTS[1].address, ACCOUNTS[4].address, EMPTY_ADDRESS, 111
      );

      // verivied
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        7, ACCOUNTS[5].address, ACCOUNTS[4].address, EMPTY_ADDRESS, 111
      );
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        17, ACCOUNTS[5].address, ACCOUNTS[4].address, EMPTY_ADDRESS, 111
      );
      await CONTRACT.connect(ACCOUNTS[0]).addItemToCollection(
        27, ACCOUNTS[5].address, ACCOUNTS[6].address, EMPTY_ADDRESS, 111
      );

      // unverified
      let itemId = await CONTRACT.connect(ACCOUNTS[0]).getItemId(2, ACCOUNTS[8].address, ACCOUNTS[2].address);
      let item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      let result = await CONTRACT.connect(ACCOUNTS[0]).getItemsInCollection(item.collectionId);
      expect(result[0].collectionId).to.be.equal(item.collectionId);

      itemId = await CONTRACT.connect(ACCOUNTS[0]).getItemId(22, ACCOUNTS[9].address, ACCOUNTS[2].address);
      item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      result = await CONTRACT.connect(ACCOUNTS[0]).getItemsInCollection(item.collectionId);
      expect(result[0].collectionId).to.be.equal(item.collectionId);

      itemId = await CONTRACT.connect(ACCOUNTS[0]).getItemId(33, ACCOUNTS[9].address, ACCOUNTS[3].address);
      item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      result = await CONTRACT.connect(ACCOUNTS[0]).getItemsInCollection(item.collectionId);
      expect(result[0].collectionId).to.be.equal(item.collectionId);

      // local
      itemId = await CONTRACT.connect(ACCOUNTS[0]).getItemId(5, ACCOUNTS[1].address, ACCOUNTS[3].address);
      item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      result = await CONTRACT.connect(ACCOUNTS[0]).getItemsInCollection(item.collectionId);
      expect(result[0].collectionId).to.be.equal(item.collectionId);

      itemId = await CONTRACT.connect(ACCOUNTS[0]).getItemId(55, ACCOUNTS[1].address, ACCOUNTS[3].address);
      item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      result = await CONTRACT.connect(ACCOUNTS[0]).getItemsInCollection(item.collectionId);
      expect(result[0].collectionId).to.be.equal(item.collectionId);

      itemId = await CONTRACT.connect(ACCOUNTS[0]).getItemId(56, ACCOUNTS[1].address, ACCOUNTS[4].address);
      item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      result = await CONTRACT.connect(ACCOUNTS[0]).getItemsInCollection(item.collectionId);
      expect(result[0].collectionId).to.be.equal(item.collectionId);

      // verified
      itemId = await CONTRACT.connect(ACCOUNTS[0]).getItemId(7, ACCOUNTS[5].address, ACCOUNTS[4].address);
      item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      result = await CONTRACT.connect(ACCOUNTS[0]).getItemsInCollection(item.collectionId);
      expect(result[0].collectionId).to.be.equal(item.collectionId);

      itemId = await CONTRACT.connect(ACCOUNTS[0]).getItemId(17, ACCOUNTS[5].address, ACCOUNTS[4].address);
      item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      result = await CONTRACT.connect(ACCOUNTS[0]).getItemsInCollection(item.collectionId);
      expect(result[0].collectionId).to.be.equal(item.collectionId);

      itemId = await CONTRACT.connect(ACCOUNTS[0]).getItemId(27, ACCOUNTS[5].address, ACCOUNTS[6].address);
      item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      result = await CONTRACT.connect(ACCOUNTS[0]).getItemsInCollection(item.collectionId);
      expect(result[0].collectionId).to.be.equal(item.collectionId);
    });
    it('add duplicate item to collection', async () => {
      /**
       * This use case does not need to be handled in a special way.
       * When the item is first put in the collection, at the end the item (nft) ownership
       * is transfered to the marketplace. Once that happens, the marketplace owns this item.
       * When melicious user tries to put the same item on sale, it won't work because in the end
       * when we try to transfer ownership of that item to marketplace, that will fail, thus
       * causing the entire transaction to revert.
       */
    });

  });

  describe('Collection items', async () => {
    // mapping(uint256 => uint256[]) private COLLECTION_ITEMS;

    it('get items in collection', async () => {
      const result = await CONTRACT.connect(ACCOUNTS[0])._getItemIdsInCollection(1);
      expect(result).to.be.an('array').that.is.empty;
    });
    it('add item in collection', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemIdInCollection(1, 123);
      const result = await CONTRACT.connect(ACCOUNTS[0])._getItemIdsInCollection(1);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(_doesArrayEqual(result, [ethers.BigNumber.from('123')])).to.be.true;
    });
    it('remove item in collection - one item', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemIdInCollection(1, 123);

      let result = await CONTRACT.connect(ACCOUNTS[0])._getItemIdsInCollection(1);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(_doesArrayEqual(result, [ethers.BigNumber.from('123')])).to.be.true;

      await CONTRACT.connect(ACCOUNTS[0])._removeItemIdInCollection(1, 123);

      result = await CONTRACT.connect(ACCOUNTS[0])._getItemIdsInCollection(1);
      expect(result).to.be.an('array').that.is.empty;
    });
    it('remove item in collection - two items', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemIdInCollection(1, 123);
      await CONTRACT.connect(ACCOUNTS[0])._addItemIdInCollection(1, 456);

      let result = await CONTRACT.connect(ACCOUNTS[0])._getItemIdsInCollection(1);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(_doesArrayInclude(result, ethers.BigNumber.from('123'))).to.be.true;
      expect(_doesArrayInclude(result, ethers.BigNumber.from('456'))).to.be.true;

      await CONTRACT.connect(ACCOUNTS[0])._removeItemIdInCollection(1, 123);

      result = await CONTRACT.connect(ACCOUNTS[0])._getItemIdsInCollection(1);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(_doesArrayInclude(result, ethers.BigNumber.from('456'))).to.be.true;
    });
    it('remove collection item', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemIdInCollection(1, 123);
      await CONTRACT.connect(ACCOUNTS[0])._addItemIdInCollection(1, 456);

      let result = await CONTRACT.connect(ACCOUNTS[0])._getItemIdsInCollection(1);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(_doesArrayInclude(result, ethers.BigNumber.from('123'))).to.be.true;
      expect(_doesArrayInclude(result, ethers.BigNumber.from('456'))).to.be.true;

      await CONTRACT.connect(ACCOUNTS[0])._removeCollectionItem(1);

      result = await CONTRACT.connect(ACCOUNTS[0])._getItemIdsInCollection(1);
      expect(result).to.be.an('array').that.is.empty;
    });
  });

});
