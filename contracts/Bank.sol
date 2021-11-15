// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.4 <0.9.0;

import "./Account.sol";
import "./Vault.sol";
import "hardhat/console.sol";


contract Bank is Account, Vault {

  // modifiers
  modifier checkBank(address _id) {
    require(_bankExists(_id), "The bank for this user does not exist");
    _;
  }

  // data structures
  struct BankDS {
    address id; // owner of this bank account
  }

  mapping(address => BankDS) private BANKS; // mapping owner address to bank object


  /**
    * @dev Check if user exists
  */
  function _bankExists(address _id) private view returns (bool) {
    if (BANKS[_id].id != address(0)) {
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
}
