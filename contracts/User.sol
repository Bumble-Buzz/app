// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.4 <0.9.0;

import "@openzeppelin/contracts/utils/Counters.sol";

import "hardhat/console.sol";


contract User {
  using Counters for Counters.Counter;

  // modifiers
  modifier checkUser(address _user) {
    require(_exists(_user), "The user does not exist");
    // if (!_exists(_user)) {
    //   _addUser(_user);
    // }
    _;
  }

  // data structures
  struct UserDS {
    address id; // address of the user
    uint256[] itemsOnSale;
    Counters.Counter totalItemsSold;
    Counters.Counter totalItemsBought;
  }

  mapping(address => UserDS) private USERS;


  /**
    * @dev Check if user exists
  */
  function _exists(address _user) private view returns (bool) {
    if (USERS[_user].id != address(0)) {
      return true;
    }
    return false;
  }

  /**
    * @dev Add a new user
  */
  function addUser(address _user) public {
    USERS[_user].id = _user;
  }

  /**
    * @dev Get all the items that are on sale for this user
  */
  function getItemsOnSale(address _user) public view checkUser(_user) returns (uint256[] memory) {
    return USERS[_user].itemsOnSale;
  }

  /**
    * @dev Get total number of items on sale for this user
  */
  function getTotalItemsOnSale(address _user) public view checkUser(_user) returns (uint256) {
    return USERS[_user].itemsOnSale.length;
  }

  /**
    * @dev Add a new item for sale for this user
  */
  function addItemOnSale(address _user, uint256 _item) public checkUser(_user) {
    USERS[_user].itemsOnSale.push(_item);
  }

  /**
    * @dev Remove an item from sale for this user
  */
  function removeItemOnSale(address _user, uint256 _item) public checkUser(_user) {
    uint256 arrLength = USERS[_user].itemsOnSale.length - 1;
    uint256[] memory data = new uint256[](arrLength);
    uint8 dataCounter = 0;
    for (uint256 i = 0; i < USERS[_user].itemsOnSale.length; i++) {
      if (USERS[_user].itemsOnSale[i] != _item) {
        data[dataCounter] = USERS[_user].itemsOnSale[i];
        dataCounter++;
      }
    }

    USERS[_user].itemsOnSale = data;
  }

  /**
    * @dev Get total number of items sold by this user
  */
  function getTotalItemsSold(address _user) public view checkUser(_user) returns (Counters.Counter memory) {
    return USERS[_user].totalItemsSold;
  }

  /**
    * @dev Increment total number of items sold by this user
  */
  function incrementTotalItemsSold(address _user) internal checkUser(_user) {
    USERS[_user].totalItemsSold.increment();
  }

  /**
    * @dev Get total number of items bought by this user
  */
  function getTotalItemsBought(address _user) public view checkUser(_user) returns (Counters.Counter memory) {
    return USERS[_user].totalItemsBought;
  }

  /**
    * @dev Increment total number of items bought by this user
  */
  function incrementTotalItemsBought(address _user) internal checkUser(_user) {
    USERS[_user].totalItemsBought.increment();
  }

}
