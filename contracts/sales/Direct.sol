// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.4 <0.9.0;

import "hardhat/console.sol";


contract Direct {

  // enums

  // data structures
  struct DirectDS {
    address id; // owner of this item
    uint256 tokenId; // unique token id of the item
    address contractAddress; // contract address of the item
    address seller; // address of the seller / current owner
    address buyer; // address of the buyer / next owner (empty if not yet bought)
    uint256 price; // price of the item
    bool sold; // false by default
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

}
