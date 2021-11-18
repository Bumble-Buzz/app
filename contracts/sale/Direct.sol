// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.4 <0.9.0;

import "hardhat/console.sol";


contract Direct {

  // enums

  // data structures
  struct DirectDS {
    address id; // owner of this item
    uint256 itemId; // unique item id for this sale
    bool active; // true by default
  }

  // state variables
  mapping(address => DirectDS[]) private DIRECT_SALES; // mapping owner to direct sale items


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
    * @dev Create direct sale
  */
  function _createDirectSale(address _id, uint256 _itemId) public {
    DirectDS memory sale = DirectDS({
      id: _id,
      itemId: _itemId,
      active: true
    });
    DIRECT_SALES[_id].push(sale);
  }

  /**
    * @dev Get all direct item ids for user
  */
  function _getDirectSaleItemIds(address _id) public view returns (uint256[] memory) {
    uint256 arrLength = DIRECT_SALES[_id].length;
    uint256[] memory data = new uint256[](arrLength);
    uint8 dataCounter = 0;
    for (uint256 i = 0; i < arrLength; i++) {
      data[dataCounter] = DIRECT_SALES[_id].id;
      dataCounter++;
    }
    return data;
  }

  /**
    * @dev Get all direct items for user
  */
  function _getDirectSaleItems(address _id) public view returns (DirectDS[] memory) {
    return DIRECT_SALES[_id];
  }

  /**
    * @dev Get number of direct sales for user
  */
  function _getDirectSaleCount(address _id) public view returns (uint256) {
    return DIRECT_SALES[_id].length;
  }

  /**
    * @dev If a given direct sale item active
  */
  function _isDirectSaleItemActive(address _id, uint256 _itemId) public returns (bool) {
    return DIRECT_SALES[_id].active;
  }

  /**
    * @dev Does direct sale exist for user
    * @todo Probably better to get this info from MarketItem
  */
  function _doesDirectSaleExist(address _id, uint256 _itemId) public returns (bool) {
    uint256 saleCount = DIRECT_SALES[_id].length;
    for (uint256 i = 0; i < saleCount; i++) {
      if (DIRECT_SALES[_id][i].itemId == _itemId) {
        return true;
      }
    }
    return false;
  }

  /**
    * @dev Remove direct item
  */
  function _removeItemId(address _id, uint256 _itemId) internal checkItem(_id) {
    DirectDS[] memory items = DIRECT_SALES[_id];
    uint256 arrLength = items.length - 1;
    DirectDS[] memory data = new DirectDS[](arrLength);
    uint8 dataCounter = 0; 
    for (uint256 i = 0; i < items.length; i++) {
      if (items[i].itemId != _itemId) {
        data[dataCounter] = items[i];
        dataCounter++;
      }
    }
    DIRECT_SALES[_id] = data;
  }

}
