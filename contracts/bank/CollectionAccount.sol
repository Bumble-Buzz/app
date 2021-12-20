// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.4 <0.9.0;

import "hardhat/console.sol";


contract CollectionAccount {

  // modifiers
  modifier checkCollectionAccount(address _id) {
    require(_collectionAccountExists(_id), "The account for this collection does not exist");
    _;
  }

  // data structures
  struct CollectionAccountDS {
    address id; // contract address of this collection account
    // address owner; // owner of this collection account (user address)
    uint256[] reflectionVault; //reflection fewards for each token id
    uint256 incentiveVault; // collection reward vault given upon completion of market sale
  }

  mapping(address => CollectionAccountDS) private COLLECTION_ACCOUNTS; // mapping owner address to collection object


  /**
    * @dev Check if user exists
  */
  function _collectionAccountExists(address _id) private view returns (bool) {
    if (COLLECTION_ACCOUNTS[_id].id != address(0)) {
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
  function _addCollectionAccount(address _id) internal {
    COLLECTION_ACCOUNTS[_id].id = _id;
  }

  /**
    * @dev Get account of collection
  */
  function _getCollectionAccount(address _id) internal view returns (CollectionAccountDS memory) {
    return COLLECTION_ACCOUNTS[_id];
  }

  /**
    * @dev Get collections for list of users
  */
  function _getCollectionAccounts(address[] memory _ids) internal view returns (CollectionAccountDS[] memory) {
    uint256 arrLength = _ids.length;
    CollectionAccountDS[] memory collections = new CollectionAccountDS[](arrLength);
    for (uint256 i = 0; i < arrLength; i++) {
      address id = _ids[i];
      require(_collectionAccountExists(id), "An account in the list does not exist");
      CollectionAccountDS memory collection = COLLECTION_ACCOUNTS[id];
      collections[i] = collection;
    }
    return collections;
  }

  /**
    * @dev Update collection
  */
  function _updateCollectionAccount(
    address _id, uint256[] memory _reflectionVault, uint256 _incentiveVault
  ) internal {
    COLLECTION_ACCOUNTS[_id] = CollectionAccountDS({
      id: _id,
      reflectionVault: _reflectionVault,
      incentiveVault: _incentiveVault
    });
  }

  /**
    * @dev Initialize a collection reflection vault for the given collection
  */
  function _initReflectionVaultCollectionAccount(address _id, uint256 _totalSupply) internal {
    COLLECTION_ACCOUNTS[_id].reflectionVault = new uint256[](_totalSupply);
  }

  /**
    * @dev Get collection reflection vault
  */
  function _getReflectionVaultCollectionAccount(address _id) internal view returns (uint256[] memory) {
    return COLLECTION_ACCOUNTS[_id].reflectionVault;
  }

  /**
    * @dev Increase collection reflection vault
      @param _id : collection id
      @param _rewardPerItem : reward needs to be allocated to each item in this collection
  */
  function _increaseReflectionVaultCollectionAccount(address _id, uint256 _rewardPerItem) internal {
    require(COLLECTION_ACCOUNTS[_id].reflectionVault.length > 0 , "CollectionAccount: Reflection vault not initialized");
    uint256[] memory vault = COLLECTION_ACCOUNTS[_id].reflectionVault;
    for (uint256 i = 0; i < vault.length; i++) {
      uint256 currentValue = vault[i];
      vault[i] = currentValue + _rewardPerItem;
    }
    COLLECTION_ACCOUNTS[_id].reflectionVault = vault;
  }

  /**
    * @dev Get collection reflection vault index
  */
  function _getReflectionVaultIndexCollectionAccount(address _id, uint256 _index) internal view returns (uint256) {
    require(COLLECTION_ACCOUNTS[_id].reflectionVault.length > 0 , "CollectionAccount: Reflection vault not initialized");
    require(_index < COLLECTION_ACCOUNTS[_id].reflectionVault.length, "CollectionAccount: Index out of bounds");
    return COLLECTION_ACCOUNTS[_id].reflectionVault[_index];
  }

  /**
    * @dev Update collection reflection vault index
      @param _id : collection id
      @param _index : specific vault index to update
      @param _newVal : new value for a single vault index
  */
  function _updateReflectionVaultIndexCollectionAccount(address _id, uint256 _index, uint256 _newVal) internal {
    require(COLLECTION_ACCOUNTS[_id].reflectionVault.length > 0 , "CollectionAccount: Reflection vault not initialized");
    require(_index < COLLECTION_ACCOUNTS[_id].reflectionVault.length, "CollectionAccount: Index out of bounds");
    COLLECTION_ACCOUNTS[_id].reflectionVault[_index] = _newVal;
  }
  /**
    * @dev Nullify all collection reflection rewards for the given collection id
  */
  function _nullifyReflectionVaultCollectionAccount(address _id) internal {
    uint256 vaultLength = COLLECTION_ACCOUNTS[_id].reflectionVault.length;
    COLLECTION_ACCOUNTS[_id].reflectionVault = new uint256[](vaultLength);
  }

  /**
    * @dev Get collection incentive vault
  */
  function _getIncentiveVaultCollectionAccount(address _id) internal view returns (uint256) {
    return COLLECTION_ACCOUNTS[_id].incentiveVault;
  }

  /**
    * @dev Update collection incentive vault
  */
  function _updateIncentiveVaultCollectionAccount(address _id, uint256 _incentiveVault) internal {
    COLLECTION_ACCOUNTS[_id].incentiveVault = _incentiveVault;
  }

  /**
    * @dev Increase collection balance by given amounts
  */
  function _incrementCollectionAccount(
    address _id, uint256 _rewardPerItem, uint256 _incentiveVault
  ) internal {
    _increaseReflectionVaultCollectionAccount(_id, _rewardPerItem);
    COLLECTION_ACCOUNTS[_id].incentiveVault += _incentiveVault;
  }

  /**
    * @dev Nullify collection
  */
  function _nullifyCollectionAccount(address _id) internal {
    _nullifyReflectionVaultCollectionAccount(_id);
    _updateIncentiveVaultCollectionAccount(_id, 0);
  }

  /**
    * @dev Remove collection
  */
  function _removeCollectionAccount(address _id) internal {
    delete COLLECTION_ACCOUNTS[_id];
  }
}
