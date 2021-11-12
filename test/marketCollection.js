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

describe("AvaxTrade - MarketCollection", () => {
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

  describe('Attribute functions', async () => {
    it('get max collection size', async () => {
      const result = await CONTRACT.connect(ACCOUNTS[0])._getMaxCollectionSize();
      expect(result).to.be.equal(9999);
    });
    it('set max collection size', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._setMaxCollectionSize(99999);
      const result = await CONTRACT.connect(ACCOUNTS[0])._getMaxCollectionSize();
      expect(result).to.be.equal(99999);
    });


    it('get collection id pointer', async () => {
      const result = await CONTRACT.connect(ACCOUNTS[0])._getCollectionIdPointer();
      expect(result).to.be.equal(0);
    });
    it('increment collection id pointer', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._createEmptyCollection();
      const result = await CONTRACT.connect(ACCOUNTS[0])._getCollectionIdPointer();
      expect(result).to.be.equal(1);
    });
    it('reset collection id pointer', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._resetCollectionIdPointer();
      const result = await CONTRACT.connect(ACCOUNTS[0])._getCollectionIdPointer();
      expect(result).to.be.equal(0);
    });
  });

  describe('Collection Id', async () => {
    // struct CollectionIdDS {
    //   uint256[] active;
    //   uint256[] local;
    //   uint256[] verified;
    //   uint256[] unverified;
    // }

    it('get collection ids', async () => {
      const result = await CONTRACT.connect(ACCOUNTS[0])._getCollectionIds();
      expect(result[0]).to.be.an('array').that.is.empty;
      expect(result[1]).to.be.an('array').that.is.empty;
      expect(result[2]).to.be.an('array').that.is.empty;
      expect(result[3]).to.be.an('array').that.is.empty;
    });

    it('get active collection ids', async () => {
      const result = await CONTRACT.connect(ACCOUNTS[0])._getActiveCollectionIds();
      expect(result).to.be.an('array').that.is.empty;
    });
    it('add active collection id', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addActiveCollectionId(123);
      const result = await CONTRACT.connect(ACCOUNTS[0])._getActiveCollectionIds();
      expect(_doesArrayInclude(result, ethers.BigNumber.from('123'))).to.be.true;
      const collectionIds = await CONTRACT.connect(ACCOUNTS[0])._getCollectionIds();
      expect(collectionIds[0]).to.be.an('array').that.is.not.empty;
      expect(collectionIds[1]).to.be.an('array').that.is.empty;
      expect(collectionIds[2]).to.be.an('array').that.is.empty;
      expect(collectionIds[3]).to.be.an('array').that.is.empty;
    });

    it('get local collection ids', async () => {
      const result = await CONTRACT.connect(ACCOUNTS[0])._getLocalCollectionIds();
      expect(result).to.be.an('array').that.is.empty;
    });
    it('add local collection id', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addLocalCollectionId(123);
      const result = await CONTRACT.connect(ACCOUNTS[0])._getLocalCollectionIds();
      expect(_doesArrayInclude(result, ethers.BigNumber.from('123'))).to.be.true;
      const collectionIds = await CONTRACT.connect(ACCOUNTS[0])._getCollectionIds();
      expect(collectionIds[0]).to.be.an('array').that.is.empty;
      expect(collectionIds[1]).to.be.an('array').that.is.not.empty;
      expect(collectionIds[2]).to.be.an('array').that.is.empty;
      expect(collectionIds[3]).to.be.an('array').that.is.empty;
    });

    it('get verified collection ids', async () => {
      const result = await CONTRACT.connect(ACCOUNTS[0])._getVerifiedCollectionIds();
      expect(result).to.be.an('array').that.is.empty;
    });
    it('add verified collection id', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addVerifiedCollectionId(123);
      const result = await CONTRACT.connect(ACCOUNTS[0])._getVerifiedCollectionIds();
      expect(_doesArrayInclude(result, ethers.BigNumber.from('123'))).to.be.true;
      const collectionIds = await CONTRACT.connect(ACCOUNTS[0])._getCollectionIds();
      expect(collectionIds[0]).to.be.an('array').that.is.empty;
      expect(collectionIds[1]).to.be.an('array').that.is.empty;
      expect(collectionIds[2]).to.be.an('array').that.is.not.empty;
      expect(collectionIds[3]).to.be.an('array').that.is.empty;
    });

    it('get unverified collection ids', async () => {
      const result = await CONTRACT.connect(ACCOUNTS[0])._getUnverifiedCollectionIds();
      expect(result).to.be.an('array').that.is.empty;
    });
    it('add unverified collection id', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addUnverifiedCollectionId(123);
      const result = await CONTRACT.connect(ACCOUNTS[0])._getUnverifiedCollectionIds();
      expect(_doesArrayInclude(result, ethers.BigNumber.from('123'))).to.be.true;
      const collectionIds = await CONTRACT.connect(ACCOUNTS[0])._getCollectionIds();
      expect(collectionIds[0]).to.be.an('array').that.is.empty;
      expect(collectionIds[1]).to.be.an('array').that.is.empty;
      expect(collectionIds[2]).to.be.an('array').that.is.empty;
      expect(collectionIds[3]).to.be.an('array').that.is.not.empty;
    });

    it('add various types of collection ids and test', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addActiveCollectionId(1);
      await CONTRACT.connect(ACCOUNTS[0])._addActiveCollectionId(2);
      await CONTRACT.connect(ACCOUNTS[0])._addLocalCollectionId(3);
      await CONTRACT.connect(ACCOUNTS[0])._addLocalCollectionId(4);
      await CONTRACT.connect(ACCOUNTS[0])._addVerifiedCollectionId(5);
      await CONTRACT.connect(ACCOUNTS[0])._addVerifiedCollectionId(6);
      await CONTRACT.connect(ACCOUNTS[0])._addVerifiedCollectionId(7);
      await CONTRACT.connect(ACCOUNTS[0])._addUnverifiedCollectionId(8);
      await CONTRACT.connect(ACCOUNTS[0])._addUnverifiedCollectionId(9);

      const collectionIds = await CONTRACT.connect(ACCOUNTS[0])._getCollectionIds();
      expect(collectionIds[0]).to.be.an('array').that.is.not.empty;
      expect(collectionIds[1]).to.be.an('array').that.is.not.empty;
      expect(collectionIds[2]).to.be.an('array').that.is.not.empty;
      expect(collectionIds[3]).to.be.an('array').that.is.not.empty;

      expect(_doesArrayInclude(collectionIds[0], ethers.BigNumber.from('1'))).to.be.true;
      expect(_doesArrayInclude(collectionIds[0], ethers.BigNumber.from('2'))).to.be.true;
      expect(_doesArrayInclude(collectionIds[1], ethers.BigNumber.from('3'))).to.be.true;
      expect(_doesArrayInclude(collectionIds[1], ethers.BigNumber.from('4'))).to.be.true;
      expect(_doesArrayInclude(collectionIds[2], ethers.BigNumber.from('5'))).to.be.true;
      expect(_doesArrayInclude(collectionIds[2], ethers.BigNumber.from('6'))).to.be.true;
      expect(_doesArrayInclude(collectionIds[2], ethers.BigNumber.from('7'))).to.be.true;
      expect(_doesArrayInclude(collectionIds[3], ethers.BigNumber.from('8'))).to.be.true;
      expect(_doesArrayInclude(collectionIds[3], ethers.BigNumber.from('9'))).to.be.true;
    });

    it('add and remove collection ids', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._createLocalCollection('local collection 1', 'token_uri', ACCOUNTS[1].address);
      await CONTRACT.connect(ACCOUNTS[0])._createLocalCollection('local collection 2', 'token_uri', ACCOUNTS[1].address);

      let collectionIds = await CONTRACT.connect(ACCOUNTS[0])._getCollectionIds();
      expect(_doesArrayInclude(collectionIds[0], ethers.BigNumber.from('1'))).to.be.true;
      expect(_doesArrayInclude(collectionIds[1], ethers.BigNumber.from('1'))).to.be.true;
      expect(_doesArrayInclude(collectionIds[0], ethers.BigNumber.from('2'))).to.be.true;
      expect(_doesArrayInclude(collectionIds[1], ethers.BigNumber.from('2'))).to.be.true;

      await CONTRACT.connect(ACCOUNTS[0])._removeCollectionId(2);

      collectionIds = await CONTRACT.connect(ACCOUNTS[0])._getCollectionIds();
      expect(_doesArrayInclude(collectionIds[0], ethers.BigNumber.from('1'))).to.be.true;
      expect(_doesArrayInclude(collectionIds[1], ethers.BigNumber.from('1'))).to.be.true;
      expect(_doesArrayInclude(collectionIds[0], ethers.BigNumber.from('2'))).to.be.false;
      expect(_doesArrayInclude(collectionIds[1], ethers.BigNumber.from('2'))).to.be.false;
    });
  });

  describe('Collection owner', async () => {
    // mapping(address => uint256[]) private COLLECTION_OWNERS;

    it('get collection for owner', async () => {
      const result = await CONTRACT.connect(ACCOUNTS[0])._getCollectionsForOwner(ACCOUNTS[1].address);
      expect(result).to.be.an('array').that.is.empty;
    });
    it('add collection for owner', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addCollectionForOwner(ACCOUNTS[1].address, 123);
      const result = await CONTRACT.connect(ACCOUNTS[0])._getCollectionsForOwner(ACCOUNTS[1].address);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(_doesArrayEqual(result, [ethers.BigNumber.from('123')])).to.be.true;
    });
    it('remove collection for owner - one collection', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addCollectionForOwner(ACCOUNTS[1].address, 123);

      let result = await CONTRACT.connect(ACCOUNTS[0])._getCollectionsForOwner(ACCOUNTS[1].address);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(_doesArrayEqual(result, [ethers.BigNumber.from('123')])).to.be.true;

      await CONTRACT.connect(ACCOUNTS[0])._removeCollectionForOwner(ACCOUNTS[1].address, 123);

      result = await CONTRACT.connect(ACCOUNTS[0])._getCollectionsForOwner(ACCOUNTS[1].address);
      expect(result).to.be.an('array').that.is.empty;
    });
    it('remove collection for owner - two collections', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addCollectionForOwner(ACCOUNTS[1].address, 123);
      await CONTRACT.connect(ACCOUNTS[0])._addCollectionForOwner(ACCOUNTS[1].address, 456);

      let result = await CONTRACT.connect(ACCOUNTS[0])._getCollectionsForOwner(ACCOUNTS[1].address);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(_doesArrayInclude(result, ethers.BigNumber.from('123'))).to.be.true;
      expect(_doesArrayInclude(result, ethers.BigNumber.from('456'))).to.be.true;

      await CONTRACT.connect(ACCOUNTS[0])._removeCollectionForOwner(ACCOUNTS[1].address, 123);

      result = await CONTRACT.connect(ACCOUNTS[0])._getCollectionsForOwner(ACCOUNTS[1].address);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(_doesArrayInclude(result, ethers.BigNumber.from('456'))).to.be.true;
    });
    it('remove collection owner', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addCollectionForOwner(ACCOUNTS[1].address, 123);
      await CONTRACT.connect(ACCOUNTS[0])._addCollectionForOwner(ACCOUNTS[1].address, 456);

      let result = await CONTRACT.connect(ACCOUNTS[0])._getCollectionsForOwner(ACCOUNTS[1].address);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(_doesArrayInclude(result, ethers.BigNumber.from('123'))).to.be.true;
      expect(_doesArrayInclude(result, ethers.BigNumber.from('456'))).to.be.true;

      await CONTRACT.connect(ACCOUNTS[0])._removeCollectionOwner(ACCOUNTS[1].address);

      result = await CONTRACT.connect(ACCOUNTS[0])._getCollectionsForOwner(ACCOUNTS[1].address);
      expect(result).to.be.an('array').that.is.empty;
    });
  });

  describe('Collection items', async () => {
    // mapping(uint256 => uint256[]) private COLLECTION_ITEMS;

    it('get items in collection', async () => {
      const result = await CONTRACT.connect(ACCOUNTS[0])._getItemsInCollection(1);
      expect(result).to.be.an('array').that.is.empty;
    });
    it('add item in collection', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemInCollection(1, 123);
      const result = await CONTRACT.connect(ACCOUNTS[0])._getItemsInCollection(1);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(_doesArrayEqual(result, [ethers.BigNumber.from('123')])).to.be.true;
    });
    it('remove item in collection - one item', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemInCollection(1, 123);

      let result = await CONTRACT.connect(ACCOUNTS[0])._getItemsInCollection(1);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(_doesArrayEqual(result, [ethers.BigNumber.from('123')])).to.be.true;

      await CONTRACT.connect(ACCOUNTS[0])._removeItemInCollection(1, 123);

      result = await CONTRACT.connect(ACCOUNTS[0])._getItemsInCollection(1);
      expect(result).to.be.an('array').that.is.empty;
    });
    it('remove item in collection - two items', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemInCollection(1, 123);
      await CONTRACT.connect(ACCOUNTS[0])._addItemInCollection(1, 456);

      let result = await CONTRACT.connect(ACCOUNTS[0])._getItemsInCollection(1);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(_doesArrayInclude(result, ethers.BigNumber.from('123'))).to.be.true;
      expect(_doesArrayInclude(result, ethers.BigNumber.from('456'))).to.be.true;

      await CONTRACT.connect(ACCOUNTS[0])._removeItemInCollection(1, 123);

      result = await CONTRACT.connect(ACCOUNTS[0])._getItemsInCollection(1);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(_doesArrayInclude(result, ethers.BigNumber.from('456'))).to.be.true;
    });
    it('remove collection item', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._addItemInCollection(1, 123);
      await CONTRACT.connect(ACCOUNTS[0])._addItemInCollection(1, 456);

      let result = await CONTRACT.connect(ACCOUNTS[0])._getItemsInCollection(1);
      expect(result).to.be.an('array').that.is.not.empty;
      expect(_doesArrayInclude(result, ethers.BigNumber.from('123'))).to.be.true;
      expect(_doesArrayInclude(result, ethers.BigNumber.from('456'))).to.be.true;

      await CONTRACT.connect(ACCOUNTS[0])._removeCollectionItem(1);

      result = await CONTRACT.connect(ACCOUNTS[0])._getItemsInCollection(1);
      expect(result).to.be.an('array').that.is.empty;
    });
  });

  describe('Main functions', async () => {
    // struct CollectionDS {
    //   uint256 id; // unique collection id
    //   string name; // collection name
    //   string tokenUri; // unique token uri of the collection
    //   address contractAddress; // contract address of the collection
    //   uint8 reflection; // in percentage
    //   uint8 commission; // in percentage
    //   address owner; // owner of the collection
    //   COLLECTION_TYPE collectitonType; // type of the collection
    //   bool active;
    // }
    // mapping(uint256 => CollectionDS) private COLLECTIONS;

    it('get active collections', async () => {
      const result = await CONTRACT.connect(ACCOUNTS[0])._getActiveCollections();
      expect(result).to.be.an('array').that.is.empty;
    });
    it('get local collections', async () => {
      const result = await CONTRACT.connect(ACCOUNTS[0])._getLocalCollections();
      expect(result).to.be.an('array').that.is.empty;
    });
    it('get verified collections', async () => {
      const result = await CONTRACT.connect(ACCOUNTS[0])._getVerifiedCollections();
      expect(result).to.be.an('array').that.is.empty;
    });
    it('get vunerified collections', async () => {
      const result = await CONTRACT.connect(ACCOUNTS[0])._getUnverifiedCollections();
      expect(result).to.be.an('array').that.is.empty;
    });
    it('get collection 1 - does not exist', async () => {
      const result = await CONTRACT.connect(ACCOUNTS[0])._getCollection(1)
        .should.be.rejectedWith('The collection does not exist');
    });

    it('create empty collection', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._createEmptyCollection();
      expect(await CONTRACT.connect(ACCOUNTS[0])._getCollectionIdPointer()).to.be.equal(1);
      const collectionIds = await CONTRACT.connect(ACCOUNTS[0])._getCollectionIds();
      expect(collectionIds[0]).to.be.an('array').that.is.not.empty;
      expect(collectionIds[1]).to.be.an('array').that.is.empty;
      expect(collectionIds[2]).to.be.an('array').that.is.empty;
      expect(collectionIds[3]).to.be.an('array').that.is.empty;
      expect(collectionIds[0].length).to.be.equal(1);
      expect(_doesArrayInclude(collectionIds[0], ethers.BigNumber.from('1'))).to.be.true;
    });
    it('create local collection', async () => {
      // {
      //   id: id,
      //   name: _name,
      //   tokenUri: _tokenUri,
      //   contractAddress: _contractAddress,
      //   reflection: 0,
      //   commission: 0,
      //   owner: address(this),
      //   collectitonType: COLLECTION_TYPE.local,
      //   active: true
      // }

      await CONTRACT.connect(ACCOUNTS[0])._createLocalCollection(
        'local collection',
        'local_collection_token_uri',
        ACCOUNTS[1].address
      );
      const collectionIds = await CONTRACT.connect(ACCOUNTS[0])._getCollectionIds();
      expect(collectionIds[0]).to.be.an('array').that.is.not.empty;
      expect(collectionIds[1]).to.be.an('array').that.is.not.empty;
      expect(collectionIds[2]).to.be.an('array').that.is.empty;
      expect(collectionIds[3]).to.be.an('array').that.is.empty;
      expect(_doesArrayEqual(collectionIds[0], [ethers.BigNumber.from('1')])).to.be.true;
      expect(_doesArrayEqual(collectionIds[1], [ethers.BigNumber.from('1')])).to.be.true;

      const collectionOwner = await CONTRACT.connect(ACCOUNTS[0])._getCollectionsForOwner(CONTRACT.address);
      expect(collectionOwner).to.be.an('array').that.is.not.empty;
      expect(_doesArrayEqual(collectionOwner, [ethers.BigNumber.from('1')])).to.be.true;

      expect(await CONTRACT.connect(ACCOUNTS[0])._getCollectionName(1)).to.be.equal('local collection');
      expect(await CONTRACT.connect(ACCOUNTS[0])._getCollectionTokenUri(1)).to.be.equal('local_collection_token_uri');
      expect(await CONTRACT.connect(ACCOUNTS[0])._getCollectionContractAddress(1)).to.be.equal(ACCOUNTS[1].address);
      expect(await CONTRACT.connect(ACCOUNTS[0])._getCollectionReflection(1)).to.be.equal(0);
      expect(await CONTRACT.connect(ACCOUNTS[0])._getCollectionCommission(1)).to.be.equal(0);
      expect(await CONTRACT.connect(ACCOUNTS[0])._getCollectionOwner(1)).to.be.equal(CONTRACT.address);
      expect(await CONTRACT.connect(ACCOUNTS[0])._getCollectitonType(1)).to.be.equal(0);
      expect(await CONTRACT.connect(ACCOUNTS[0])._getItemActive(1)).to.be.equal(true);
    });
    it('create verified collection', async () => {
      // {
      //   id: id,
      //   name: _name,
      //   tokenUri: _tokenUri,
      //   contractAddress: _contractAddress,
      //   reflection: _reflection,
      //   commission: _commission,
      //   owner: _owner,
      //   collectitonType: COLLECTION_TYPE.verified,
      //   active: true
      // }

      await CONTRACT.connect(ACCOUNTS[0])._createVerifiedCollection(
        'verified collection',
        'verified_collection_token_uri',
        ACCOUNTS[1].address,
        2,
        3,
        ACCOUNTS[2].address
      );
      const collectionIds = await CONTRACT.connect(ACCOUNTS[0])._getCollectionIds();
      expect(collectionIds[0]).to.be.an('array').that.is.not.empty;
      expect(collectionIds[1]).to.be.an('array').that.is.empty;
      expect(collectionIds[2]).to.be.an('array').that.is.not.empty;
      expect(collectionIds[3]).to.be.an('array').that.is.empty;
      expect(_doesArrayEqual(collectionIds[0], [ethers.BigNumber.from('1')])).to.be.true;
      expect(_doesArrayEqual(collectionIds[2], [ethers.BigNumber.from('1')])).to.be.true;

      const collectionOwner = await CONTRACT.connect(ACCOUNTS[0])._getCollectionsForOwner(ACCOUNTS[2].address);
      expect(collectionOwner).to.be.an('array').that.is.not.empty;
      expect(_doesArrayEqual(collectionOwner, [ethers.BigNumber.from('1')])).to.be.true;

      const collection = await CONTRACT.connect(ACCOUNTS[0])._getCollection(1);
      expect(collection.name).to.be.equal('verified collection');
      expect(collection.tokenUri).to.be.equal('verified_collection_token_uri');
      expect(collection.contractAddress).to.be.equal(ACCOUNTS[1].address);
      expect(collection.reflection).to.be.equal(2);
      expect(collection.commission).to.be.equal(3);
      expect(collection.owner).to.be.equal(ACCOUNTS[2].address);
      expect(collection.collectitonType).to.be.equal(1);
      expect(collection.active).to.be.equal(true);
    });
    it('create unvarivied collection', async () => {
      // {
      //   id: id,
      //   name: _name,
      //   tokenUri: '',
      //   contractAddress: address(0),
      //   reflection: 0,
      //   commission: 0,
      //   owner: address(this),
      //   collectitonType: COLLECTION_TYPE.unverified,
      //   active: true
      // }

      await CONTRACT.connect(ACCOUNTS[0])._createUnvariviedCollection(
        'unvarivied collection'
      );
      const collectionIds = await CONTRACT.connect(ACCOUNTS[0])._getCollectionIds();
      expect(collectionIds[0]).to.be.an('array').that.is.not.empty;
      expect(collectionIds[1]).to.be.an('array').that.is.empty;
      expect(collectionIds[2]).to.be.an('array').that.is.empty;
      expect(collectionIds[3]).to.be.an('array').that.is.not.empty;
      expect(_doesArrayEqual(collectionIds[0], [ethers.BigNumber.from('1')])).to.be.true;
      expect(_doesArrayEqual(collectionIds[3], [ethers.BigNumber.from('1')])).to.be.true;

      const collectionOwner = await CONTRACT.connect(ACCOUNTS[0])._getCollectionsForOwner(CONTRACT.address);
      expect(collectionOwner).to.be.an('array').that.is.not.empty;
      expect(_doesArrayEqual(collectionOwner, [ethers.BigNumber.from('1')])).to.be.true;

      const collection = await CONTRACT.connect(ACCOUNTS[0])._getCollection(1);
      expect(collection.name).to.be.equal('unvarivied collection');
      expect(collection.tokenUri).to.be.equal('');
      expect(collection.contractAddress).to.be.equal('0x0000000000000000000000000000000000000000');
      expect(collection.reflection).to.be.equal(0);
      expect(collection.commission).to.be.equal(0);
      expect(collection.owner).to.be.equal(CONTRACT.address);
      expect(collection.collectitonType).to.be.equal(2);
      expect(collection.active).to.be.equal(true);
    });
    it('create multiple collections - same user', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._createLocalCollection('local collection 1', 'token_uri_1', ACCOUNTS[1].address);
      await CONTRACT.connect(ACCOUNTS[0])._createVerifiedCollection(
        'verified collection 2', 'token_uri_2', ACCOUNTS[1].address, 2, 3, ACCOUNTS[2].address
      );
      await CONTRACT.connect(ACCOUNTS[0])._createUnvariviedCollection('unvarivied collection 3');
      await CONTRACT.connect(ACCOUNTS[0])._createLocalCollection('local collection 4', 'token_uri_4', ACCOUNTS[1].address);
      await CONTRACT.connect(ACCOUNTS[0])._createLocalCollection('local collection 5', 'token_uri_5', ACCOUNTS[1].address);
      await CONTRACT.connect(ACCOUNTS[0])._createUnvariviedCollection('unvarivied collection 6');
      await CONTRACT.connect(ACCOUNTS[0])._createVerifiedCollection(
        'verified collection 7', 'token_uri_7', ACCOUNTS[1].address, 2, 3, ACCOUNTS[2].address
      );
      await CONTRACT.connect(ACCOUNTS[0])._createVerifiedCollection(
        'verified collection 8', 'token_uri_8', ACCOUNTS[1].address, 2, 3, ACCOUNTS[2].address
      );
      await CONTRACT.connect(ACCOUNTS[0])._createVerifiedCollection(
        'verified collection 9', 'token_uri_9', ACCOUNTS[1].address, 2, 3, ACCOUNTS[2].address
      );

      const result = await CONTRACT.connect(ACCOUNTS[0])._getCollectionIdPointer();
      expect(result).to.be.equal(9);

      const collectionIds = await CONTRACT.connect(ACCOUNTS[0])._getCollectionIds();
      expect(collectionIds[0]).to.be.an('array').that.is.not.empty;
      expect(collectionIds[1]).to.be.an('array').that.is.not.empty;
      expect(collectionIds[2]).to.be.an('array').that.is.not.empty;
      expect(collectionIds[3]).to.be.an('array').that.is.not.empty;
      expect(collectionIds[0].length).to.be.equal(9);
      expect(collectionIds[1].length).to.be.equal(3);
      expect(collectionIds[2].length).to.be.equal(4);
      expect(collectionIds[3].length).to.be.equal(2);

      const activeCollections = await CONTRACT.connect(ACCOUNTS[0])._getActiveCollections();
      expect(activeCollections.length).to.be.equal(9);
      const localCollections = await CONTRACT.connect(ACCOUNTS[0])._getLocalCollections();
      expect(localCollections.length).to.be.equal(3);
      const verifiedCollections = await CONTRACT.connect(ACCOUNTS[0])._getVerifiedCollections();
      expect(verifiedCollections.length).to.be.equal(4);
      const unverifiedCollections = await CONTRACT.connect(ACCOUNTS[0])._getUnverifiedCollections();
      expect(unverifiedCollections.length).to.be.equal(2);
    });
    it('create multiple collections - different users', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._createLocalCollection('local collection 1', 'token_uri_1', ACCOUNTS[1].address);
      await CONTRACT.connect(ACCOUNTS[0])._createVerifiedCollection(
        'verified collection 2', 'token_uri_2', ACCOUNTS[1].address, 2, 3, ACCOUNTS[2].address
      );
      await CONTRACT.connect(ACCOUNTS[0])._createUnvariviedCollection('unvarivied collection 3');
      await CONTRACT.connect(ACCOUNTS[0])._createLocalCollection('local collection 4', 'token_uri_4', ACCOUNTS[5].address);
      await CONTRACT.connect(ACCOUNTS[0])._createLocalCollection('local collection 5', 'token_uri_5', ACCOUNTS[6].address);
      await CONTRACT.connect(ACCOUNTS[0])._createUnvariviedCollection('unvarivied collection 6');
      await CONTRACT.connect(ACCOUNTS[0])._createVerifiedCollection(
        'verified collection 7', 'token_uri_7', ACCOUNTS[1].address, 2, 3, ACCOUNTS[2].address
      );
      await CONTRACT.connect(ACCOUNTS[0])._createVerifiedCollection(
        'verified collection 8', 'token_uri_8', ACCOUNTS[1].address, 2, 3, ACCOUNTS[3].address
      );
      await CONTRACT.connect(ACCOUNTS[0])._createVerifiedCollection(
        'verified collection 9', 'token_uri_9', ACCOUNTS[1].address, 2, 3, ACCOUNTS[4].address
      );

      const result = await CONTRACT.connect(ACCOUNTS[0])._getCollectionIdPointer();
      expect(result).to.be.equal(9);

      const collectionIds = await CONTRACT.connect(ACCOUNTS[0])._getCollectionIds();
      expect(collectionIds[0]).to.be.an('array').that.is.not.empty;
      expect(collectionIds[1]).to.be.an('array').that.is.not.empty;
      expect(collectionIds[2]).to.be.an('array').that.is.not.empty;
      expect(collectionIds[3]).to.be.an('array').that.is.not.empty;
      expect(collectionIds[0].length).to.be.equal(9);
      expect(collectionIds[1].length).to.be.equal(3);
      expect(collectionIds[2].length).to.be.equal(4);
      expect(collectionIds[3].length).to.be.equal(2);

      const activeCollections = await CONTRACT.connect(ACCOUNTS[0])._getActiveCollections();
      expect(activeCollections.length).to.be.equal(9);
      const localCollections = await CONTRACT.connect(ACCOUNTS[0])._getLocalCollections();
      expect(localCollections.length).to.be.equal(3);
      const verifiedCollections = await CONTRACT.connect(ACCOUNTS[0])._getVerifiedCollections();
      expect(verifiedCollections.length).to.be.equal(4);
      const unverifiedCollections = await CONTRACT.connect(ACCOUNTS[0])._getUnverifiedCollections();
      expect(unverifiedCollections.length).to.be.equal(2);
    });
    it('deactivate collection', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._createLocalCollection('local collection 1', 'token_uri_1', CONTRACT.address);
      await CONTRACT.connect(ACCOUNTS[0])._createVerifiedCollection(
        'verified collection 2', 'token_uri_2', CONTRACT.address, 2, 3, ACCOUNTS[2].address
      );
      await CONTRACT.connect(ACCOUNTS[0])._createUnvariviedCollection('unvarivied collection 3');

      let collectionIdPointer = await CONTRACT.connect(ACCOUNTS[0])._getCollectionIdPointer();
      expect(collectionIdPointer).to.be.equal(3);

      let collectionIds = await CONTRACT.connect(ACCOUNTS[0])._getCollectionIds();
      expect(collectionIds[0].length).to.be.equal(3);
      expect(collectionIds[1].length).to.be.equal(1);
      expect(collectionIds[2].length).to.be.equal(1);
      expect(collectionIds[3].length).to.be.equal(1);

      await CONTRACT.connect(ACCOUNTS[0])._deactivateCollection(2);

      collectionIdPointer = await CONTRACT.connect(ACCOUNTS[0])._getCollectionIdPointer();
      expect(collectionIdPointer).to.be.equal(3);

      collectionIds = await CONTRACT.connect(ACCOUNTS[0])._getCollectionIds();
      expect(collectionIds[0].length).to.be.equal(2);
      expect(collectionIds[1].length).to.be.equal(1);
      expect(collectionIds[2].length).to.be.equal(0);
      expect(collectionIds[3].length).to.be.equal(1);

      const collection = await CONTRACT.connect(ACCOUNTS[0])._getCollection(2);
      expect(collection.active).to.be.equal(false);

      const collectionsForOwner = await CONTRACT.connect(ACCOUNTS[0])._getCollectionsForOwner(ACCOUNTS[2].address);
      expect(collectionsForOwner).to.be.an('array').that.is.not.empty;
      expect(_doesArrayInclude(collectionsForOwner, ethers.BigNumber.from('2'))).to.be.true;
    });
    it('remove collection', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._createLocalCollection('local collection 1', 'token_uri_1', CONTRACT.address);
      await CONTRACT.connect(ACCOUNTS[0])._createVerifiedCollection(
        'verified collection 2', 'token_uri_2', CONTRACT.address, 2, 3, ACCOUNTS[2].address
      );
      await CONTRACT.connect(ACCOUNTS[0])._createUnvariviedCollection('unvarivied collection 3');

      let collectionIdPointer = await CONTRACT.connect(ACCOUNTS[0])._getCollectionIdPointer();
      expect(collectionIdPointer).to.be.equal(3);

      let collectionIds = await CONTRACT.connect(ACCOUNTS[0])._getCollectionIds();
      expect(collectionIds[0].length).to.be.equal(3);
      expect(collectionIds[1].length).to.be.equal(1);
      expect(collectionIds[2].length).to.be.equal(1);
      expect(collectionIds[3].length).to.be.equal(1);

      await CONTRACT.connect(ACCOUNTS[0])._removeCollection(2);

      collectionIdPointer = await CONTRACT.connect(ACCOUNTS[0])._getCollectionIdPointer();
      expect(collectionIdPointer).to.be.equal(3);

      collectionIds = await CONTRACT.connect(ACCOUNTS[0])._getCollectionIds();
      expect(collectionIds[0].length).to.be.equal(2);
      expect(collectionIds[1].length).to.be.equal(1);
      expect(collectionIds[2].length).to.be.equal(0);
      expect(collectionIds[3].length).to.be.equal(1);

      const collection = await CONTRACT.connect(ACCOUNTS[0])._getCollection(2)
        .should.be.rejectedWith('The collection does not exist');

      const collectionsForOwner = await CONTRACT.connect(ACCOUNTS[0])._getCollectionsForOwner(ACCOUNTS[2].address);
      expect(collectionsForOwner).to.be.an('array').that.is.empty;
      expect(_doesArrayInclude(collectionsForOwner, ethers.BigNumber.from('2'))).to.be.false;
    });
  });

  describe('Collection attributes', async () => {
    beforeEach(async () => {
      await CONTRACT.connect(ACCOUNTS[0])._createVerifiedCollection(
        'collection name', 'token_uri', ACCOUNTS[1].address, 2, 3, ACCOUNTS[2].address
      );
    });

    it('get collection name', async () => {
      expect(await CONTRACT.connect(ACCOUNTS[0])._getCollectionName(1)).to.be.equal('collection name');
    });
    it('update collection name', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._updateCollectionName(1, 'collection name 2');
      expect(await CONTRACT.connect(ACCOUNTS[0])._getCollectionName(1)).to.be.equal('collection name 2');
    });

    it('get collection token uri', async () => {
      expect(await CONTRACT.connect(ACCOUNTS[0])._getCollectionTokenUri(1)).to.be.equal('token_uri');
    });
    it('update collection token uri', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._updateCollectionTokenUri(1, 'token_uri 2');
      expect(await CONTRACT.connect(ACCOUNTS[0])._getCollectionTokenUri(1)).to.be.equal('token_uri 2');
    });

    it('get collection contract address', async () => {
      expect(await CONTRACT.connect(ACCOUNTS[0])._getCollectionContractAddress(1)).to.be.equal(ACCOUNTS[1].address);
    });
    it('update collection contract address', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._updateCollectionContractAddress(1, ACCOUNTS[3].address);
      expect(await CONTRACT.connect(ACCOUNTS[0])._getCollectionContractAddress(1)).to.be.equal(ACCOUNTS[3].address);
    });

    it('get collection reflection', async () => {
      expect(await CONTRACT.connect(ACCOUNTS[0])._getCollectionReflection(1)).to.be.equal(2);
    });
    it('update collection reflection', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._updateCollectionReflection(1, 22);
      expect(await CONTRACT.connect(ACCOUNTS[0])._getCollectionReflection(1)).to.be.equal(22);
    });

    it('get collection commission', async () => {
      expect(await CONTRACT.connect(ACCOUNTS[0])._getCollectionCommission(1)).to.be.equal(3);
    });
    it('update collection commission', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._updateCollectionCommission(1, 33);
      expect(await CONTRACT.connect(ACCOUNTS[0])._getCollectionCommission(1)).to.be.equal(33);
    });

    it('get collection owner', async () => {
      expect(await CONTRACT.connect(ACCOUNTS[0])._getCollectionOwner(1)).to.be.equal(ACCOUNTS[2].address);
    });
    it('update collection owner', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._updateCollectionOwner(1, ACCOUNTS[4].address);
      expect(await CONTRACT.connect(ACCOUNTS[0])._getCollectionOwner(1)).to.be.equal(ACCOUNTS[4].address);
    });

    it('get collection type', async () => {
      expect(await CONTRACT.connect(ACCOUNTS[0])._getCollectitonType(1)).to.be.equal(1);
    });
    it('update collection type', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._updateCollectitonType(1, 2);
      expect(await CONTRACT.connect(ACCOUNTS[0])._getCollectitonType(1)).to.be.equal(2);
    });

    it('get collection active', async () => {
      expect(await CONTRACT.connect(ACCOUNTS[0])._getItemActive(1)).to.be.equal(true);
    });
    it('update collection active', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._updateItemActive(1, false);
      expect(await CONTRACT.connect(ACCOUNTS[0])._getItemActive(1)).to.be.equal(false);
    });

    it('get collection', async () => {
      const collection = await CONTRACT.connect(ACCOUNTS[0])._getCollection(1);
      expect(collection.name).to.be.equal('collection name');
    });
    it('update collection', async () => {
      await CONTRACT.connect(ACCOUNTS[0])._updateCollection(
        1 ,'collection name 2', 'token_uri 2', ACCOUNTS[3].address, 22, 33, ACCOUNTS[4].address, 1, false
      );
      const collection = await CONTRACT.connect(ACCOUNTS[0])._getCollection(1);
      expect(collection.id).to.be.equal(1);
      expect(collection.name).to.be.equal('collection name 2');
      expect(collection.tokenUri).to.be.equal('token_uri 2');
      expect(collection.contractAddress).to.be.equal(ACCOUNTS[3].address);
      expect(collection.reflection).to.be.equal(22);
      expect(collection.commission).to.be.equal(33);
      expect(collection.owner).to.be.equal(ACCOUNTS[4].address);
      expect(collection.collectitonType).to.be.equal(1);
      expect(collection.active).to.be.equal(false);
    });
  });

});
