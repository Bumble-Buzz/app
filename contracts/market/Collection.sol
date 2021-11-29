// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.4 <0.9.0;

import "@openzeppelin/contracts/utils/Counters.sol";

import "hardhat/console.sol";


contract Collection {
  using Counters for Counters.Counter;

  // modifiers
  modifier checkCollection(uint256 _id) {
    require(_collectionExists(_id), "The collection does not exist");
    _;
  }

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
  enum COLLECTION_TYPE { local, verified, unverified }

  // data structures
  /**
    * @dev for the `reflectionVault` attribute
    *   Each array element represents balance of the corrosponding token id
    *   Examples:
    *     tokenId 1  -> reflectionVault[0]
    *     tokenId 5  -> reflectionVault[4]
    *     tokenId 11 -> reflectionVault[10]
    *     tokenId 25 -> reflectionVault[24]
  */
  struct CollectionDS {
    uint256 id; // unique collection id
    string name; // collection name
    address contractAddress; // contract address of the collection
    uint256 totalSupply; // total supply of items in this collection
    uint8 reflection; // in percentage
    uint8 commission; // in percentage
    uint8 incentive; // in percentage
    uint256[] reflectionVault; // keeps track of balance owed for each token id holder
    uint256 incentiveVault; // keeps track of balance used to give upon completion of market sale
    address owner; // owner of the collection
    COLLECTION_TYPE collectionType; // type of the collection
    bool active;
  }
  struct CollectionIdDS {
    uint256[] active;
    uint256[] local;
    uint256[] verified;
    uint256[] unverified;
  }

  // state variables

  /**
    * @dev We use the same COLLECTION_ID_POINTER to track the size of the collection, and also
    * use it to know which index in the mapping we want to add the new collection.
    * Example:  if COLLECTION_ID_POINTER = 5
    *           We know there are 5 collections, but we also know in the mapping the
    *           collection id's are as follows: 0,1,2,3,4
    * So next time when we need to add a new collection, we use the same COLLECTION_ID_POINTER variable
    * to add collection in index '5', and then increment size +1 in end because now we have 6 collections
  */
  Counters.Counter private COLLECTION_ID_POINTER; // tracks total number of collections
  uint256 private MAX_COLLECTION_SIZE = 9999; // maximum number of collections allowed
  CollectionIdDS private COLLECTION_IDS; // Track important info for all collections
  mapping(uint256 => CollectionDS) private COLLECTIONS; // mapping collection id to collection

  mapping(address => uint256[]) private COLLECTION_OWNERS; // mapping collection owner to collection ids
  mapping(address => uint256) private COLLECTION_CONTRACTS; // mapping contract addresses to a collection id


  /**
    * @dev Check if item exists
  */
  function _collectionExists(uint256 _id) private view returns (bool) {
    if (COLLECTIONS[_id].id != 0) {
      return true;
    }
    return false;
  }


  /** 
    *****************************************************
    **************** Attribute Functions ****************
    *****************************************************
  */
  /**
    * @dev Get max collection size
  */
  function _getMaxCollectionSize() internal view returns (uint256) {
    return MAX_COLLECTION_SIZE;
  }

  /**
    * @dev Set max collection size
  */
  function _setMaxCollectionSize(uint256 _size) internal {
    MAX_COLLECTION_SIZE = _size;
  }

  /**
    * @dev Get collection id pointer
  */
  function _getCollectionIdPointer() internal view returns (uint256) {
    return COLLECTION_ID_POINTER.current();
  }

  /**
    * @dev Reset collection id pointer to 0
  */
  function _resetCollectionIdPointer() internal {
    COLLECTION_ID_POINTER.reset();
  }


  /** 
    *****************************************************
    ****************** Main Functions *******************
    *****************************************************
  */
  /**
    * @dev Add empty collection
  */
  function _createEmptyCollection() internal {
    COLLECTION_ID_POINTER.increment();
    uint256 id = COLLECTION_ID_POINTER.current();
    COLLECTIONS[id].id = id;
    _addActiveCollectionId(id);
  }

  /**
    * @dev Create local collection
  */
  function _createLocalCollection(string memory _name, address _contractAddress) internal {
    COLLECTION_ID_POINTER.increment();
    uint256 id = COLLECTION_ID_POINTER.current();
    COLLECTIONS[id] = CollectionDS({
      id: id,
      name: _name,
      contractAddress: _contractAddress,
      totalSupply: 0,
      reflection: 0,
      commission: 0,
      incentive: 0,
      reflectionVault: new uint256[](0),
      incentiveVault: 0,
      owner: address(this),
      collectionType: COLLECTION_TYPE.local,
      active: true
    });

    _addActiveCollectionId(id);
    _addLocalCollectionId(id);
    _addCollectionForOwner(address(this), id);
    _assignContractToCollection(_contractAddress, id);
  }

  /**
    * @dev Create verified collection
  */
  function _createVerifiedCollection(
    string memory _name, address _contractAddress, uint256 _totalSupply, uint8 _reflection, uint8 _commission, address _owner
  ) internal {
    COLLECTION_ID_POINTER.increment();
    uint256 id = COLLECTION_ID_POINTER.current();
    COLLECTIONS[id] = CollectionDS({
      id: id,
      name: _name,
      contractAddress: _contractAddress,
      totalSupply: _totalSupply,
      reflection: _reflection,
      commission: _commission,
      incentive: 0,
      reflectionVault: new uint256[](_totalSupply),
      incentiveVault: 0,
      owner: _owner,
      collectionType: COLLECTION_TYPE.verified,
      active: true
    });

    _addActiveCollectionId(id);
    _addVerifiedCollectionId(id);
    _addCollectionForOwner(_owner, id);
    _assignContractToCollection(_contractAddress, id);
  }

  /**
    * @dev Create unvarivied collection
  */
  function _createUnvariviedCollection(string memory _name) internal {
    COLLECTION_ID_POINTER.increment();
    uint256 id = COLLECTION_ID_POINTER.current();
    COLLECTIONS[id] = CollectionDS({
      id: id,
      name: _name,
      contractAddress: address(0),
      totalSupply: 0,
      reflection: 0,
      commission: 0,
      incentive: 0,
      reflectionVault: new uint256[](0),
      incentiveVault: 0,
      owner: address(this),
      collectionType: COLLECTION_TYPE.unverified,
      active: true
    });

    _addActiveCollectionId(id);
    _addUnverifiedCollectionId(id);
    _addCollectionForOwner(address(this), id);
    _assignContractToCollection(address(0), id);
  }

  /**
    * @dev Get collection
  */
  function _getCollection(uint256 _id) internal view checkCollection(_id) returns (CollectionDS memory) {
    CollectionDS memory collection = COLLECTIONS[_id];
    return collection;
  }

  /**
    * @dev Get active collections
  */
  function _getActiveCollections() internal view returns (CollectionDS[] memory) {
    uint256 arrLength = COLLECTION_IDS.active.length;
    CollectionDS[] memory collections = new CollectionDS[](arrLength);
    for (uint256 i = 0; i < arrLength; i++) {
      uint256 id = COLLECTION_IDS.active[i];
      CollectionDS memory collection = COLLECTIONS[id];
      collections[i] = collection;
    }
    return collections;
  }

  /**
    * @dev Get local collections
  */
  function _getLocalCollections() internal view returns (CollectionDS[] memory) {
    uint256 arrLength = COLLECTION_IDS.local.length;
    CollectionDS[] memory collections = new CollectionDS[](arrLength);
    for (uint256 i = 0; i < arrLength; i++) {
      uint256 id = COLLECTION_IDS.local[i];
      CollectionDS memory collection = COLLECTIONS[id];
      collections[i] = collection;
    }
    return collections;
  }

  /**
    * @dev Get verified collections
  */
  function _getVerifiedCollections() internal view returns (CollectionDS[] memory) {
    uint256 arrLength = COLLECTION_IDS.verified.length;
    CollectionDS[] memory collections = new CollectionDS[](arrLength);
    for (uint256 i = 0; i < arrLength; i++) {
      uint256 id = COLLECTION_IDS.verified[i];
      CollectionDS memory collection = COLLECTIONS[id];
      collections[i] = collection;
    }
    return collections;
  }

  /**
    * @dev Get vunerified collections
  */
  function _getUnverifiedCollections() internal view returns (CollectionDS[] memory) {
    uint256 arrLength = COLLECTION_IDS.unverified.length;
    CollectionDS[] memory collections = new CollectionDS[](arrLength);
    for (uint256 i = 0; i < arrLength; i++) {
      uint256 id = COLLECTION_IDS.unverified[i];
      CollectionDS memory collection = COLLECTIONS[id];
      collections[i] = collection;
    }
    return collections;
  }

  /**
    * @dev Update collection
  */
  function _updateCollection(
    uint256 _id, string memory _name, address _contractAddress, uint8 _reflection, uint8 _commission,
    address _owner, bool _active
  ) internal checkCollection(_id) {
    // Preserve some values which were initialized when collection was created
    COLLECTION_TYPE collectionType = COLLECTIONS[_id].collectionType;
    uint256 totalSupply = COLLECTIONS[_id].totalSupply;
    COLLECTIONS[_id] = CollectionDS({
      id: _id,
      name: _name,
      contractAddress: _contractAddress,
      totalSupply: totalSupply,
      reflection: _reflection,
      commission: _commission,
      incentive: 0,
      reflectionVault: new uint256[](totalSupply),
      incentiveVault: 0,
      owner: _owner,
      collectionType: collectionType,
      active: _active
    });
    if (!_active) {
      _removeCollectionId(_id);
    }
  }

  /**
    * @dev Get collection name
  */
  function _getCollectionName(uint256 _id) internal view checkCollection(_id) returns (string memory) {
    return COLLECTIONS[_id].name;
  }

  /**
    * @dev Update collection name
  */
  function _updateCollectionName(uint256 _id, string memory _name) internal checkCollection(_id) {
    COLLECTIONS[_id].name = _name;
  }

  /**
    * @dev Get collection contract address
  */
  function _getCollectionContractAddress(uint256 _id) internal view checkCollection(_id) returns (address) {
    return COLLECTIONS[_id].contractAddress;
  }

  /**
    * @dev Update collection contract address
  */
  function _updateCollectionContractAddress(uint256 _id, address _contractAddress) internal checkCollection(_id) {
    COLLECTIONS[_id].contractAddress = _contractAddress;
  }

  /**
    * @dev Get total supply
  */
  function _getCollectionTotalSupply(uint256 _id) internal view checkCollection(_id) returns (uint256) {
    return COLLECTIONS[_id].totalSupply;
  }

  /**
    * @dev Get collection reflection
  */
  function _getCollectionReflection(uint256 _id) internal view checkCollection(_id) returns (uint8) {
    return COLLECTIONS[_id].reflection;
  }

  /**
    * @dev Update collection reflection
  */
  function _updateCollectionReflection(uint256 _id, uint8 _reflection) internal checkCollection(_id) {
    COLLECTIONS[_id].reflection = _reflection;
  }

  /**
    * @dev Get collection commission
  */
  function _getCollectionCommission(uint256 _id) internal view checkCollection(_id) returns (uint8) {
    return COLLECTIONS[_id].commission;
  }

  /**
    * @dev Update collection commission
  */
  function _updateCollectionCommission(uint256 _id, uint8 _commission) internal checkCollection(_id) {
    COLLECTIONS[_id].commission = _commission;
  }

  /**
    * @dev Get collection incentive
  */
  function _getCollectionIncentive(uint256 _id) internal view checkCollection(_id) returns (uint8) {
    return COLLECTIONS[_id].incentive;
  }

  /**
    * @dev Update collection incentive
  */
  function _updateCollectionIncentive(uint256 _id, uint8 _incentive) internal checkCollection(_id) {
    COLLECTIONS[_id].incentive = _incentive;
  }

  /**
    * @dev Get collection reflection vault
  */
  function _getCollectionReflectionVault(uint256 _id) internal view checkCollection(_id) returns (uint256[] memory) {
    return COLLECTIONS[_id].reflectionVault;
  }

  /**
    * @dev Update collection reflection vault
      @param _id : collection id
      @param _rewardPerItem : reward needs to be allocated to each item in this collection
  */
  function _updateCollectionReflectionVault(uint256 _id, uint256 _rewardPerItem) internal checkCollection(_id) {
    for (uint256 i = 0; i < COLLECTIONS[_id].reflectionVault.length; i++) {
      uint256 currentValue = COLLECTIONS[_id].reflectionVault[i];
      COLLECTIONS[_id].reflectionVault[i] = currentValue + _rewardPerItem;
    }
  }

  /**
    * @dev Get collection reflection vault index
  */
  function _getCollectionReflectionVaultIndex(uint256 _id, uint256 _index) internal view checkCollection(_id) returns (uint256) {
    return COLLECTIONS[_id].reflectionVault[_index];
  }

  /**
    * @dev Update collection reflection vault index
      @param _id : collection id
      @param _index : specific vault index to update
      @param _reward : reward for one vault index
  */
  function _updateCollectionReflectionVaultIndex(uint256 _id, uint256 _index, uint256 _reward) internal checkCollection(_id) {
    COLLECTIONS[_id].reflectionVault[_index] = _reward;
  }

  /**
    * @dev Get collection incentive vault
  */
  function _getCollectionIncentiveVault(uint256 _id) internal view checkCollection(_id) returns (uint256) {
    return COLLECTIONS[_id].incentiveVault;
  }

  /**
    * @dev Update collection incentive vault
  */
  function _updateCollectionIncentiveVault(uint256 _id, uint256 _incentiveVault) internal checkCollection(_id) {
    COLLECTIONS[_id].incentiveVault = _incentiveVault;
  }

  /**
    * @dev Get collection owner
  */
  function _getCollectionOwner(uint256 _id) internal view checkCollection(_id) returns (address) {
    return COLLECTIONS[_id].owner;
  }

  /**
    * @dev Update collection owner
  */
  function _updateCollectionOwner(uint256 _id, address _owner) internal checkCollection(_id) {
    COLLECTIONS[_id].owner = _owner;
  }

  /**
    * @dev Get collection type
  */
  function _getCollectionType(uint256 _id) internal view checkCollection(_id) returns (COLLECTION_TYPE) {
    return COLLECTIONS[_id].collectionType;
  }

  /**
    * @dev Update collection type
  */
  function _updateCollectionType(uint256 _id, COLLECTION_TYPE _collectionType) internal checkCollection(_id) {
    COLLECTIONS[_id].collectionType = _collectionType;
  }

  /**
    * @dev Get collection active boolean
  */
  function _getCollectionActive(uint256 _id) internal view checkCollection(_id) returns (bool) {
    return COLLECTIONS[_id].active;
  }

  /**
    * @dev Update collectiton active boolean
  */
  function _updateCollectionActive(uint256 _id, bool _active) internal checkCollection(_id) {
    COLLECTIONS[_id].active = _active;
  }

  /**
    * @dev Deactivate collection
  */
  function _deactivateCollection(uint256 _id) internal checkCollection(_id) {
    _removeCollectionId(_id);
    _updateCollectionActive(_id, false);
  }

  /**
    * @dev Remove collection
  */
  function _removeCollection(uint256 _id) checkCollection(_id) internal {
    _removeCollectionId(_id);
    _removeCollectionOwner(COLLECTIONS[_id].owner);
    delete COLLECTIONS[_id];
  }


  /** 
    *****************************************************
    ************* COLLECTION_IDS Functions **************
    *****************************************************
  */
  /**
    * @dev Add a new active collection
  */
  function _addActiveCollectionId(uint256 _id) internal {
    COLLECTION_IDS.active.push(_id);
  }

  /**
    * @dev Get active collection ids
  */
  function _getActiveCollectionIds() internal view returns (uint256[] memory) {
    return COLLECTION_IDS.active;
  }

  /**
    * @dev Add a new local collection
  */
  function _addLocalCollectionId(uint256 _id) internal {
    COLLECTION_IDS.local.push(_id);
  }

  /**
    * @dev Get local collection ids
  */
  function _getLocalCollectionIds() internal view returns (uint256[] memory) {
    return COLLECTION_IDS.local;
  }

  /**
    * @dev Add a new verified collection
  */
  function _addVerifiedCollectionId(uint256 _id) internal {
    COLLECTION_IDS.verified.push(_id);
  }

  /**
    * @dev Get verified collection ids
  */
  function _getVerifiedCollectionIds() internal view returns (uint256[] memory) {
    return COLLECTION_IDS.verified;
  }

  /**
    * @dev Add a new unverified collection
  */
  function _addUnverifiedCollectionId(uint256 _id) internal {
    COLLECTION_IDS.unverified.push(_id);
  }

  /**
    * @dev Get unverified collection ids
  */
  function _getUnverifiedCollectionIds() internal view returns (uint256[] memory) {
    return COLLECTION_IDS.unverified;
  }

  /**
    * @dev Get collection ids
  */
  function _getCollectionIds() internal view returns (CollectionIdDS memory) {
    return COLLECTION_IDS;
  }

  /**
    * @dev Remove collection id
  */
  function _removeCollectionId(uint256 _id) internal checkCollection(_id) {
    // COLLECTION_IDS.active = data;
    COLLECTION_IDS.active = _removeSpecificCollectionId(_id, COLLECTION_IDS.active);

    // remove from collection type specific array
    COLLECTION_TYPE collectionType = COLLECTIONS[_id].collectionType;
    if (collectionType == COLLECTION_TYPE.local) {
      COLLECTION_IDS.local = _removeSpecificCollectionId(_id, COLLECTION_IDS.local);
    } else if (collectionType == COLLECTION_TYPE.verified) {
      COLLECTION_IDS.verified = _removeSpecificCollectionId(_id, COLLECTION_IDS.verified);
    } else if (collectionType == COLLECTION_TYPE.unverified) {
      COLLECTION_IDS.unverified = _removeSpecificCollectionId(_id, COLLECTION_IDS.unverified);
    }
  }

  /**
    * @dev Remove collection id for specific collection type
  */
  function _removeSpecificCollectionId(uint256 _id, uint256[] memory _collectionArray) private view checkCollection(_id) returns (uint256[] memory) {
    // remove from active collection array
    uint256 arrLength = _collectionArray.length - 1;
    uint256[] memory data = new uint256[](arrLength);
    uint8 dataCounter = 0;
    for (uint256 i = 0; i < _collectionArray.length; i++) {
      if (_collectionArray[i] != _id) {
        data[dataCounter] = _collectionArray[i];
        dataCounter++;
      }
    }
    return _collectionArray = data;
  }


  /** 
    *****************************************************
    *********** COLLECTION_OWNERS Functions *************
    *****************************************************
  */
  /**
    * @dev Add a new owner (if necessary) and add collection id passed in
  */
  function _addCollectionForOwner(address _owner, uint256 _id) internal {
    COLLECTION_OWNERS[_owner].push(_id);
  }

  /**
    * @dev Get collections for owner
  */
  function _getCollectionsForOwner(address _owner) internal view returns (uint256[] memory) {
    return COLLECTION_OWNERS[_owner];
  }

  /**
    * @dev Remove a collection for owner
  */
  function _removeCollectionForOwner(address _owner, uint256 _id) internal {
    uint256 arrLength = COLLECTION_OWNERS[_owner].length - 1;
    uint256[] memory data = new uint256[](arrLength);
    uint8 dataCounter = 0;
    for (uint256 i = 0; i < COLLECTION_OWNERS[_owner].length; i++) {
      if (COLLECTION_OWNERS[_owner][i] != _id) {
        data[dataCounter] = COLLECTION_OWNERS[_owner][i];
        dataCounter++;
      }
    }
    COLLECTION_OWNERS[_owner] = data;
  }

  /**
    * @dev Remove the collection owner
  */
  function _removeCollectionOwner(address _owner) internal {
    delete COLLECTION_OWNERS[_owner];
  }


  /** 
    *****************************************************
    *********** COLLECTION_CONTRACTS Functions *************
    *****************************************************
  */
  /**
    * @dev Assign a contract address to a collection
  */
  function _assignContractToCollection(address _contract, uint256 _id) internal {
    COLLECTION_CONTRACTS[_contract] = _id;
  }

  /**
    * @dev Get collection for given contract address
  */
  function _getCllectionForContract(address _contract) internal view returns (uint256) {
    return COLLECTION_CONTRACTS[_contract];
  }

  /**
    * @dev Remove collection for given contract address
  */
  function _removeContractForCollection(address _contract) internal {
    delete COLLECTION_CONTRACTS[_contract];
  }

}
