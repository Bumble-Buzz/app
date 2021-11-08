// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.4 <0.9.0;

import '@openzeppelin/contracts/access/Ownable.sol';
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "./MarketItem.sol";

import "hardhat/console.sol";


contract MarketCollection is MarketItem, Ownable {
  using Counters for Counters.Counter;

  /**
    * Note All calculations using percentages will truncate any decimals.
    * Instead whole numbers will be used.
    *
    * Examples: number = (num * perVar / 100);
    *   - 2% of 100 = 2
    *   - 2% of 75 = 1
    *   - 2% of 50 = 1
    *   - 2% of 20 = 0
  */

  // enums
  // enum SALE_TYPE { direct, fixed_price, auction }
  enum COLLECTION_TYPE { local, varified, unvarified }
  enum COLLECTION_STATUS { active, inactive }

  // data structures
  // struct MarketItem {
  //   uint256 id; // unique item id
  //   uint256 collectionId; // collection id associated with this item
  //   uint256 tokenId; // unique token id of the item
  //   address contractAddress;
  //   address seller; // address of the seller / current owner
  //   address buyer; // address of the buyer / next owner (empty if not yet bought)
  //   uint256 price; // price of the item
  //   uint8 commission; // in percentage
  //   address creator; // original creator of the item
  //   SALE_TYPE saleType; // type of the sale for the item
  //   bool sold;
  // }

  struct Collection {
    uint256 id; // unique collection id
    string name; // collection name
    string tokenUri; // unique token uri of the collection
    address contractAddress; // contract address of the collection
    uint8 reflection; // in percentage
    uint8 commission; // in percentage
    address owner; // owner of the collection
    COLLECTION_TYPE collectitonType; // type of the collection
    COLLECTION_STATUS collectionStatus;
  }

  // state variables

  /**
    * @dev We use the same ITEM_SIZE to track the size of the collection, and also
    * use it to know which index in the mapping we want to add the new collection.
    * Example:  if ITEM_SIZE = 5
    *           We know there are 5 collections, but we also know in the mapping the
    *           collection id's are as follows: 0,1,2,3,4
    * So next time when we need to add a new collection, we use the same ITEM_SIZE variable
    * to add collection in index '5', and then increment size +1 in end because now we have 6 collections
  */
  // Counters.Counter private ITEM_SIZE; // tracks total number of items
  // mapping(uint256 => MarketItem) private ITEMS; // mapping item id to market item
  // mapping(address => uint256[]) private ITEM_OWNERS; // mapping item owner to item ids

  /**
    * @dev We use the same COLLECTION_SIZE to track the size of the collection, and also
    * use it to know which index in the mapping we want to add the new collection.
    * Example:  if COLLECTION_SIZE = 5
    *           We know there are 5 collections, but we also know in the mapping the
    *           collection id's are as follows: 0,1,2,3,4
    * So next time when we need to add a new collection, we use the same COLLECTION_SIZE variable
    * to add collection in index '5', and then increment size +1 in end because now we have 6 collections
  */
  Counters.Counter private COLLECTION_SIZE; // tracks total number of collections
  uint256 private MAX_COLLECTION_SIZE = 9999; // maximum number of collections allowed
  mapping(uint256 => Collection) private COLLECTIONS; // mapping collection id to collection
  mapping(address => uint256[]) private COLLECTION_OWNERS; // mapping collection owner to collection ids
  mapping(string => uint256) private COLLECTION_TOKEN_URIS; // mapping token uri to collection id

  mapping(uint256 => uint256[]) private ITEMS_IN_COLLECTION; // mapping collection id to list of item ids


  /**
    * @dev Create local collection
  */
  function createMarketCollection(string memory _name, string memory _tokenUri, address _contractAddress) public onlyOwner() {
    uint256 collectionIndex = COLLECTION_SIZE.current();
    COLLECTIONS[collectionIndex] = Collection({
      id: collectionIndex,
      name: _name,
      tokenUri: _tokenUri,
      contractAddress: _contractAddress,
      reflection: 0,
      commission: 0,
      owner: address(this),
      collectitonType: COLLECTION_TYPE.local,
      collectionStatus: COLLECTION_STATUS.active
    });

    addCollectionForOwner(address(this), collectionIndex);
    COLLECTION_SIZE.increment();
  }

  /**
    * @dev Create varified collection
  */
  function createMarketCollection(
    string memory _name, string memory _tokenUri, address _contractAddress, uint8 _reflection, uint8 _commission, address _owner
  ) public onlyOwner() {
    uint256 collectionIndex = COLLECTION_SIZE.current();
    COLLECTIONS[collectionIndex] = Collection({
      id: collectionIndex,
      name: _name,
      tokenUri: _tokenUri,
      contractAddress: _contractAddress,
      reflection: _reflection,
      commission: _commission,
      owner: _owner,
      collectitonType: COLLECTION_TYPE.varified,
      collectionStatus: COLLECTION_STATUS.active
    });
    COLLECTION_SIZE.increment();
  }

  /**
    * @dev Create unvarivied collection
  */
  function createMarketCollection(string memory _name) public onlyOwner() {
    uint256 collectionIndex = COLLECTION_SIZE.current();
    COLLECTIONS[collectionIndex] = Collection({
      id: collectionIndex,
      name: _name,
      tokenUri: '',
      contractAddress: address(0),
      reflection: 0,
      commission: 0,
      owner: address(this),
      collectitonType: COLLECTION_TYPE.unvarified,
      collectionStatus: COLLECTION_STATUS.active
    });
    COLLECTION_SIZE.increment();
  }

  /**
    * @dev Disable market collection using the collection id
  */
  function disableMarketCollection(uint256 _collectionId) public onlyOwner() {
    COLLECTIONS[_collectionId].collectionStatus = COLLECTION_STATUS.inactive;
  }

  /**
    * @dev Disable market collection using the token uri
  */
  function disableMarketCollection(string memory _tokenUri) public onlyOwner() {
    uint256 collectionIndex = COLLECTION_TOKEN_URIS[_tokenUri];
    COLLECTIONS[collectionIndex].collectionStatus = COLLECTION_STATUS.inactive;
  }

  /**
    * @dev Remove market collection using the collection id
  */
  function removeMarketCollection(uint256 _collectionId) public onlyOwner() {
    delete COLLECTIONS[_collectionId];
  }

  /**
    * @dev Remove market collection using the token uri
  */
  function removeMarketCollection(string memory _tokenUri) public onlyOwner() {
    uint256 collectionIndex = COLLECTION_TOKEN_URIS[_tokenUri];
    delete COLLECTIONS[collectionIndex];
  }

  /**
    * @dev Get collections for owner
  */
  function getCollectionsForOwner(address _owner) public view returns (uint256[] memory) {
    return COLLECTION_OWNERS[_owner];
  }

  /**
    * @dev Add a new owner (if necessary) and add collection id passed in
  */
  function addCollectionForOwner(address _owner, uint256 _collectionId) public {
    COLLECTION_OWNERS[_owner].push(_collectionId);
  }

  /**
    * @dev Remove a collection for owner
  */
  function removeCollectionForOwner(address _owner, uint256 _collectionId) public {
    uint256 arrLength = COLLECTION_OWNERS[_owner].length - 1;
    uint256[] memory data = new uint256[](arrLength);
    uint8 dataCounter = 0;
    for (uint256 i = 0; i < COLLECTION_OWNERS[_owner].length; i++) {
      if (COLLECTION_OWNERS[_owner][i] != _collectionId) {
        data[dataCounter] = COLLECTION_OWNERS[_owner][i];
        dataCounter++;
      }
    }

    COLLECTION_OWNERS[_owner] = data;
  }

  /**
    * @dev Remove the owner and disable all collections associated with it
  */
  function removeCollectionOwner(address _owner) public {
    for (uint256 i = 0; i < COLLECTION_OWNERS[_owner].length; i++) {
      disableMarketCollection(COLLECTION_OWNERS[_owner][i]);
    }
    delete COLLECTION_OWNERS[_owner];
  }

}
