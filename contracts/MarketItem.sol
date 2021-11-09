// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.4 <0.9.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";


contract MarketItem {
  using Counters for Counters.Counter;

  // modifiers
  modifier checkItem(uint256 _id) {
    require(_itemExists(_id), "The item does not exist");
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
  enum SALE_TYPE { direct, fixed_price, auction }

  // data structures
  struct ItemDS {
    uint256 id; // unique item id
    uint256 collectionId; // collection id associated with this item
    uint256 tokenId; // unique token id of the item
    address contractAddress;
    address seller; // address of the seller / current owner
    address buyer; // address of the buyer / next owner (empty if not yet bought)
    uint256 price; // price of the item
    uint8 commission; // in percentage
    address creator; // original creator of the item
    SALE_TYPE saleType; // type of the sale for the item
    bool sold;
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
  Counters.Counter private ITEM_ID_POINTER; // tracks total number of items
  uint256[] ITEMS_ON_SALE;
  mapping(uint256 => ItemDS) private ITEMS; // mapping item id to market item
  mapping(address => uint256[]) private ITEM_OWNERS; // mapping item owner to item ids


  /**
    * @dev Check if item exists
  */
  function _itemExists(uint256 _id) private view returns (bool) {
    if (ITEMS[_id].id != 0) {
      return true;
    }
    return false;
  }

  /**
    * @dev Add empty item
  */
  function _addEmptyItem() public {
    ITEM_ID_POINTER.increment();
    uint256 id = ITEM_ID_POINTER.current();
    ITEMS[id].id = id;
    ITEMS_ON_SALE.push(id);
  }

  /**
    * @dev Add item to put up for sale
  */
  function _addItem(
    uint256 _collectionId, uint256 _tokenId, address _contractAddress, address _seller, uint256 _price, uint8 _commission, address _creator, SALE_TYPE saleType
  ) public {
    ITEM_ID_POINTER.increment();
    uint256 id = ITEM_ID_POINTER.current();
    ITEMS[id] = ItemDS({
      id: id,
      collectionId: _collectionId,
      tokenId: _tokenId,
      contractAddress: _contractAddress,
      seller: _seller,
      buyer: address(0),
      price: _price,
      commission: _commission,
      creator: _creator,
      saleType: saleType,
      sold: false
    });
    ITEMS_ON_SALE.push(id);
  }

  /**
    * @dev Get item
  */
  function _getItem(uint256 _id) public view checkItem(_id) returns (ItemDS memory) {
    ItemDS memory item = ITEMS[_id];
    return item;
  }

  /**
    * @dev Get all items
  */
  function _getAllItems() public view returns (ItemDS[] memory) {
    uint256 arrLength = ITEMS_ON_SALE.length;
    ItemDS[] memory items = new ItemDS[](arrLength);
    for (uint256 i = 0; i < arrLength; i++) {
      uint256 id = ITEMS_ON_SALE[i];
      ItemDS memory item = ITEMS[id];
      items[i] = item;
    }
    return items;
  }

  /**
    * @dev Get item ids
  */
  function _getItemIds() public view returns (uint256[] memory) {
    return ITEMS_ON_SALE;
  }

  /**
    * @dev Remove item id
  */
  function _removeItemId(uint256 _id) private checkItem(_id) {
    uint256 arrLength = ITEMS_ON_SALE.length - 1;
    uint256[] memory data = new uint256[](arrLength);
    uint8 dataCounter = 0;
    for (uint256 i = 0; i < ITEMS_ON_SALE.length; i++) {
      if (ITEMS_ON_SALE[i] != _id) {
        data[dataCounter] = ITEMS_ON_SALE[i];
        dataCounter++;
      }
    }
    ITEMS_ON_SALE = data;
  }

  /**
    * @dev Update item
  */
  function _updateItem(
    uint256 _id, uint256 _collectionId, uint256 _tokenId, address _contractAddress, address _seller, address _buyer, uint256 _price,
    uint8 _commission, address _creator, SALE_TYPE _saleType, bool _sold
  ) public {
    ITEMS[_id] = ItemDS({
      id: _id,
      collectionId: _collectionId,
      tokenId: _tokenId,
      contractAddress: _contractAddress,
      seller: _seller,
      buyer: _buyer,
      price: _price,
      commission: _commission,
      creator: _creator,
      saleType: _saleType,
      sold: _sold
    });
  }

  /**
    * @dev Update item collection id
  */
  function _updateItemCollectionId(uint256 _id, uint256 _collectionId) public {
    ITEMS[_id].collectionId = _collectionId;
  }

  /**
    * @dev Update item token id
  */
  function _updateItemTokenId(uint256 _id, uint256 _tokenId) public {
    ITEMS[_id].tokenId = _tokenId;
  }

  /**
    * @dev Update item contract address
  */
  function _updateItemContractAddress(uint256 _id, address _contractAddress) public {
    ITEMS[_id].contractAddress = _contractAddress;
  }

  /**
    * @dev Update item seller
  */
  function _updateItemSeller(uint256 _id, address _seller) public {
    ITEMS[_id].seller = _seller;
  }

  /**
    * @dev Update item buyer
  */
  function _updateItemBuyer(uint256 _id, address _buyer) public {
    ITEMS[_id].buyer = _buyer;
  }

  /**
    * @dev Update item price
  */
  function _updateItemPrice(uint256 _id, uint256 _price) public {
    ITEMS[_id].price = _price;
  }

  /**
    * @dev Update item commission
  */
  function _updateItemCommission(uint256 _id, uint8 _commission) public {
    ITEMS[_id].commission = _commission;
  }

  /**
    * @dev Update item creator
  */
  function _updateItemCreator(uint256 _id, address _creator) public {
    ITEMS[_id].creator = _creator;
  }

  /**
    * @dev Update item sale type
  */
  function _updateItemSaleType(uint256 _id, SALE_TYPE _saleType) public {
    ITEMS[_id].saleType = _saleType;
  }

  /**
    * @dev Update item sold boolean
  */
  function _updateItemSold(uint256 _id, bool _sold) public {
    ITEMS[_id].sold = _sold;
  }

  /**
    * @dev Remove item give the item id
  */
  function _removeItem(uint256 _id) public {
    _removeItemId(_id);
    delete ITEMS[_id];
  }

}
