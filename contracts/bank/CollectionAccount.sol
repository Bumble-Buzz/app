// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.4 <0.9.0;

import "hardhat/console.sol";


contract CollectionAccount {

  // modifiers
  modifier checkCollection(address _id) {
    require(_collectionExists(_id), "The account for this collection does not exist");
    _;
  }

  // data structures
  struct CollectionDS {
    address id; // owner of these collection accounts (contract address)
    uint256[] reflectionVault; //reflection fewards for each token id
    uint256 incentiveVault; // collection reward vault given upon completion of market sale
  }

  mapping(address => CollectionDS) private COLLECTIONS; // mapping owner address to collection object


  /**
    * @dev Check if user exists
  */
  function _collectionExists(address _id) private view returns (bool) {
    if (COLLECTIONS[_id].id != address(0)) {
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
    *****************************************************
    ****************** Main Functions *******************
    *****************************************************
  */
  /**
    * @dev Add account
  */
  function _addCollection(address _id) internal {
    COLLECTIONS[_id].id = _id;
  }

  /**
    * @dev Get account of collection
  */
  function _getCollection(address _id) internal view checkCollection(_id) returns (CollectionDS memory) {
    return COLLECTIONS[_id];
  }

  /**
    * @dev Get collections for list of users
  */
  function _getCollections(address[] memory _ids) internal view returns (CollectionDS[] memory) {
    uint256 arrLength = _ids.length;
    CollectionDS[] memory collections = new CollectionDS[](arrLength);
    for (uint256 i = 0; i < arrLength; i++) {
      address id = _ids[i];
      require(_collectionExists(id), "An account in the list does not exist");
      CollectionDS memory collection = COLLECTIONS[id];
      collections[i] = collection;
    }
    return collections;
  }

  /**
    * @dev Update collection
  */
  function _updateCollection(
    address _id, uint256[] memory _reflectionVault, uint256 _incentiveVault
  ) internal checkCollection(_id) {
    COLLECTIONS[_id] = CollectionDS({
      id: _id,
      reflectionVault: _reflectionVault,
      incentiveVault: _incentiveVault
    });
  }

  /**
    * @dev Add a collection reflection vault for the given collection
  */
  function _addCollectionReflectionVault(address _id, uint256 _totalSupply) internal {
    COLLECTIONS[_id].reflectionVault = new uint256[](_totalSupply);
  }

  /**
    * @dev Get collection reflection vault
  */
  function _getCollectionReflectionVault(address _id) internal view checkCollection(_id) returns (uint256[] memory) {
    return COLLECTIONS[_id].reflectionVault;
  }

  /**
    * @dev Increase collection reflection vault
      @param _id : collection id
      @param _rewardPerItem : reward needs to be allocated to each item in this collection
  */
  function _increaseCollectionReflectionVault(address _id, uint256 _rewardPerItem) internal checkCollection(_id) {
    uint256[] memory vault = COLLECTIONS[_id].reflectionVault;
    for (uint256 i = 0; i < vault.length; i++) {
      uint256 currentValue = vault[i];
      vault[i] = currentValue + _rewardPerItem;
    }
    COLLECTIONS[_id].reflectionVault = vault;
  }

  /**
    * @dev Get collection reflection vault index
  */
  function _getCollectionReflectionVaultIndex(address _id, uint256 _index) internal view checkCollection(_id) returns (uint256) {
    return COLLECTIONS[_id].reflectionVault[_index];
  }

  /**
    * @dev Update collection reflection vault index
      @param _id : collection id
      @param _index : specific vault index to update
      @param _newVal : new value for a single vault index
  */
  function _updateCollectionReflectionVaultIndex(address _id, uint256 _index, uint256 _newVal) internal checkCollection(_id) {
    COLLECTIONS[_id].reflectionVault[_index] = _newVal;
  }
  /**
    * @dev Nullify all collection reflection rewards for the given collection id
  */
  function _nullifyCollectionReflectionVault(address _id) internal {
    uint256 vaultLength = COLLECTIONS[_id].reflectionVault.length;
    COLLECTIONS[_id].reflectionVault = new uint256[](vaultLength);
  }

  /**
    * @dev Get collection incentive vault
  */
  function _getCollectionIncentiveVault(address _id) internal view checkCollection(_id) returns (uint256) {
    return COLLECTIONS[_id].incentiveVault;
  }

  /**
    * @dev Update collection incentive vault
  */
  function _updateCollectionIncentiveVault(address _id, uint256 _incentiveVault) internal checkCollection(_id) {
    COLLECTIONS[_id].incentiveVault = _incentiveVault;
  }

  /**
    * @dev Increase collection balance by given amounts
  */
  function _incrementCollectionBalance(
    address _id, uint256 _rewardPerItem, uint256 _incentiveVault
  ) internal checkCollection(_id) {
    _increaseCollectionReflectionVault(_id, _rewardPerItem);
    COLLECTIONS[_id].incentiveVault += _incentiveVault;
  }

  /**
    * @dev Nullify collection
  */
  function _nullifyCollection(address _id) internal checkCollection(_id) {
    _nullifyCollectionReflectionVault(_id);
    _updateCollectionIncentiveVault(_id, 0);
  }

  /**
    * @dev Remove collection
  */
  function _removeCollection(address _id) internal checkCollection(_id) {
    delete COLLECTIONS[_id];
  }
}
