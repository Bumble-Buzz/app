// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.4 <0.9.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";


contract User {
  using Counters for Counters.Counter;

  // modifiers
  modifier checkUser(address _id) {
    require(_userExists(_id), "The user does not exist");
    _;
  }

  // data structures
  struct UserDS {
    address id; // address of the user
    uint256 totalItemsSold;
    uint256 totalItemsBought;
  }

  address[] private USER_ADDRESSES; // current list of users
  mapping(address => UserDS) private USERS; // mapping owner address to user object


  /**
    * @dev Check if user exists
  */
  function _userExists(address _id) private view returns (bool) {
    if (USERS[_id].id != address(0)) {
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
    * @dev Add user
  */
  function _addUser(address _id) internal {
    if (_isUserAddressesUnique(_id)) {
      _addUserAddress(_id);
    }
    USERS[_id].id = _id;
  }

  /**
    * @dev Get user
  */
  function _getUser(address _id) internal view checkUser(_id) returns (UserDS memory) {
    return USERS[_id];
  }

  /**
    * @dev Get all users
  */
  function _getAllUsers() internal view returns (UserDS[] memory) {
    uint256 arrLength = USER_ADDRESSES.length;
    UserDS[] memory users = new UserDS[](arrLength);
    for (uint256 i = 0; i < arrLength; i++) {
      address id = USER_ADDRESSES[i];
      UserDS memory user = USERS[id];
      users[i] = user;
    }
    return users;
  }

  /**
    * @dev Update user
  */
  function _updateUser(
    address _id, uint256 _totalItemsSold, uint256 _totalItemsBought
  ) internal checkUser(_id) {
    USERS[_id] = UserDS({
      id: _id,
      totalItemsSold: _totalItemsSold,
      totalItemsBought: _totalItemsBought
    });
  }

  /**
    * @dev Get user total items sold
  */
  function _getUserTotalItemsSold(address _id) internal view checkUser(_id) returns (uint256) {
    return USERS[_id].totalItemsSold;
  }

  /**
    * @dev Increment user total items sold
  */
  function _incrementUserTotalItemsSold(address _id) internal checkUser(_id) {
    USERS[_id].totalItemsSold++;
  }

  /**
    * @dev Get user total items bought
  */
  function _getUserTotalItemsBought(address _id) internal view checkUser(_id) returns (uint256) {
    return USERS[_id].totalItemsBought;
  }

  /**
    * @dev Increment user total items bought
  */
  function _incrementUserTotalItemsBought(address _id) internal checkUser(_id) {
    USERS[_id].totalItemsBought++;
  }

  /**
    * @dev Remove user
  */
  function _removeUser(address _id) internal checkUser(_id) {
    _removeUserAddress(_id);
    delete USERS[_id];
  }


  /** 
    *****************************************************
    ************* USER_ADDRESSES Functions ***************
    *****************************************************
  */
  /**
    * @dev Add user address
  */
  function _addUserAddress(address _id) internal {
    USER_ADDRESSES.push(_id);
  }

  /**
    * @dev Get user addresses
  */
  function _getUserAddresses() internal view returns (address[] memory) {
    return USER_ADDRESSES;
  }

  /**
    * @dev Does user already exist in the mapping?
  */
  function _isUserAddressesUnique(address _id) internal view returns (bool) {
    for (uint256 i = 0; i < USER_ADDRESSES.length; i++) {
      if (USER_ADDRESSES[i] == _id) {
        return false;
      }
    }
    return true;
  }

  /**
    * @dev Remove user address
  */
  function _removeUserAddress(address _id) internal checkUser(_id) {
    uint256 arrLength = USER_ADDRESSES.length - 1;
    address[] memory data = new address[](arrLength);
    uint8 dataCounter = 0;
    for (uint256 i = 0; i < USER_ADDRESSES.length; i++) {
      if (USER_ADDRESSES[i] != _id) {
        data[dataCounter] = USER_ADDRESSES[i];
        dataCounter++;
      }
    }
    USER_ADDRESSES = data;
  }
}
