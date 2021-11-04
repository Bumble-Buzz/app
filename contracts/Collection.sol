// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.4 <0.9.0;

import '@openzeppelin/contracts/access/Ownable.sol';
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "hardhat/console.sol";


contract Collection is ReentrancyGuard, Ownable {
  using Strings for uint256;
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
  enum SALE_TYPE { direct, fixed_price, auction }
  enum COLLECTION_TYPE { local, varified, unvarified }
  enum COLLECTION_STATUS { active, inactive }

  // data structures
  struct MarketItem {
    uint256 tokenId; // unique token id of the item
    address contractAddress;
    address payable seller; // address of the seller / current owner
    address payable buyer; // address of the buyer / next owner (empty if not yet bought)
    uint256 price; // price of the item
    uint8 commission; // in percentage
    address payable creator; // original creator of the item
    SALE_TYPE saleType; // type of the sale for the item
    bool sold;
  }

  struct Collection {
    uint256 id; // unique collection id
    string name; // collection name
    string tokenUri; // unique token uri of the collection
    address contractAddress; // contract address of the collection
    mapping(uint256 => MarketItem) items; // list of items the collection owns
    uint8 reflection; // in percentage
    uint8 commission; // in percentage
    address payable owner; // owner of the collection
    COLLECTION_TYPE collectitonType; // type of the collection
    COLLECTION_STATUS collectionStatus;
  }

  // state variables
  Counters.Counter private COLLECTION_SIZE; // tracks current number of collections
  uint256 private MAX_COLLECTION_SIZE = 9999; // maximum number of collections allowed
  mapping(uint256 => Collection) private COLLECTIONS; // mapping collection id to collection
  mapping(string => uint256) private COLLECTION_TOKEN_URIS; // mapping token uri to collection id
  mapping(address => uint256[]) private COLLECTION_OWNERS; // mapping collection owner to collection ids


  /**
    * @dev Create market collection
  */
  function createMarketCollection(
    string _name, string _tokenUri, uint256 _size, address _contractAddress, uint8 _reflection, uint8 _commission, address _owner
  ) public onlyOwner() {
  }
  /**
    * @dev Disable market collection using the collection id
  */
  function disableMarketCollection(uint256 _collectionId) public onlyOwner() {
  }
  /**
    * @dev Disable market collection using the token uri
  */
  function disableMarketCollection(string _tokenUri) public onlyOwner() {
  }
  /**
    * @dev Remove market collection using the collection id
  */
  function removeMarketCollection(uint256 _collectionId) public onlyOwner() {
  }
  /**
    * @dev Remove market collection using the token uri
  */
  function removeMarketCollection(string _tokenUri) public onlyOwner() {
  }

}
