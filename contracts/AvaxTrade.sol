// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.4 <0.9.0;

import '@openzeppelin/contracts/access/Ownable.sol';
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "./User.sol";
import "./MarketCollection.sol";

import "hardhat/console.sol";


contract AvaxTrade is User, MarketCollection {
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

  // data structures
  struct BalanceSheet {
    uint256 totalFunds; // total funds in contract before deductions
    uint256 general; // outstanding general reward balance
    uint256 commission; // outstanding commission reward balance from the item
    uint256 reflection; // outstanding reflection reward balance from the collection
    uint256 collectionCommission; // outstanding commission reward balance from the collection
    uint256 reward; // outstanding reward balance, used to give incentives
    uint256 vault;  // outstanding vault balance
    uint256 availableFunds; // final funds in contract after deductions as revenue
  }

  struct Bank {
    address owner; // owner of this bank account
    uint256 general; // any general reward balance
    uint256 commission; // commission reward balance from the item
    uint256 reflection; // reflection reward balance from the collection
    uint256 collectionCommission; // commission reward balance from the collection
    uint256 vault;
  }

  // state variables
  uint256 private LISTING_PRICE = 0.0 ether; // price to list item in marketplace
  uint8 private COMMISSION = 2; // commission rate charged upon every sale, in percentage

  // monetary
  BalanceSheet private CONTRACT_BANK;
  mapping(address => Bank) private USER_BANK; // mapping collection id to collection


  constructor() {
    CONTRACT_BANK = BalanceSheet(0, 0, 0, 0, 0, 0, 0, 0);
    USER_BANK[msg.sender] = Bank(msg.sender, 0, 0, 0, 0, 0);
  }

  /**
    * @dev Create market item for sale. For a varified collection
  */
  function createMarketSale(uint256 _collectionId, uint256 _tokenId, uint256 _price, string memory _saleType) public payable {
  }
  /**
    * @dev Remove market item from sale. For a varified collection
  */
  function removeMarketSale(uint256 _collectionId, uint256 _tokenId) public {
  }

}
