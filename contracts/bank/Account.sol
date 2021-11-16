// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.4 <0.9.0;

import "hardhat/console.sol";


contract Account {

  // modifiers
  modifier checkAccount(address _id) {
    require(_accountExists(_id), "The account for this user does not exist");
    _;
  }

  // data structures
  struct AccountDS {
    address id; // owner of these accounts
    uint256 general; // any general reward balance
    uint256 commission; // commission reward balance from the item
    uint256 reflection; // reflection reward balance from the collection
    uint256 collectionCommission; // commission reward balance from the collection
  }

  mapping(address => AccountDS) private ACCOUNTS; // mapping owner address to account object


  /**
    * @dev Check if user exists
  */
  function _accountExists(address _id) private view returns (bool) {
    if (ACCOUNTS[_id].id != address(0)) {
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
    * @dev Add account
  */
  function _addAccount(address _id) internal {
    ACCOUNTS[_id].id = _id;
  }

  /**
    * @dev Get account of user
  */
  function _getAccount(address _id) internal view checkAccount(_id) returns (AccountDS memory) {
    return ACCOUNTS[_id];
  }

  /**
    * @dev Get accounts for list of users
  */
  function _getAccounts(address[] memory _ids) internal view returns (AccountDS[] memory) {
    uint256 arrLength = _ids.length;
    AccountDS[] memory accounts = new AccountDS[](arrLength);
    for (uint256 i = 0; i < arrLength; i++) {
      address id = _ids[i];
      require(_accountExists(id), "An account in the list does not exist");
      AccountDS memory account = ACCOUNTS[id];
      accounts[i] = account;
    }
    return accounts;
  }

  /**
    * @dev Update account
  */
  function _updateAccount(
    address _id, uint256 _general, uint256 _commission, uint256 _reflection, uint256 _collectionCommission
  ) internal checkAccount(_id) {
    ACCOUNTS[_id] = AccountDS({
      id: _id,
      general: _general,
      commission: _commission,
      reflection: _reflection,
      collectionCommission: _collectionCommission
    });
  }

  /**
    * @dev Get general account
  */
  function _getGeneralAccount(address _id) internal view checkAccount(_id) returns (uint256) {
    return ACCOUNTS[_id].general;
  }

  /**
    * @dev Update general account
  */
  function _updateGeneralAccount(address _id, uint256 _general) internal checkAccount(_id) {
    ACCOUNTS[_id].general = _general;
  }

  /**
    * @dev Get commission account
  */
  function _getCommissionAccount(address _id) internal view checkAccount(_id) returns (uint256) {
    return ACCOUNTS[_id].commission;
  }

  /**
    * @dev Update commission account
  */
  function _updateCommissionAccount(address _id, uint256 _commission) internal checkAccount(_id) {
    ACCOUNTS[_id].commission = _commission;
  }

  /**
    * @dev Get reflection account
  */
  function _getReflectionAccount(address _id) internal view checkAccount(_id) returns (uint256) {
    return ACCOUNTS[_id].reflection;
  }

  /**
    * @dev Update reflection account
  */
  function _updateReflectionAccount(address _id, uint256 _reflection) internal checkAccount(_id) {
    ACCOUNTS[_id].reflection = _reflection;
  }

  /**
    * @dev Get collection commission account
  */
  function _getCollectionCommissionAccount(address _id) internal view checkAccount(_id) returns (uint256) {
    return ACCOUNTS[_id].collectionCommission;
  }

  /**
    * @dev Update collection commission account
  */
  function _updateCollectionCommissionAccount(address _id, uint256 _collectionCommission) internal checkAccount(_id) {
    ACCOUNTS[_id].collectionCommission = _collectionCommission;
  }

  /**
    * @dev Nullify account
  */
  function _nullifyAccount(address _id) internal checkAccount(_id) {
    _updateAccount(_id, 0, 0, 0, 0);
  }

  /**
    * @dev Remove account
  */
  function _removeAccount(address _id) internal checkAccount(_id) {
    delete ACCOUNTS[_id];
  }
}
