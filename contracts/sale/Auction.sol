// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.4 <0.9.0;

import "hardhat/console.sol";


contract Auction {

  // enums

  // data structures
  struct AuctionDS {
    address id; // owner of this item
    uint256 itemId; // unique item id for this sale
    bool active; // true by default
  }

  // state variables
  mapping(address => AuctionDS[]) private AUCTION_SALES; // mapping owner to auction sale items


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

}
