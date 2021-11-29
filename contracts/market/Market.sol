// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.4 <0.9.0;

import "./Collection.sol";
import "./Item.sol";

import "hardhat/console.sol";


contract Market is Collection, Item {

  // modifiers
  modifier checkCollectionItem(uint256 _id) {
    require(_collectionItemExists(_id), "The collection item does not exist");
    _;
  }
  modifier checkCollectionItemId(uint256 _id, uint256 _itemId) {
    require(_collectionItemIdExists(_id, _itemId), "The collection item id does not exist");
    _;
  }

  // enums

  // data structures

  // state variables
  mapping(uint256 => uint256[]) private COLLECTION_ITEMS; // mapping collection id to list of item ids


  /**
    * @dev Check if collection item exists
  */
  function _collectionItemExists(uint256 _id) private view returns (bool) {
    if (COLLECTION_ITEMS[_id].length > 0) {
      return true;
    }
    return false;
  }

  /**
    * @dev Check if collection item id exists
  */
  function _collectionItemIdExists(uint256 _id, uint256 _itemId) private view returns (bool) {
    uint256[] memory  collectionItem = COLLECTION_ITEMS[_id];
    for (uint256 i = 0; i < collectionItem.length; i++) {
      if (collectionItem[i] == _itemId) {
        return true;
      }
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
    * @dev Add item to collection
  */
  function _addItemToCollection(
    uint256 _tokenId, address _contractAddress, address _seller, address _buyer, uint256 _price
  ) public returns (uint256) {
    uint256 collectionId = _getCllectionForContract(_contractAddress);
    if (collectionId == 0) {
      // this means this is an unvarified item, so we will use the unvarified collection
      collectionId = 1; // todo use some enum / global variable instead of a number
    }

    uint8 commission = 0;
    address creator = address(0);
    COLLECTION_TYPE collectionType = _getCollectionType(collectionId);
    if (collectionType == COLLECTION_TYPE.local) {
      // todo fetch this information from the local nvt contract
      commission = 2; // fetch commission from nft contract
      creator = address(0); // fetch creator from nft contract
    }

    uint256 itemId = _addItem(
                        collectionId,
                        _tokenId,
                        _contractAddress,
                        _seller,
                        _buyer,
                        _price,
                        commission,
                        creator
                      );
    _addItemIdInCollection(collectionId, itemId);
    return itemId;
  }

  /**
    * @dev Get all item ids in collection
  */
  function _getItemsInCollection(uint256 _id) public view checkCollectionItem(_id) returns (ItemDS[] memory) {
    uint256[] memory itemsIds = _getItemIdsInCollection(_id);
    return _getItems(itemsIds);
  }

  /**
    * @dev Cancel item that is currently on sale
  */
  function _cancelItemInCollection(uint256 _itemId, address _owner) public checkSellerIsOwner(_itemId,_owner) {
    uint256 collectionId = _getItemCollectionId(_itemId);
    require(_collectionItemIdExists(collectionId, _itemId), "Collection or item does not exist");

    _deactivateItem(_itemId);
    _removeItemIdInCollection(collectionId, _itemId);
  }

  /**
    * @dev Mark item sold in collection
  */
  function _markItemSoldInCollection(uint256 _itemId) public {
    uint256 collectionId = _getItemCollectionId(_itemId);
    require(_collectionItemIdExists(collectionId, _itemId), "Collection or item does not exist");

    _markItemSold(_itemId);
    _removeItemIdInCollection(collectionId, _itemId);
  }

  /**
    * @dev Get owner of collection
  */
  function _getOwnerOfCollection(uint256 _itemId) public view returns (address) {
    uint256 collectionId = _getItemCollectionId(_itemId);
    require(_collectionItemIdExists(collectionId, _itemId), "Collection or item does not exist");

    return _getCollectionOwner(collectionId);
  }

  /**
    * @dev Get creator of item
  */
  function _getCreatorOfItem(uint256 _itemId) public view returns (address) {
    uint256 collectionId = _getItemCollectionId(_itemId);
    require(_collectionItemIdExists(collectionId, _itemId), "Collection or item does not exist");

    return _getItemCreator(_itemId);
  }

  /**
    * @dev Calculate nft commission reward
  */
  function _calculateNftCommissionReward(uint256 _itemId, uint256 _price) public view returns (uint256) {
    uint256 collectionId = _getItemCollectionId(_itemId);
    require(_collectionItemIdExists(collectionId, _itemId), "Collection or item does not exist");

    uint8 commission = _getItemCommission(_itemId);
    if (commission > 0) {
      uint256 commissionReward = (_price * commission / 100);
      return commissionReward;
    }
    return 0;
  }

  /**
    * @dev Calculate collection commission reward
  */
  function _calculateCollectionCommissionReward(uint256 _itemId, uint256 _price) public view returns (uint256) {
    uint256 collectionId = _getItemCollectionId(_itemId);
    require(_collectionItemIdExists(collectionId, _itemId), "Collection or item does not exist");

    uint8 commission = _getCollectionCommission(collectionId);
    if (commission > 0) {
      uint256 commissionReward = (_price * commission / 100);
      return commissionReward;
    }
    return 0;
  }

  /**
    * @dev Calculate collection reflection reward
  */
  function _calculateCollectionReflectionReward(uint256 _itemId, uint256 _price) public returns (uint256) {
    uint256 collectionId = _getItemCollectionId(_itemId);
    require(_collectionItemIdExists(collectionId, _itemId), "Collection or item does not exist");

    uint8 reflection = _getCollectionReflection(collectionId);
    if (reflection > 0) {
      uint256 reflectionReward = (_price * reflection / 100);
      uint256 reflectionRewardPerItem = reflectionReward / _getCollectionTotalSupply(collectionId);
      _updateCollectionReflectionVault(collectionId, reflectionRewardPerItem);
      return reflectionReward;
    }
    return 0;
  }

  /**
    * @dev Claim collection reflection reward
  */
  function _claimCollectionReflectionReward(uint256 _itemId) public returns (uint256) {
    uint256 collectionId = _getItemCollectionId(_itemId);
    require(_collectionItemIdExists(collectionId, _itemId), "Collection or item does not exist");

    uint256 itemTokenId = _getItemTokenId(_itemId);
    uint256 vaultIndex = itemTokenId - 1;
    uint256 collectionTokenVault = _getCollectionReflectionVaultIndex(collectionId, vaultIndex);
    _updateCollectionReflectionVaultIndex(collectionId, vaultIndex, 0);
    return collectionTokenVault;
  }

  /**
    * @dev Calculate collection incentive reward
  */
  function _calculateCollectionIncentiveReward(uint256 _itemId) public returns (uint256) {
    uint256 collectionId = _getItemCollectionId(_itemId);
    require(_collectionItemIdExists(collectionId, _itemId), "Collection or item does not exist");

    uint8 incentive = _getCollectionIncentive(collectionId);
    if (incentive > 0) {
      uint256 incentiveVault = _getCollectionIncentiveVault(collectionId);
      uint256 incentiveReward = (incentiveVault * incentive / 100);
      uint256 newIncentiveVault = incentiveVault - incentiveReward;
      _updateCollectionIncentiveVault(collectionId, newIncentiveVault);
      return incentiveReward;
    }
    return 0;
  }


  /** 
    *****************************************************
    *********** COLLECTION_ITEMS Functions *************
    *****************************************************
  */
  /**
    * @dev Add a new collection id (if necessary) and add item id to the array
  */
  function _addItemIdInCollection(uint256 _id, uint256 _itemId) public {
    COLLECTION_ITEMS[_id].push(_itemId);
  }

  /**
    * @dev Get item ids for the given collection
  */
  function _getItemIdsInCollection(uint256 _id) public view returns (uint256[] memory) {
    return COLLECTION_ITEMS[_id];
  }

  /**
    * @dev Remove an item in collection
  */
  function _removeItemIdInCollection(uint256 _id, uint256 _itemId) public {
    uint256 arrLength = COLLECTION_ITEMS[_id].length - 1;
    uint256[] memory data = new uint256[](arrLength);
    uint8 dataCounter = 0;
    for (uint256 i = 0; i < COLLECTION_ITEMS[_id].length; i++) {
      if (COLLECTION_ITEMS[_id][i] != _itemId) {
        data[dataCounter] = COLLECTION_ITEMS[_id][i];
        dataCounter++;
      }
    }
    COLLECTION_ITEMS[_id] = data;
  }

  /**
    * @dev Remove the collection item
  */
  function _removeCollectionItem(uint256 _id) public {
    delete COLLECTION_ITEMS[_id];
  }

}
