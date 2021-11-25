// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.4 <0.9.0;

import "./Collection.sol";
import "./Item.sol";

import "hardhat/console.sol";


contract Market is Collection, Item {

  // enums

  // data structures

  // state variables
  mapping(uint256 => uint256[]) private COLLECTION_ITEMS; // mapping collection id to list of item ids


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
  ) internal returns (uint256) {
    uint256 collectionId = _getCllectionForContract(_contractAddress);
    if (collectionId == 0) {
      // this means this is an unvarified item, so we will use the unvarified collection
      collectionId = 1; // todo use some enum / global variable instead of a number
    }

    uint8 commission = 0;
    address creator = address(0);
    COLLECTION_TYPE collectionType = _getCollectionType(collectionId);
    if (collectionType == COLLECTION_TYPE.local) {
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
  function _getItemsInCollection(uint256 _collectionId) internal view returns (ItemDS[] memory) {
    uint256[] memory itemsIds = _getItemIdsInCollection(_collectionId);
    return _getItems(itemsIds);
  }

  /**
    * @dev Mark item sold in collection
  */
  function _markItemSoldInCollection(uint256 _id, uint256 _itemId) internal {
    _markItemSold(_itemId);
    _removeItemIdInCollection(_id, _itemId);
  }





  /**
    * @dev Add item to collection
  */
  function _addItemToCollection2(
    uint256 _tokenId, address _contractAddress, address _seller, address _buyer, uint256 _price, uint8 _commission, address _creator
  ) internal returns (uint256) {
    uint256 collectionId = _getCllectionForContract(_contractAddress);
    if (collectionId == 0) {
      // this means this is an unvarified item, so we will use the unvarified collection
      collectionId = 1; // todo use some enum / global variable instead of a number
    }
    uint256 itemId = _addItem(
                        collectionId,
                        _tokenId,
                        _contractAddress,
                        _seller,
                        _buyer,
                        _price,
                        _commission,
                        _creator
                      );
    _addItemIdInCollection(collectionId, itemId);
    return itemId;
  }


  /** 
    *****************************************************
    *********** COLLECTION_ITEMS Functions *************
    *****************************************************
  */
  /**
    * @dev Add a new collection id (if necessary) and add item id to the array
  */
  function _addItemIdInCollection(uint256 _id, uint256 _itemId) internal {
    COLLECTION_ITEMS[_id].push(_itemId);
  }

  /**
    * @dev Get item ids for the given collection
  */
  function _getItemIdsInCollection(uint256 _id) internal view returns (uint256[] memory) {
    return COLLECTION_ITEMS[_id];
  }

  /**
    * @dev Remove an item in collection
  */
  function _removeItemIdInCollection(uint256 _id, uint256 _itemId) internal {
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
  function _removeCollectionItem(uint256 _id) internal {
    delete COLLECTION_ITEMS[_id];
  }

}
