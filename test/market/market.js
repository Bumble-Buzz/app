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

describe("AvaxTrade - Market", () => {
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

  describe('General Functions', async () => {
    beforeEach(async () => {
      await CONTRACT.connect(ACCOUNTS[0]).createVerifiedCollection(
        'collection name', ACCOUNTS[1].address, 100, 2, 3, ACCOUNTS[2].address
      );
      await CONTRACT.connect(ACCOUNTS[0]).createLocalCollection(
        'collection name', ACCOUNTS[5].address
      );
    });

    it('get item id - item ids exist', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address)
        .should.be.rejectedWith('The item does not exist');
    });
    it('get item id - item ids exist, not for token id', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );

      await CONTRACT.connect(ACCOUNTS[0])._getItemId(3, ACCOUNTS[1].address, ACCOUNTS[2].address)
        .should.be.rejectedWith('The item does not exist');
    });
    it('get item id - item ids exist, not for owner', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );

      await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[3].address)
        .should.be.rejectedWith('The item does not exist');
    });
    it('get item id - item ids exist, not for contract', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );

      await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[3].address, ACCOUNTS[2].address)
        .should.be.rejectedWith('The item does not exist');
    });
    it('get item id - exists', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );

      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      expect(item.id).to.be.equal(itemId);
    });

    it('get owner of collection - invalid', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._getOwnerOfCollection(11)
        .should.be.rejectedWith('The collection does not exist');
    });
    it('get owner of collection - valid unverified', async () => {
      const collectionOwner = await CONTRACT.connect(ACCOUNTS[0])._getOwnerOfCollection(1);
      expect(collectionOwner).to.be.equal(CONTRACT.address);
    });
    it('get owner of collection - valid verified', async () => {
      const collectionOwner = await CONTRACT.connect(ACCOUNTS[0])._getOwnerOfCollection(2);
      expect(collectionOwner).to.be.equal(ACCOUNTS[2].address);
    });
    it('get owner of collection - valid local', async () => {
      const collectionOwner = await CONTRACT.connect(ACCOUNTS[0])._getOwnerOfCollection(3);
      expect(collectionOwner).to.be.equal(CONTRACT.address);
    });

    it('get owner of item collection - unverified', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[2].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );

      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[2].address, ACCOUNTS[2].address);
      const collectionOwner = await CONTRACT.connect(ACCOUNTS[0])._getOwnerOfItemCollection(itemId);
      expect(collectionOwner).to.be.equal(CONTRACT.address);
    });
    it('get owner of item collection - verified', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );

      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const collectionOwner = await CONTRACT.connect(ACCOUNTS[0])._getOwnerOfItemCollection(itemId);
      expect(collectionOwner).to.be.equal(ACCOUNTS[2].address);
    });
    it('get owner of item collection - local', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[5].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );

      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[5].address, ACCOUNTS[2].address);
      const collectionOwner = await CONTRACT.connect(ACCOUNTS[0])._getOwnerOfItemCollection(itemId);
      expect(collectionOwner).to.be.equal(CONTRACT.address);
    });

    it('get owner of item collection - unverified', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[2].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );

      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[2].address, ACCOUNTS[2].address);
      const itemCreator = await CONTRACT.connect(ACCOUNTS[0])._getCreatorOfItem(itemId);
      expect(itemCreator).to.be.equal(EMPTY_ADDRESS);
    });
    it('get owner of item collection - verified', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );

      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const itemCreator = await CONTRACT.connect(ACCOUNTS[0])._getCreatorOfItem(itemId);
      expect(itemCreator).to.be.equal(EMPTY_ADDRESS);
    });
    it('get owner of item collection - local', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[5].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );

      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[5].address, ACCOUNTS[2].address);
      const itemCreator = await CONTRACT.connect(ACCOUNTS[0])._getCreatorOfItem(itemId);
      expect(itemCreator).to.be.equal(CONTRACT.address);
    });
  });

  describe('Unverified collection', async () => {
    /**
     * No need to add unverified collection, it is created when contract
     * is created
     */

    it('get items collections', async () => {
      const result = await CONTRACT.connect(ACCOUNTS[0])._getItemsInCollection(1);
      expect(result).to.be.an('array').that.is.empty;
    });

    it('add item to collection', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);

      const result = await CONTRACT.connect(ACCOUNTS[0])._getItemsInCollection(item.collectionId);
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
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        3, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 222
      );

      // are both items are under unverified collection
      const itemId1 = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const item1 = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId1);
      const itemId2 = await CONTRACT.connect(ACCOUNTS[0])._getItemId(3, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const item2 = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId2);
      expect(item1.collectionId).to.be.equal(item2.collectionId);

      const result = await CONTRACT.connect(ACCOUNTS[0])._getItemsInCollection(item1.collectionId);
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
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        3, ACCOUNTS[1].address, ACCOUNTS[3].address, EMPTY_ADDRESS, 222
      );

      // are both items are under unverified collection
      const itemId1 = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const item1 = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId1);
      const itemId2 = await CONTRACT.connect(ACCOUNTS[0])._getItemId(3, ACCOUNTS[1].address, ACCOUNTS[3].address);
      const item2 = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId2);
      expect(item1.collectionId).to.be.equal(item2.collectionId);

      const result = await CONTRACT.connect(ACCOUNTS[0])._getItemsInCollection(item1.collectionId);
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
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);

      let item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      expect(item.id).to.be.equal(itemId);
      expect(item.sold).to.be.equal(false);
      expect(item.active).to.be.equal(true);

      await CONTRACT.connect(ACCOUNTS[0])._cancelItemInCollection(itemId);

      item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      expect(item.id).to.be.equal(itemId);
      expect(item.sold).to.be.equal(false);
      expect(item.active).to.be.equal(false);
    });
    it('cancel item in collection - invalid item id', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      
      let item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      expect(item.id).to.be.equal(itemId);
      expect(item.sold).to.be.equal(false);
      expect(item.active).to.be.equal(true);

      await CONTRACT.connect(ACCOUNTS[0])._cancelItemInCollection(11)
        .should.be.rejectedWith('The item does not exist');
    });

    it('mark item sold in collection - valid item id', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);

      let item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      expect(item.id).to.be.equal(itemId);
      expect(item.sold).to.be.equal(false);
      expect(item.active).to.be.equal(true);

      await CONTRACT.connect(ACCOUNTS[0])._markItemSoldInCollection(itemId);

      item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      expect(item.id).to.be.equal(itemId);
      expect(item.sold).to.be.equal(true);
      expect(item.active).to.be.equal(true);
    });
    it('mark item sold in collection - invalid item id', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);

      let item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      expect(item.id).to.be.equal(itemId);
      expect(item.sold).to.be.equal(false);
      expect(item.active).to.be.equal(true);

      await CONTRACT.connect(ACCOUNTS[0])._markItemSoldInCollection(11)
        .should.be.rejectedWith('The item does not exist');
    });

    it('Calculate nft commission', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, ethers.utils.parseEther('100')
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const result = await CONTRACT.connect(ACCOUNTS[0])._calculateNftCommissionReward(itemId, ethers.utils.parseEther('100'));
      expect(ethers.utils.formatEther(result)).to.be.equal('0.0');
    });
    it('Calculate nft commission - invalid item id', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._calculateNftCommissionReward(11, ethers.utils.parseEther('100'))
        .should.be.rejectedWith('The item does not exist');
    });

    it('Calculate collection commission', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, ethers.utils.parseEther('100')
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const result = await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionCommissionReward(itemId, ethers.utils.parseEther('100'));
      expect(ethers.utils.formatEther(result)).to.be.equal('0.0');
    });
    it('Calculate collection commission - invalid item id', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionCommissionReward(11, ethers.utils.parseEther('100'))
        .should.be.rejectedWith('The item does not exist');
    });

    it('Calculate collection reflection', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, ethers.utils.parseEther('100')
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const result = await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionReflectionReward(itemId, ethers.utils.parseEther('100'));
      expect(ethers.utils.formatEther(result)).to.be.equal('0.0');
    });
    it('Calculate collection reflection - invalid item it', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionReflectionReward(11, ethers.utils.parseEther('100'))
        .should.be.rejectedWith('The item does not exist');
    });

    it('Distribute collection reflection - no balance', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, ethers.utils.parseEther('100')
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const result = await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionReflectionReward(itemId, ethers.utils.parseEther('100'));
      expect(ethers.utils.formatEther(result)).to.be.equal('0.0');

      // distribute 2 ether among 100 users once
      await CONTRACT.connect(ACCOUNTS[0])._distributeCollectionReflectionReward(itemId, result);

      const item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      const collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(item.collectionId);
      expect(collection.name).to.be.equal('Unverified');
      expect(collection.contractAddress).to.be.equal(EMPTY_ADDRESS);
      expect(collection.totalSupply).to.be.equal(0);
      expect(collection.reflection).to.be.equal(0);
      expect(collection.commission).to.be.equal(0);
      expect(collection.incentive).to.be.equal(0);
      expect(collection.reflectionVault).to.be.an('array').that.is.empty;
      expect(collection.incentiveVault).to.be.equal(0);
      expect(collection.owner).to.be.equal(CONTRACT.address);
      expect(collection.collectionType).to.be.equal(2);
      expect(collection.active).to.be.equal(true);
    });
    it('Distribute collection reflection - existing balance', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, ethers.utils.parseEther('100')
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const result = await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionReflectionReward(itemId, ethers.utils.parseEther('100'));
      expect(ethers.utils.formatEther(result)).to.be.equal('0.0');

      // distribute 2 ether among 100 users twice
      await CONTRACT.connect(ACCOUNTS[0])._distributeCollectionReflectionReward(itemId, result);
      await CONTRACT.connect(ACCOUNTS[0])._distributeCollectionReflectionReward(itemId, result);

      const item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      const collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(item.collectionId);
      expect(collection.name).to.be.equal('Unverified');
      expect(collection.contractAddress).to.be.equal(EMPTY_ADDRESS);
      expect(collection.totalSupply).to.be.equal(0);
      expect(collection.reflection).to.be.equal(0);
      expect(collection.commission).to.be.equal(0);
      expect(collection.incentive).to.be.equal(0);
      expect(collection.reflectionVault).to.be.an('array').that.is.empty;
      expect(collection.incentiveVault).to.be.equal(0);
      expect(collection.owner).to.be.equal(CONTRACT.address);
      expect(collection.collectionType).to.be.equal(2);
      expect(collection.active).to.be.equal(true);
    });
    it('Distribute collection reflection - invalid item id', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionReflectionReward(11, ethers.utils.parseEther('100'))
        .should.be.rejectedWith('The item does not exist');
    });

    it('Claim collection reflection reward - invalid', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._claimCollectionReflectionReward(1, ACCOUNTS[2].address)
        .should.be.rejectedWith('This NFT can not collect reflection rewards');
    });
    it('Claim collection reflection reward - no balance', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._claimCollectionReflectionReward(1, ACCOUNTS[1].address)
        .should.be.rejectedWith('This NFT can not collect reflection rewards');
    });
    it('Claim collection reflection reward - yes balance', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, ethers.utils.parseEther('100')
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);

      let result = await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionReflectionReward(itemId, ethers.utils.parseEther('100'));
      expect(ethers.utils.formatEther(result)).to.be.equal('0.0');

      // distribute 2 ether among 100 users once
      await CONTRACT.connect(ACCOUNTS[0])._distributeCollectionReflectionReward(itemId, result);

      const item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      const collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(item.collectionId);
      expect(collection.contractAddress).to.be.equal(EMPTY_ADDRESS);
      expect(collection.totalSupply).to.be.equal(0);
      expect(collection.reflection).to.be.equal(0);
      expect(collection.commission).to.be.equal(0);
      expect(collection.reflectionVault).to.be.an('array').that.is.empty;
      expect(collection.owner).to.be.equal(CONTRACT.address);

      result = await CONTRACT.connect(ACCOUNTS[0])._claimCollectionReflectionReward(1, ACCOUNTS[1].address)
        .should.be.rejectedWith('This NFT can not collect reflection rewards');
    });

    it('Update collection reflection reward - invalid', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._updateCollectionReflectionReward(1, ACCOUNTS[2].address, ethers.utils.parseEther('0.02'))
        .should.be.rejectedWith('This NFT can not deduct reflection rewards');
    });
    it('Update collection reflection reward - no balance', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._claimCollectionReflectionReward(1, ACCOUNTS[1].address)
        .should.be.rejectedWith('This NFT can not collect reflection rewards');
    });
    it('Update collection reflection reward - yes balance', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, ethers.utils.parseEther('100')
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);

      let result = await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionReflectionReward(itemId, ethers.utils.parseEther('100'));
      expect(ethers.utils.formatEther(result)).to.be.equal('0.0');

      // distribute 2 ether among 100 users once
      await CONTRACT.connect(ACCOUNTS[0])._distributeCollectionReflectionReward(itemId, result);

      const item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      const collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(item.collectionId);
      expect(collection.contractAddress).to.be.equal(EMPTY_ADDRESS);
      expect(collection.totalSupply).to.be.equal(0);
      expect(collection.reflection).to.be.equal(0);
      expect(collection.commission).to.be.equal(0);
      expect(collection.reflectionVault).to.be.an('array').that.is.empty;
      expect(collection.owner).to.be.equal(CONTRACT.address);

      await CONTRACT.connect(ACCOUNTS[0])._claimCollectionReflectionReward(1, ACCOUNTS[1].address)
        .should.be.rejectedWith('This NFT can not collect reflection rewards');

      await CONTRACT.connect(ACCOUNTS[0])._updateCollectionReflectionReward(1, ACCOUNTS[1].address, 0)
        .should.be.rejectedWith('This NFT can not deduct reflection rewards');

      await CONTRACT.connect(ACCOUNTS[0])._claimCollectionReflectionReward(1, ACCOUNTS[1].address)
        .should.be.rejectedWith('This NFT can not collect reflection rewards');
    });

    it('Calculate collection incentive reward - invalid item id', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionIncentiveReward(11)
        .should.be.rejectedWith('The item does not exist');
    });
    it('Calculate collection incentive reward', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, ethers.utils.parseEther('100')
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const result = await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionIncentiveReward(itemId);
      expect(ethers.utils.formatEther(result)).to.be.equal('0.0');
    });

    it('Set collection incentive reward percentage', async () => {
      let collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(1);
      expect(collection.incentive).to.be.equal(0);

      await CONTRACT.connect(ACCOUNTS[0])._setCollectionIncentive(1, 2);

      collection = collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(1);
      expect(collection.incentive).to.be.equal(0);
    });
    it('Set collection incentive reward percentage - invalid collection id', async () => {
      let collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(3)
        .should.be.rejectedWith('The collection does not exist');
    });

    it('Increase collection incentive reward - 0 incentive %', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, ethers.utils.parseEther('100')
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);

      let collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(item.collectionId);
      expect(ethers.utils.formatEther(collection.incentiveVault)).to.be.equal('0.0');
      result = await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionIncentiveReward(itemId);
      expect(ethers.utils.formatEther(result)).to.be.equal('0.0');

      await CONTRACT.connect(ACCOUNTS[0])._increaseCollectionIncentiveReward(item.collectionId, ethers.utils.parseEther('2'));

      collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(item.collectionId);
      expect(ethers.utils.formatEther(collection.incentiveVault)).to.be.equal('0.0');
      result = await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionIncentiveReward(itemId);
      expect(ethers.utils.formatEther(result)).to.be.equal('0.0');
    });
    it('Increase collection incentive reward - 2 incentive %', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, ethers.utils.parseEther('100')
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);

      await CONTRACT.connect(ACCOUNTS[0])._setCollectionIncentive(item.collectionId, 2);

      let collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(item.collectionId);
      expect(ethers.utils.formatEther(collection.incentiveVault)).to.be.equal('0.0');
      result = await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionIncentiveReward(itemId);
      expect(ethers.utils.formatEther(result)).to.be.equal('0.0');

      await CONTRACT.connect(ACCOUNTS[0])._increaseCollectionIncentiveReward(item.collectionId, ethers.utils.parseEther('2'));

      collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(item.collectionId);
      expect(ethers.utils.formatEther(collection.incentiveVault)).to.be.equal('0.0');
      result = await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionIncentiveReward(itemId);
      expect(ethers.utils.formatEther(result)).to.be.equal('0.0');
    });

    it('Decrease collection incentive reward - below 0', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, ethers.utils.parseEther('100')
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);

      let collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(item.collectionId);
      expect(ethers.utils.formatEther(collection.incentiveVault)).to.be.equal('0.0');
      result = await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionIncentiveReward(itemId);
      expect(ethers.utils.formatEther(result)).to.be.equal('0.0');

      await CONTRACT.connect(ACCOUNTS[0])._decreaseCollectionIncentiveReward(item.collectionId, ethers.utils.parseEther('2'));

      collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(item.collectionId);
      expect(ethers.utils.formatEther(collection.incentiveVault)).to.be.equal('0.0');
      result = await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionIncentiveReward(itemId);
      expect(ethers.utils.formatEther(result)).to.be.equal('0.0');
    });
    it('Decrease collection incentive reward - increase then decrease', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, ethers.utils.parseEther('100')
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);

      await CONTRACT.connect(ACCOUNTS[0])._setCollectionIncentive(item.collectionId, 2);

      let collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(item.collectionId);
      expect(ethers.utils.formatEther(collection.incentiveVault)).to.be.equal('0.0');
      result = await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionIncentiveReward(itemId);
      expect(ethers.utils.formatEther(result)).to.be.equal('0.0');

      await CONTRACT.connect(ACCOUNTS[0])._increaseCollectionIncentiveReward(item.collectionId, ethers.utils.parseEther('10'));

      collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(item.collectionId);
      expect(ethers.utils.formatEther(collection.incentiveVault)).to.be.equal('0.0');
      result = await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionIncentiveReward(itemId);
      expect(ethers.utils.formatEther(result)).to.be.equal('0.0');

      await CONTRACT.connect(ACCOUNTS[0])._decreaseCollectionIncentiveReward(item.collectionId, result);

      collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(item.collectionId);
      expect(ethers.utils.formatEther(collection.incentiveVault)).to.be.equal('0.0');
    });

  });

  describe('Local collection', async () => {
    beforeEach(async () => {
      await CONTRACT.connect(ACCOUNTS[0]).createLocalCollection(
        'collection name', ACCOUNTS[1].address
      );
    });

    it('get items collections', async () => {
      const result = await CONTRACT.connect(ACCOUNTS[0])._getItemsInCollection(2);
      expect(result).to.be.an('array').that.is.empty;
    });

    it('add item to collection', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);

      const result = await CONTRACT.connect(ACCOUNTS[0])._getItemsInCollection(item.collectionId);
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
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        3, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 222
      );

      // are both items are under unverified collection
      const itemId1 = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const item1 = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId1);
      const itemId2 = await CONTRACT.connect(ACCOUNTS[0])._getItemId(3, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const item2 = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId2);
      expect(item1.collectionId).to.be.equal(item2.collectionId);

      const result = await CONTRACT.connect(ACCOUNTS[0])._getItemsInCollection(item1.collectionId);
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
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        3, ACCOUNTS[1].address, ACCOUNTS[3].address, EMPTY_ADDRESS, 222
      );

      // are both items are under unverified collection
      const itemId1 = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const item1 = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId1);
      const itemId2 = await CONTRACT.connect(ACCOUNTS[0])._getItemId(3, ACCOUNTS[1].address, ACCOUNTS[3].address);
      const item2 = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId2);
      expect(item1.collectionId).to.be.equal(item2.collectionId);

      const result = await CONTRACT.connect(ACCOUNTS[0])._getItemsInCollection(item1.collectionId);
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
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);

      let item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      expect(item.id).to.be.equal(itemId);
      expect(item.sold).to.be.equal(false);
      expect(item.active).to.be.equal(true);

      await CONTRACT.connect(ACCOUNTS[0])._cancelItemInCollection(itemId);

      item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      expect(item.id).to.be.equal(itemId);
      expect(item.sold).to.be.equal(false);
      expect(item.active).to.be.equal(false);
    });
    it('cancel item in collection - invalid item id', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      
      let item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      expect(item.id).to.be.equal(itemId);
      expect(item.sold).to.be.equal(false);
      expect(item.active).to.be.equal(true);

      await CONTRACT.connect(ACCOUNTS[0])._cancelItemInCollection(11)
        .should.be.rejectedWith('The item does not exist');
    });

    it('mark item sold in collection - valid item id', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);

      let item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      expect(item.id).to.be.equal(itemId);
      expect(item.sold).to.be.equal(false);
      expect(item.active).to.be.equal(true);

      await CONTRACT.connect(ACCOUNTS[0])._markItemSoldInCollection(itemId);

      item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      expect(item.id).to.be.equal(itemId);
      expect(item.sold).to.be.equal(true);
      expect(item.active).to.be.equal(true);
    });
    it('mark item sold in collection - invalid item id', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);

      let item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      expect(item.id).to.be.equal(itemId);
      expect(item.sold).to.be.equal(false);
      expect(item.active).to.be.equal(true);

      await CONTRACT.connect(ACCOUNTS[0])._markItemSoldInCollection(11)
        .should.be.rejectedWith('The item does not exist');
    });

    it('Calculate nft commission', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, ethers.utils.parseEther('100')
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const result = await CONTRACT.connect(ACCOUNTS[0])._calculateNftCommissionReward(itemId, ethers.utils.parseEther('100'));
      expect(ethers.utils.formatEther(result)).to.be.equal('2.0');
    });
    it('Calculate nft commission - invalid item id', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._calculateNftCommissionReward(11, ethers.utils.parseEther('100'))
        .should.be.rejectedWith('The item does not exist');
    });

    it('Calculate collection commission', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, ethers.utils.parseEther('100')
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const result = await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionCommissionReward(itemId, ethers.utils.parseEther('100'));
      expect(ethers.utils.formatEther(result)).to.be.equal('0.0');
    });
    it('Calculate collection commission - invalid item id', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionCommissionReward(11, ethers.utils.parseEther('100'))
        .should.be.rejectedWith('The item does not exist');
    });

    it('Calculate collection reflection', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, ethers.utils.parseEther('100')
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const result = await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionReflectionReward(itemId, ethers.utils.parseEther('100'));
      expect(ethers.utils.formatEther(result)).to.be.equal('0.0');
    });
    it('Calculate collection reflection - invalid item it', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionReflectionReward(11, ethers.utils.parseEther('100'))
        .should.be.rejectedWith('The item does not exist');
    });

    it('Distribute collection reflection - no balance', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, ethers.utils.parseEther('100')
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const result = await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionReflectionReward(itemId, ethers.utils.parseEther('100'));
      expect(ethers.utils.formatEther(result)).to.be.equal('0.0');

      // distribute 2 ether among 100 users once
      await CONTRACT.connect(ACCOUNTS[0])._distributeCollectionReflectionReward(itemId, result);

      const collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(2);
      expect(collection.name).to.be.equal('collection name');
      expect(collection.contractAddress).to.be.equal(ACCOUNTS[1].address);
      expect(collection.totalSupply).to.be.equal(0);
      expect(collection.reflection).to.be.equal(0);
      expect(collection.commission).to.be.equal(0);
      expect(collection.incentive).to.be.equal(0);
      expect(collection.reflectionVault).to.be.an('array').that.is.empty;
      expect(collection.incentiveVault).to.be.equal(0);
      expect(collection.owner).to.be.equal(CONTRACT.address);
      expect(collection.collectionType).to.be.equal(0);
      expect(collection.active).to.be.equal(true);
    });
    it('Distribute collection reflection - existing balance', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, ethers.utils.parseEther('100')
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const result = await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionReflectionReward(itemId, ethers.utils.parseEther('100'));
      expect(ethers.utils.formatEther(result)).to.be.equal('0.0');

      // distribute 2 ether among 100 users twice
      await CONTRACT.connect(ACCOUNTS[0])._distributeCollectionReflectionReward(itemId, result);
      await CONTRACT.connect(ACCOUNTS[0])._distributeCollectionReflectionReward(itemId, result);

      const collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(2);
      expect(collection.name).to.be.equal('collection name');
      expect(collection.contractAddress).to.be.equal(ACCOUNTS[1].address);
      expect(collection.totalSupply).to.be.equal(0);
      expect(collection.reflection).to.be.equal(0);
      expect(collection.commission).to.be.equal(0);
      expect(collection.incentive).to.be.equal(0);
      expect(collection.reflectionVault).to.be.an('array').that.is.empty;
      expect(collection.incentiveVault).to.be.equal(0);
      expect(collection.owner).to.be.equal(CONTRACT.address);
      expect(collection.collectionType).to.be.equal(0);
      expect(collection.active).to.be.equal(true);
    });
    it('Distribute collection reflection - invalid item id', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionReflectionReward(11, ethers.utils.parseEther('100'))
        .should.be.rejectedWith('The item does not exist');
    });

    it('Claim collection reflection reward - invalid', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._claimCollectionReflectionReward(1, ACCOUNTS[2].address)
        .should.be.rejectedWith('This NFT can not collect reflection rewards');
    });
    it('Claim collection reflection reward - no balance', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._claimCollectionReflectionReward(1, ACCOUNTS[1].address)
        .should.be.rejectedWith('This NFT can not collect reflection rewards');
    });
    it('Claim collection reflection reward - yes balance', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, ethers.utils.parseEther('100')
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);

      let result = await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionReflectionReward(itemId, ethers.utils.parseEther('100'));
      expect(ethers.utils.formatEther(result)).to.be.equal('0.0');

      // distribute 2 ether among 100 users once
      await CONTRACT.connect(ACCOUNTS[0])._distributeCollectionReflectionReward(itemId, result);

      const item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      const collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(item.collectionId);
      expect(collection.contractAddress).to.be.equal(ACCOUNTS[1].address);
      expect(collection.totalSupply).to.be.equal(0);
      expect(collection.reflection).to.be.equal(0);
      expect(collection.commission).to.be.equal(0);
      expect(collection.reflectionVault).to.be.an('array').that.is.empty;
      expect(collection.owner).to.be.equal(CONTRACT.address);

      result = await CONTRACT.connect(ACCOUNTS[0])._claimCollectionReflectionReward(1, ACCOUNTS[1].address)
        .should.be.rejectedWith('This NFT can not collect reflection rewards');
    });

    it('Update collection reflection reward - invalid', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._updateCollectionReflectionReward(1, ACCOUNTS[2].address, ethers.utils.parseEther('0.02'))
        .should.be.rejectedWith('This NFT can not deduct reflection rewards');
    });
    it('Update collection reflection reward - no balance', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._claimCollectionReflectionReward(1, ACCOUNTS[1].address)
        .should.be.rejectedWith('This NFT can not collect reflection rewards');
    });
    it('Update collection reflection reward - yes balance', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, ethers.utils.parseEther('100')
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);

      let result = await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionReflectionReward(itemId, ethers.utils.parseEther('100'));
      expect(ethers.utils.formatEther(result)).to.be.equal('0.0');

      // distribute 2 ether among 100 users once
      await CONTRACT.connect(ACCOUNTS[0])._distributeCollectionReflectionReward(itemId, result);

      const item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      const collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(item.collectionId);
      expect(collection.contractAddress).to.be.equal(ACCOUNTS[1].address);
      expect(collection.totalSupply).to.be.equal(0);
      expect(collection.reflection).to.be.equal(0);
      expect(collection.commission).to.be.equal(0);
      expect(collection.reflectionVault).to.be.an('array').that.is.empty;
      expect(collection.owner).to.be.equal(CONTRACT.address);

      result = await CONTRACT.connect(ACCOUNTS[0])._claimCollectionReflectionReward(1, ACCOUNTS[1].address)
        .should.be.rejectedWith('This NFT can not collect reflection rewards');

      await CONTRACT.connect(ACCOUNTS[0])._updateCollectionReflectionReward(1, ACCOUNTS[1].address, 0)
        .should.be.rejectedWith('This NFT can not deduct reflection rewards');

      result = await CONTRACT.connect(ACCOUNTS[0])._claimCollectionReflectionReward(1, ACCOUNTS[1].address)
        .should.be.rejectedWith('This NFT can not collect reflection rewards');
    });

    it('Calculate collection incentive reward - invalid item id', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionIncentiveReward(11)
        .should.be.rejectedWith('The item does not exist');
    });
    it('Calculate collection incentive reward', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, ethers.utils.parseEther('100')
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const result = await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionIncentiveReward(itemId);
      expect(ethers.utils.formatEther(result)).to.be.equal('0.0');
    });

    it('Set collection incentive reward percentage', async () => {
      let collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(2);
      expect(collection.incentive).to.be.equal(0);

      await CONTRACT.connect(ACCOUNTS[0])._setCollectionIncentive(2, 2);

      collection = collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(2);
      expect(collection.incentive).to.be.equal(0);
    });
    it('Set collection incentive reward percentage - invalid collection id', async () => {
      let collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(3)
        .should.be.rejectedWith('The collection does not exist');
    });

    it('Increase collection incentive reward - 0 incentive %', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, ethers.utils.parseEther('100')
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);

      let collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(item.collectionId);
      expect(ethers.utils.formatEther(collection.incentiveVault)).to.be.equal('0.0');
      result = await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionIncentiveReward(itemId);
      expect(ethers.utils.formatEther(result)).to.be.equal('0.0');

      await CONTRACT.connect(ACCOUNTS[0])._increaseCollectionIncentiveReward(item.collectionId, ethers.utils.parseEther('2'));

      collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(item.collectionId);
      expect(ethers.utils.formatEther(collection.incentiveVault)).to.be.equal('0.0');
      result = await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionIncentiveReward(itemId);
      expect(ethers.utils.formatEther(result)).to.be.equal('0.0');
    });
    it('Increase collection incentive reward - 2 incentive %', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, ethers.utils.parseEther('100')
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);

      await CONTRACT.connect(ACCOUNTS[0])._setCollectionIncentive(item.collectionId, 2);

      let collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(item.collectionId);
      expect(ethers.utils.formatEther(collection.incentiveVault)).to.be.equal('0.0');
      result = await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionIncentiveReward(itemId);
      expect(ethers.utils.formatEther(result)).to.be.equal('0.0');

      await CONTRACT.connect(ACCOUNTS[0])._increaseCollectionIncentiveReward(item.collectionId, ethers.utils.parseEther('2'));

      collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(item.collectionId);
      expect(ethers.utils.formatEther(collection.incentiveVault)).to.be.equal('0.0');
      result = await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionIncentiveReward(itemId);
      expect(ethers.utils.formatEther(result)).to.be.equal('0.0');
    });

    it('Decrease collection incentive reward - below 0', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, ethers.utils.parseEther('100')
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);

      let collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(item.collectionId);
      expect(ethers.utils.formatEther(collection.incentiveVault)).to.be.equal('0.0');
      result = await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionIncentiveReward(itemId);
      expect(ethers.utils.formatEther(result)).to.be.equal('0.0');

      await CONTRACT.connect(ACCOUNTS[0])._decreaseCollectionIncentiveReward(2, ethers.utils.parseEther('2'));

      collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(item.collectionId);
      expect(ethers.utils.formatEther(collection.incentiveVault)).to.be.equal('0.0');
      result = await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionIncentiveReward(itemId);
      expect(ethers.utils.formatEther(result)).to.be.equal('0.0');
    });
    it('Decrease collection incentive reward - increase then decrease', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, ethers.utils.parseEther('100')
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);

      await CONTRACT.connect(ACCOUNTS[0])._setCollectionIncentive(item.collectionId, 2);

      let collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(item.collectionId);
      expect(ethers.utils.formatEther(collection.incentiveVault)).to.be.equal('0.0');
      result = await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionIncentiveReward(itemId);
      expect(ethers.utils.formatEther(result)).to.be.equal('0.0');

      await CONTRACT.connect(ACCOUNTS[0])._increaseCollectionIncentiveReward(item.collectionId, ethers.utils.parseEther('10'));

      collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(item.collectionId);
      expect(ethers.utils.formatEther(collection.incentiveVault)).to.be.equal('0.0');
      result = await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionIncentiveReward(itemId);
      expect(ethers.utils.formatEther(result)).to.be.equal('0.0');

      await CONTRACT.connect(ACCOUNTS[0])._decreaseCollectionIncentiveReward(item.collectionId, result);

      collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(item.collectionId);
      expect(ethers.utils.formatEther(collection.incentiveVault)).to.be.equal('0.0');
    });

  });

  describe('Verified collection', async () => {
    beforeEach(async () => {
      await CONTRACT.connect(ACCOUNTS[0]).createVerifiedCollection(
        'collection name', ACCOUNTS[1].address, 100, 2, 3, ACCOUNTS[2].address
      );
    });

    it('get items collections', async () => {
      const result = await CONTRACT.connect(ACCOUNTS[0])._getItemsInCollection(2);
      expect(result).to.be.an('array').that.is.empty;
    });

    it('add item to collection', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);

      const result = await CONTRACT.connect(ACCOUNTS[0])._getItemsInCollection(item.collectionId);
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
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        3, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 222
      );

      // are both items are under unverified collection
      const itemId1 = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const item1 = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId1);
      const itemId2 = await CONTRACT.connect(ACCOUNTS[0])._getItemId(3, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const item2 = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId2);
      expect(item1.collectionId).to.be.equal(item2.collectionId);

      const result = await CONTRACT.connect(ACCOUNTS[0])._getItemsInCollection(item1.collectionId);
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
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        3, ACCOUNTS[1].address, ACCOUNTS[3].address, EMPTY_ADDRESS, 222
      );

      // are both items are under unverified collection
      const itemId1 = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const item1 = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId1);
      const itemId2 = await CONTRACT.connect(ACCOUNTS[0])._getItemId(3, ACCOUNTS[1].address, ACCOUNTS[3].address);
      const item2 = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId2);
      expect(item1.collectionId).to.be.equal(item2.collectionId);

      const result = await CONTRACT.connect(ACCOUNTS[0])._getItemsInCollection(item1.collectionId);
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
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);

      let item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      expect(item.id).to.be.equal(itemId);
      expect(item.sold).to.be.equal(false);
      expect(item.active).to.be.equal(true);

      await CONTRACT.connect(ACCOUNTS[0])._cancelItemInCollection(itemId);

      item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      expect(item.id).to.be.equal(itemId);
      expect(item.sold).to.be.equal(false);
      expect(item.active).to.be.equal(false);
    });
    it('cancel item in collection - invalid item id', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      
      let item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      expect(item.id).to.be.equal(itemId);
      expect(item.sold).to.be.equal(false);
      expect(item.active).to.be.equal(true);

      await CONTRACT.connect(ACCOUNTS[0])._cancelItemInCollection(11)
        .should.be.rejectedWith('The item does not exist');
    });

    it('mark item sold in collection - valid item id', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);

      let item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      expect(item.id).to.be.equal(itemId);
      expect(item.sold).to.be.equal(false);
      expect(item.active).to.be.equal(true);

      await CONTRACT.connect(ACCOUNTS[0])._markItemSoldInCollection(itemId);

      item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      expect(item.id).to.be.equal(itemId);
      expect(item.sold).to.be.equal(true);
      expect(item.active).to.be.equal(true);
    });
    it('mark item sold in collection - invalid item id', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);

      let item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      expect(item.id).to.be.equal(itemId);
      expect(item.sold).to.be.equal(false);
      expect(item.active).to.be.equal(true);

      await CONTRACT.connect(ACCOUNTS[0])._markItemSoldInCollection(11)
        .should.be.rejectedWith('The item does not exist');
    });

    it('Calculate nft commission', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, ethers.utils.parseEther('100')
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const result = await CONTRACT.connect(ACCOUNTS[0])._calculateNftCommissionReward(itemId, ethers.utils.parseEther('100'));
      expect(ethers.utils.formatEther(result)).to.be.equal('0.0');
    });
    it('Calculate nft commission - invalid item id', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._calculateNftCommissionReward(11, ethers.utils.parseEther('100'))
        .should.be.rejectedWith('The item does not exist');
    });

    it('Calculate collection commission', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, ethers.utils.parseEther('100')
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const result = await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionCommissionReward(itemId, ethers.utils.parseEther('100'));
      expect(ethers.utils.formatEther(result)).to.be.equal('3.0');
    });
    it('Calculate collection commission - invalid item id', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionCommissionReward(11, ethers.utils.parseEther('100'))
        .should.be.rejectedWith('The item does not exist');
    });

    it('Calculate collection reflection', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, ethers.utils.parseEther('100')
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const result = await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionReflectionReward(itemId, ethers.utils.parseEther('100'));
      expect(ethers.utils.formatEther(result)).to.be.equal('2.0');
    });
    it('Calculate collection reflection - invalid item it', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionReflectionReward(11, ethers.utils.parseEther('100'))
        .should.be.rejectedWith('The item does not exist');
    });

    it('Distribute collection reflection - no balance', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, ethers.utils.parseEther('100')
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const result = await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionReflectionReward(itemId, ethers.utils.parseEther('100'));
      expect(ethers.utils.formatEther(result)).to.be.equal('2.0');

      // distribute 2 ether among 100 users once
      await CONTRACT.connect(ACCOUNTS[0])._distributeCollectionReflectionReward(itemId, result);

      const collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(2);
      expect(collection.name).to.be.equal('collection name');
      expect(collection.contractAddress).to.be.equal(ACCOUNTS[1].address);
      expect(collection.totalSupply).to.be.equal(100);
      expect(collection.reflection).to.be.equal(2);
      expect(collection.commission).to.be.equal(3);
      expect(collection.incentive).to.be.equal(0);
      expect(collection.reflectionVault).to.be.an('array').that.is.not.empty;
      expect(collection.incentiveVault).to.be.equal(0);
      expect(ethers.utils.formatEther(collection.reflectionVault[0])).to.be.equal('0.02');
      expect(ethers.utils.formatEther(collection.reflectionVault[1])).to.be.equal('0.02');
      expect(ethers.utils.formatEther(collection.reflectionVault[5])).to.be.equal('0.02');
      expect(ethers.utils.formatEther(collection.reflectionVault[11])).to.be.equal('0.02');
      expect(ethers.utils.formatEther(collection.reflectionVault[21])).to.be.equal('0.02');
      expect(ethers.utils.formatEther(collection.reflectionVault[33])).to.be.equal('0.02');
      expect(ethers.utils.formatEther(collection.reflectionVault[41])).to.be.equal('0.02');
      expect(ethers.utils.formatEther(collection.reflectionVault[55])).to.be.equal('0.02');
      expect(ethers.utils.formatEther(collection.reflectionVault[60])).to.be.equal('0.02');
      expect(ethers.utils.formatEther(collection.reflectionVault[70])).to.be.equal('0.02');
      expect(ethers.utils.formatEther(collection.reflectionVault[80])).to.be.equal('0.02');
      expect(ethers.utils.formatEther(collection.reflectionVault[99])).to.be.equal('0.02');
      expect(collection.owner).to.be.equal(ACCOUNTS[2].address);
      expect(collection.collectionType).to.be.equal(1);
      expect(collection.active).to.be.equal(true);
    });
    it('Distribute collection reflection - existing balance', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, ethers.utils.parseEther('100')
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const result = await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionReflectionReward(itemId, ethers.utils.parseEther('100'));
      expect(ethers.utils.formatEther(result)).to.be.equal('2.0');

      // distribute 2 ether among 100 users twice
      await CONTRACT.connect(ACCOUNTS[0])._distributeCollectionReflectionReward(itemId, result);
      await CONTRACT.connect(ACCOUNTS[0])._distributeCollectionReflectionReward(itemId, result);

      const collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(2);
      expect(collection.name).to.be.equal('collection name');
      expect(collection.contractAddress).to.be.equal(ACCOUNTS[1].address);
      expect(collection.totalSupply).to.be.equal(100);
      expect(collection.reflection).to.be.equal(2);
      expect(collection.commission).to.be.equal(3);
      expect(collection.incentive).to.be.equal(0);
      expect(collection.reflectionVault).to.be.an('array').that.is.not.empty;
      expect(collection.incentiveVault).to.be.equal(0);
      expect(ethers.utils.formatEther(collection.reflectionVault[0])).to.be.equal('0.04');
      expect(ethers.utils.formatEther(collection.reflectionVault[1])).to.be.equal('0.04');
      expect(ethers.utils.formatEther(collection.reflectionVault[5])).to.be.equal('0.04');
      expect(ethers.utils.formatEther(collection.reflectionVault[11])).to.be.equal('0.04');
      expect(ethers.utils.formatEther(collection.reflectionVault[21])).to.be.equal('0.04');
      expect(ethers.utils.formatEther(collection.reflectionVault[33])).to.be.equal('0.04');
      expect(ethers.utils.formatEther(collection.reflectionVault[41])).to.be.equal('0.04');
      expect(ethers.utils.formatEther(collection.reflectionVault[55])).to.be.equal('0.04');
      expect(ethers.utils.formatEther(collection.reflectionVault[60])).to.be.equal('0.04');
      expect(ethers.utils.formatEther(collection.reflectionVault[70])).to.be.equal('0.04');
      expect(ethers.utils.formatEther(collection.reflectionVault[80])).to.be.equal('0.04');
      expect(ethers.utils.formatEther(collection.reflectionVault[99])).to.be.equal('0.04');
      expect(collection.owner).to.be.equal(ACCOUNTS[2].address);
      expect(collection.collectionType).to.be.equal(1);
      expect(collection.active).to.be.equal(true);
    });
    it('Distribute collection reflection - invalid item id', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionReflectionReward(11, ethers.utils.parseEther('100'))
        .should.be.rejectedWith('The item does not exist');
    });

    it('Claim collection reflection reward - invalid', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._claimCollectionReflectionReward(1, ACCOUNTS[2].address)
        .should.be.rejectedWith('This NFT can not collect reflection rewards');
    });
    it('Claim collection reflection reward - no balance', async () => {
      const result = await CONTRACT.connect(ACCOUNTS[0])._claimCollectionReflectionReward(1, ACCOUNTS[1].address);
      expect(ethers.utils.formatEther(result)).to.be.equal('0.0');
    });
    it('Claim collection reflection reward - yes balance', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, ethers.utils.parseEther('100')
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);

      let result = await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionReflectionReward(itemId, ethers.utils.parseEther('100'));
      expect(ethers.utils.formatEther(result)).to.be.equal('2.0');

      // distribute 2 ether among 100 users once
      await CONTRACT.connect(ACCOUNTS[0])._distributeCollectionReflectionReward(itemId, result);

      const item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      const collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(item.collectionId);
      expect(collection.contractAddress).to.be.equal(ACCOUNTS[1].address);
      expect(collection.totalSupply).to.be.equal(100);
      expect(collection.reflection).to.be.equal(2);
      expect(collection.commission).to.be.equal(3);
      expect(collection.reflectionVault).to.be.an('array').that.is.not.empty;
      expect(ethers.utils.formatEther(collection.reflectionVault[0])).to.be.equal('0.02');
      expect(ethers.utils.formatEther(collection.reflectionVault[99])).to.be.equal('0.02');
      expect(collection.owner).to.be.equal(ACCOUNTS[2].address);

      result = await CONTRACT.connect(ACCOUNTS[0])._claimCollectionReflectionReward(1, ACCOUNTS[1].address);
      expect(ethers.utils.formatEther(result)).to.be.equal('0.02');
    });

    it('Update collection reflection reward - invalid', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._updateCollectionReflectionReward(1, ACCOUNTS[2].address, ethers.utils.parseEther('0.02'))
        .should.be.rejectedWith('This NFT can not deduct reflection rewards');
    });
    it('Update collection reflection reward - no balance', async () => {
      let result = await CONTRACT.connect(ACCOUNTS[0])._claimCollectionReflectionReward(1, ACCOUNTS[1].address);
      expect(ethers.utils.formatEther(result)).to.be.equal('0.0');
      await CONTRACT.connect(ACCOUNTS[0])._updateCollectionReflectionReward(1, ACCOUNTS[1].address, ethers.utils.parseEther('0.02'));
      result = await CONTRACT.connect(ACCOUNTS[0])._claimCollectionReflectionReward(1, ACCOUNTS[1].address);
      expect(ethers.utils.formatEther(result)).to.be.equal('0.02');
    });
    it('Update collection reflection reward - yes balance', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, ethers.utils.parseEther('100')
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);

      let result = await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionReflectionReward(itemId, ethers.utils.parseEther('100'));
      expect(ethers.utils.formatEther(result)).to.be.equal('2.0');

      // distribute 2 ether among 100 users once
      await CONTRACT.connect(ACCOUNTS[0])._distributeCollectionReflectionReward(itemId, result);

      const item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      const collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(item.collectionId);
      expect(collection.contractAddress).to.be.equal(ACCOUNTS[1].address);
      expect(collection.totalSupply).to.be.equal(100);
      expect(collection.reflection).to.be.equal(2);
      expect(collection.commission).to.be.equal(3);
      expect(collection.reflectionVault).to.be.an('array').that.is.not.empty;
      expect(ethers.utils.formatEther(collection.reflectionVault[0])).to.be.equal('0.02');
      expect(ethers.utils.formatEther(collection.reflectionVault[99])).to.be.equal('0.02');
      expect(collection.owner).to.be.equal(ACCOUNTS[2].address);

      result = await CONTRACT.connect(ACCOUNTS[0])._claimCollectionReflectionReward(1, ACCOUNTS[1].address);
      expect(ethers.utils.formatEther(result)).to.be.equal('0.02');

      await CONTRACT.connect(ACCOUNTS[0])._updateCollectionReflectionReward(1, ACCOUNTS[1].address, 0);

      result = await CONTRACT.connect(ACCOUNTS[0])._claimCollectionReflectionReward(1, ACCOUNTS[1].address);
      expect(ethers.utils.formatEther(result)).to.be.equal('0.0');
    });

    it('Calculate collection incentive reward - invalid item id', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionIncentiveReward(11)
        .should.be.rejectedWith('The item does not exist');
    });
    it('Calculate collection incentive reward', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, ethers.utils.parseEther('100')
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const result = await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionIncentiveReward(itemId);
      expect(ethers.utils.formatEther(result)).to.be.equal('0.0');
    });

    it('Set collection incentive reward percentage', async () => {
      let collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(2);
      expect(collection.incentive).to.be.equal(0);

      await CONTRACT.connect(ACCOUNTS[0])._setCollectionIncentive(2, 2);

      collection = collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(2);
      expect(collection.incentive).to.be.equal(2);
    });
    it('Set collection incentive reward percentage - invalid collection id', async () => {
      let collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(3)
        .should.be.rejectedWith('The collection does not exist');
    });

    it('Increase collection incentive reward - 0 incentive %', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, ethers.utils.parseEther('100')
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);

      let collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(item.collectionId);
      expect(ethers.utils.formatEther(collection.incentiveVault)).to.be.equal('0.0');
      result = await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionIncentiveReward(itemId);
      expect(ethers.utils.formatEther(result)).to.be.equal('0.0');

      await CONTRACT.connect(ACCOUNTS[0])._increaseCollectionIncentiveReward(item.collectionId, ethers.utils.parseEther('2'));

      collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(item.collectionId);
      expect(ethers.utils.formatEther(collection.incentiveVault)).to.be.equal('2.0');
      result = await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionIncentiveReward(itemId);
      expect(ethers.utils.formatEther(result)).to.be.equal('0.0');
    });
    it('Increase collection incentive reward - 2 incentive %', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, ethers.utils.parseEther('100')
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);

      await CONTRACT.connect(ACCOUNTS[0])._setCollectionIncentive(item.collectionId, 2);

      let collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(item.collectionId);
      expect(ethers.utils.formatEther(collection.incentiveVault)).to.be.equal('0.0');
      result = await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionIncentiveReward(itemId);
      expect(ethers.utils.formatEther(result)).to.be.equal('0.0');

      await CONTRACT.connect(ACCOUNTS[0])._increaseCollectionIncentiveReward(item.collectionId, ethers.utils.parseEther('2'));

      collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(item.collectionId);
      expect(ethers.utils.formatEther(collection.incentiveVault)).to.be.equal('2.0');
      result = await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionIncentiveReward(itemId);
      expect(ethers.utils.formatEther(result)).to.be.equal('0.04');
    });

    it('Decrease collection incentive reward - below 0', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, ethers.utils.parseEther('100')
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);

      let collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(item.collectionId);
      expect(ethers.utils.formatEther(collection.incentiveVault)).to.be.equal('0.0');
      result = await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionIncentiveReward(itemId);
      expect(ethers.utils.formatEther(result)).to.be.equal('0.0');

      await CONTRACT.connect(ACCOUNTS[0])._decreaseCollectionIncentiveReward(2, ethers.utils.parseEther('2'));

      collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(item.collectionId);
      expect(ethers.utils.formatEther(collection.incentiveVault)).to.be.equal('0.0');
      result = await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionIncentiveReward(itemId);
      expect(ethers.utils.formatEther(result)).to.be.equal('0.0');
    });
    it('Decrease collection incentive reward - increase then decrease', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[1].address, ACCOUNTS[2].address, EMPTY_ADDRESS, ethers.utils.parseEther('100')
      );
      const itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[1].address, ACCOUNTS[2].address);
      const item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);

      await CONTRACT.connect(ACCOUNTS[0])._setCollectionIncentive(item.collectionId, 2);

      let collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(item.collectionId);
      expect(ethers.utils.formatEther(collection.incentiveVault)).to.be.equal('0.0');
      result = await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionIncentiveReward(itemId);
      expect(ethers.utils.formatEther(result)).to.be.equal('0.0');

      await CONTRACT.connect(ACCOUNTS[0])._increaseCollectionIncentiveReward(item.collectionId, ethers.utils.parseEther('10'));

      collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(item.collectionId);
      expect(ethers.utils.formatEther(collection.incentiveVault)).to.be.equal('10.0');
      result = await CONTRACT.connect(ACCOUNTS[0])._calculateCollectionIncentiveReward(itemId);
      expect(ethers.utils.formatEther(result)).to.be.equal('0.2');

      await CONTRACT.connect(ACCOUNTS[0])._decreaseCollectionIncentiveReward(item.collectionId, result);

      collection = await CONTRACT.connect(ACCOUNTS[0]).getCollection(item.collectionId);
      expect(ethers.utils.formatEther(collection.incentiveVault)).to.be.equal('9.8');
    });

  });

  describe('Multiple collections', async () => {
    beforeEach(async () => {
      await CONTRACT.connect(ACCOUNTS[0]).createLocalCollection(
        'collection name', ACCOUNTS[1].address
      );
      await CONTRACT.connect(ACCOUNTS[0]).createVerifiedCollection(
        'collection name', ACCOUNTS[5].address, 100, 2, 3, ACCOUNTS[6].address
      );
    });

    it('get items collections', async () => {
      let result = await CONTRACT.connect(ACCOUNTS[0])._getItemsInCollection(1);
      expect(result).to.be.an('array').that.is.empty;
      result = await CONTRACT.connect(ACCOUNTS[0])._getItemsInCollection(2);
      expect(result).to.be.an('array').that.is.empty;
      result = await CONTRACT.connect(ACCOUNTS[0])._getItemsInCollection(3);
      expect(result).to.be.an('array').that.is.empty;
    });

    it('add items to collections', async () => {
      // unverified
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        2, ACCOUNTS[8].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        22, ACCOUNTS[9].address, ACCOUNTS[2].address, EMPTY_ADDRESS, 111
      );
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        33, ACCOUNTS[9].address, ACCOUNTS[3].address, EMPTY_ADDRESS, 111
      );

      // local
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        5, ACCOUNTS[1].address, ACCOUNTS[3].address, EMPTY_ADDRESS, 111
      );
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        55, ACCOUNTS[1].address, ACCOUNTS[3].address, EMPTY_ADDRESS, 111
      );
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        56, ACCOUNTS[1].address, ACCOUNTS[4].address, EMPTY_ADDRESS, 111
      );

      // verivied
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        7, ACCOUNTS[5].address, ACCOUNTS[4].address, EMPTY_ADDRESS, 111
      );
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        17, ACCOUNTS[5].address, ACCOUNTS[4].address, EMPTY_ADDRESS, 111
      );
      await CONTRACT.connect(ACCOUNTS[0])._addItemToCollection(
        27, ACCOUNTS[5].address, ACCOUNTS[6].address, EMPTY_ADDRESS, 111
      );

      // unverified
      let itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(2, ACCOUNTS[8].address, ACCOUNTS[2].address);
      let item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      let result = await CONTRACT.connect(ACCOUNTS[0])._getItemsInCollection(item.collectionId);
      expect(result[0].collectionId).to.be.equal(item.collectionId);

      itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(22, ACCOUNTS[9].address, ACCOUNTS[2].address);
      item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      result = await CONTRACT.connect(ACCOUNTS[0])._getItemsInCollection(item.collectionId);
      expect(result[0].collectionId).to.be.equal(item.collectionId);

      itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(33, ACCOUNTS[9].address, ACCOUNTS[3].address);
      item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      result = await CONTRACT.connect(ACCOUNTS[0])._getItemsInCollection(item.collectionId);
      expect(result[0].collectionId).to.be.equal(item.collectionId);

      // local
      itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(5, ACCOUNTS[1].address, ACCOUNTS[3].address);
      item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      result = await CONTRACT.connect(ACCOUNTS[0])._getItemsInCollection(item.collectionId);
      expect(result[0].collectionId).to.be.equal(item.collectionId);

      itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(55, ACCOUNTS[1].address, ACCOUNTS[3].address);
      item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      result = await CONTRACT.connect(ACCOUNTS[0])._getItemsInCollection(item.collectionId);
      expect(result[0].collectionId).to.be.equal(item.collectionId);

      itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(56, ACCOUNTS[1].address, ACCOUNTS[4].address);
      item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      result = await CONTRACT.connect(ACCOUNTS[0])._getItemsInCollection(item.collectionId);
      expect(result[0].collectionId).to.be.equal(item.collectionId);

      // verified
      itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(7, ACCOUNTS[5].address, ACCOUNTS[4].address);
      item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      result = await CONTRACT.connect(ACCOUNTS[0])._getItemsInCollection(item.collectionId);
      expect(result[0].collectionId).to.be.equal(item.collectionId);

      itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(17, ACCOUNTS[5].address, ACCOUNTS[4].address);
      item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      result = await CONTRACT.connect(ACCOUNTS[0])._getItemsInCollection(item.collectionId);
      expect(result[0].collectionId).to.be.equal(item.collectionId);

      itemId = await CONTRACT.connect(ACCOUNTS[0])._getItemId(27, ACCOUNTS[5].address, ACCOUNTS[6].address);
      item = await CONTRACT.connect(ACCOUNTS[0]).getItem(itemId);
      result = await CONTRACT.connect(ACCOUNTS[0])._getItemsInCollection(item.collectionId);
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
