// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.4 <0.9.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "./MarketItem.sol";

import "hardhat/console.sol";


contract MarketCollection is MarketItem {
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
  enum COLLECTION_TYPE { local, varified, unvarified }
  enum COLLECTION_STATUS { active, inactive }

  // data structures
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
  function _createMarketCollection(string memory _name, string memory _tokenUri, address _contractAddress) public {
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

    _addCollectionForOwner(address(this), collectionIndex);
    COLLECTION_SIZE.increment();
  }

  /**
    * @dev Create varified collection
  */
  function _createMarketCollection(
    string memory _name, string memory _tokenUri, address _contractAddress, uint8 _reflection, uint8 _commission, address _owner
  ) public {
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
  function _createMarketCollection(string memory _name) public {
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
  function _disableMarketCollection(uint256 _collectionId) public {
    COLLECTIONS[_collectionId].collectionStatus = COLLECTION_STATUS.inactive;
  }

  /**
    * @dev Disable market collection using the token uri
  */
  function _disableMarketCollection(string memory _tokenUri) public {
    uint256 collectionIndex = COLLECTION_TOKEN_URIS[_tokenUri];
    COLLECTIONS[collectionIndex].collectionStatus = COLLECTION_STATUS.inactive;
  }

  /**
    * @dev Remove market collection using the collection id
  */
  function _removeMarketCollection(uint256 _collectionId) public {
    delete COLLECTIONS[_collectionId];
  }

  /**
    * @dev Remove market collection using the token uri
  */
  function _removeMarketCollection(string memory _tokenUri) public {
    uint256 collectionIndex = COLLECTION_TOKEN_URIS[_tokenUri];
    delete COLLECTIONS[collectionIndex];
  }

  /**
    * @dev Get collections for owner
  */
  function _getCollectionsForOwner(address _owner) public view returns (uint256[] memory) {
    return COLLECTION_OWNERS[_owner];
  }

  /**
    * @dev Add a new owner (if necessary) and add collection id passed in
  */
  function _addCollectionForOwner(address _owner, uint256 _collectionId) public {
    COLLECTION_OWNERS[_owner].push(_collectionId);
  }

  /**
    * @dev Remove a collection for owner
  */
  function _removeCollectionForOwner(address _owner, uint256 _collectionId) public {
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
  function _removeCollectionOwner(address _owner) public {
    for (uint256 i = 0; i < COLLECTION_OWNERS[_owner].length; i++) {
      _disableMarketCollection(COLLECTION_OWNERS[_owner][i]);
    }
    delete COLLECTION_OWNERS[_owner];
  }

}
