// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.4 <0.9.0;

import "./Direct.sol";
import "./Immediate.sol";
import "./Auction.sol";

import "hardhat/console.sol";


contract Sale is Direct, Immediate, Auction {

  // modifiers
  modifier checkSale(uint256 _id) {
    require(_saleExists(_id), "The sale does not exist");
    _;
  }

  // enums
  // @todo MarketItem has a SALE_TYPE enum. Either rename that one or remove it from there
  enum SALE_TYPE_2 { direct, immediate, auction }

  // data structures
  struct SaleUserDS {
    address id; // owner of these sale items
    uint256[] direct; // direct sales
    uint256[] immediate; // immediate sales
    uint256[] auction; // auction sales
  }

  struct SaleTotalDS {
    uint256[] direct;
    uint256[] immediate;
    uint256[] auction;
  }

  struct SaleDS {
    uint256 id; // unique item id
    SALE_TYPE_2 saleType; // type of the sale for the item
  }

  uint256[] private SALE_ITEMS; // current list of total items on sale
  mapping(uint256 => SaleDS) private SALES; // mapping item id to items on sale


  /**
    * @dev Check if sale exists
  */
  function _saleExists(uint256 _id) private view returns (bool) {
    if (SALES[_id].id != 0) {
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
    * @dev Create empty sale
  */
  function _createEmptySale(uint256 _id) public {
    require(!_saleExists(_id), "Sale already exists");
    SALES[_id].id = _id;
    _addTotalSaleItemId(_id);
  }

  /**
    * @dev Create direct sale
  */
  function _createSaleDirect(uint256 _id, address _owner) public {
    require(!_saleExists(_id), "Sale already exists - Direct");
    SALES[_id] = SaleDS({
      id: _id,
      saleType: SALE_TYPE_2.direct
    });

    _addTotalSaleItemId(_id);
    _createDirectSale(_owner, _id);
  }

  /**
    * @dev Create immediate sale
  */
  function _createSaleImmediate(uint256 _id, address _owner) public {
    require(!_saleExists(_id), "Sale already exists - Immediate");
    SALES[_id] = SaleDS({
      id: _id,
      saleType: SALE_TYPE_2.immediate
    });

    _addTotalSaleItemId(_id);
    _createImmediateSale(_owner, _id);
  }

  /**
    * @dev Create auction sale
  */
  function _createSaleAuction(uint256 _id, address _owner) public {
    require(!_saleExists(_id), "Sale already exists - Auction");
    SALES[_id] = SaleDS({
      id: _id,
      saleType: SALE_TYPE_2.auction
    });

    _addTotalSaleItemId(_id);
    _createAuctionSale(_owner, _id);
  }

  /**
    * @dev Create sale
  */
  function _createSale(uint256 _id, address _owner, SALE_TYPE_2 _saleType) public {
    require(!_saleExists(_id), "Sale already exists");
    if (_saleType == SALE_TYPE_2.direct) {
      _createSaleDirect(_id, _owner);
    } else if (_saleType == SALE_TYPE_2.immediate) {
      _createSaleImmediate(_id, _owner);
    } else if (_saleType == SALE_TYPE_2.auction) {
      _createSaleAuction(_id, _owner);
    }
  }

  /**
    * @dev Is direct sale valid
  */
  function _isDirectSaleValid(uint256 _id, address _owner) public view checkSale(_id) returns (bool) {
    return _doesDirectSaleItemIdExists(_owner, _id);
  } 

  /**
    * @dev Is immediate sale valid
  */
  function _isImmediateSaleValid(uint256 _id, address _owner) public view checkSale(_id) returns (bool) {
    return _doesImmediateSaleItemIdExists(_owner, _id);
  }

  /**
    * @dev Is auction sale valid
  */
  function _isAuctionSaleValid(uint256 _id, address _owner) public view checkSale(_id) returns (bool) {
    return _doesAuctionSaleItemIdExists(_owner, _id);
  }

  /**
    * @dev Is sale valid
  */
  function _isSaleValid(uint256 _id) public view returns (bool) {
    return _saleExists(_id);
  }

  /**
    * @dev Get all direct sales
  */
  function _getAllDirectSales() public view returns (uint256[] memory) {
    return _getTotalDirectSaleItemIds();
  }

  /**
    * @dev Get all immediate sales
  */
  function _getAllImmediateSales() public view returns (uint256[] memory) {
    return _getTotalImmediateSaleItemIds();
  }

  /**
    * @dev Get all auction sales
  */
  function _getAllAuctionSales() public view returns (uint256[] memory) {
    return _getTotalAuctionSaleItemIds();
  }

  /**
    * @dev Get all sales
  */
  function _getAllSales() public view returns (SaleTotalDS memory) {
    SaleTotalDS memory sale = SaleTotalDS({
      direct: _getTotalDirectSaleItemIds(),
      immediate: _getTotalImmediateSaleItemIds(),
      auction: _getTotalAuctionSaleItemIds()
    });
    return sale;
  }

  /**
    * @dev Get direct sales for user
  */
  function _getDirectSalesForUser(address _id) public view returns (uint256[] memory) {
    // SaleUserDS memory sale = SaleUserDS({
    //   id: _id,
    //   direct: _getDirectSaleItemIds(_id),
    //   immediate: new uint256[](0),
    //   auction: new uint256[](0)
    // });
    // return sale;
    return _getDirectSaleItemIds(_id);
  }

  /**
    * @dev Get immediate sales for user
  */
  function _getImmediateSalesForUser(address _id) public view returns (uint256[] memory) {
    return _getImmediateSaleItemIds(_id);
  }

  /**
    * @dev Get auction sales for user
  */
  function _getAuctionSalesForUser(address _id) public view returns (uint256[] memory) {
    return _getAuctionSaleItemIds(_id);
  }

  /**
    * @dev Get sales for user
  */
  function _getSalesForUser(address _id) public view returns (SaleUserDS memory) {
    SaleUserDS memory sale = SaleUserDS({
      id: _id,
      direct: _getDirectSaleItemIds(_id),
      immediate: _getImmediateSaleItemIds(_id),
      auction: _getAuctionSaleItemIds(_id)
    });
    return sale;
  }

  /**
    * @dev Get sales for users
  */
  function _getSalesForUsers(address[] memory _ids) public view returns (SaleUserDS[] memory) {
    uint256 arrLength = _ids.length;
    SaleUserDS[] memory sales = new SaleUserDS[](arrLength);
    for (uint256 i = 0; i < arrLength; i++) {
      address id = _ids[i];
      SaleUserDS memory sale = SaleUserDS({
        id: id,
        direct: _getDirectSaleItemIds(id),
        immediate: _getImmediateSaleItemIds(id),
        auction: _getAuctionSaleItemIds(id)
    });
      sales[i] = sale;
    }
    return sales;
  }

  /**
    * @dev Remove sale for user
  */
  function _removeSale(uint256 _id, address _owner) public checkSale(_id) {
    SALE_TYPE_2 saleType = SALES[_id].saleType;
    if (saleType == SALE_TYPE_2.direct) {
      _removeDirectSale(_owner, _id);
    } else if (saleType == SALE_TYPE_2.immediate) {
      _removeImmediateSale(_owner, _id);
    } else if (saleType == SALE_TYPE_2.auction) {
      _removeAuctionSale(_owner, _id);
    }
    _removeTotalSaleItemId(_id);
    delete SALES[_id];
  }


  /** 
    *****************************************************
    ************* SALE_ITEMS Functions ***************
    *****************************************************
  */
  /**
    * @dev Add total sale item
  */
  function _addTotalSaleItemId(uint256 _id) public {
    SALE_ITEMS.push(_id);
  }

  /**
    * @dev Get total sale item ids
  */
  function _getTotalSaleItemIds() public view returns (uint256[] memory) {
    return SALE_ITEMS;
  }

  /**
    * @dev Remove total sale item id
  */
  function _removeTotalSaleItemId(uint256 _id) public checkSale(_id) {
    uint256 arrLength = SALE_ITEMS.length - 1;
    uint256[] memory data = new uint256[](arrLength);
    uint8 dataCounter = 0;
    for (uint256 i = 0; i < SALE_ITEMS.length; i++) {
      if (SALE_ITEMS[i] != _id) {
        data[dataCounter] = SALE_ITEMS[i];
        dataCounter++;
      }
    }
    SALE_ITEMS = data;
  }

}
