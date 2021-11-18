// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.4 <0.9.0;

import "hardhat/console.sol";


contract Immediate {

  // enums

  // data structures
  struct ImmediateS {
    address id; // owner of this item
    uint256 itemId; // unique item id for this sale
    bool active; // true by default
  }

  // state variables
  mapping(address => ImmediateS[]) private IMMEDIATE_SALES; // mapping owner to immediate sale items


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
