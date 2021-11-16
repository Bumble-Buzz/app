// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.4 <0.9.0;

import "hardhat/console.sol";


contract Vault {

  // modifiers
  modifier checkVault(address _id) {
    require(_vaultExists(_id), "The vault for this user does not exist");
    _;
  }

  // data structures
  struct VaultDS {
    address id; // owner of this vault
    uint256 balance; // any general reward balance
  }

  mapping(address => VaultDS) private VAULTS; // mapping owner address to vault object


  /**
    * @dev Check if user exists
  */
  function _vaultExists(address _id) private view returns (bool) {
    if (VAULTS[_id].id != address(0)) {
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
    * @dev Add vault
  */
  function _addVault(address _id) public {
    VAULTS[_id].id = _id;
  }

  /**
    * @dev Get vault of user
  */
  function _getVault(address _id) public view checkVault(_id) returns (VaultDS memory) {
    return VAULTS[_id];
  }

  /**
    * @dev Get vaults for list of users
  */
  function _getVaults(address[] memory _ids) public view returns (VaultDS[] memory) {
    uint256 arrLength = _ids.length;
    VaultDS[] memory vaults = new VaultDS[](arrLength);
    for (uint256 i = 0; i < arrLength; i++) {
      address id = _ids[i];
      require(_vaultExists(id), "A vault in the list does not exist");
      VaultDS memory vault = VAULTS[id];
      vaults[i] = vault;
    }
    return vaults;
  }

  /**
    * @dev Update vault
  */
  function _updateVault(address _id, uint256 _balance) public checkVault(_id) {
    VAULTS[_id] = VaultDS({
      id: _id,
      balance: _balance
    });
  }

  /**
    * @dev Get vault balance
  */
  function _getVaultBalance(address _id) public view checkVault(_id) returns (uint256) {
    return VAULTS[_id].balance;
  }

  /**
    * @dev Update vault balance
  */
  function _updateVaultBalance(address _id, uint256 _balance) public checkVault(_id) {
    VAULTS[_id].balance = _balance;
  }

  /**
    * @dev Nullify vault
  */
  function _nullifyVault(address _id) public checkVault(_id) {
    _updateVault(_id, 0);
  }

  /**
    * @dev Remove vault
  */
  function _removeVault(address _id) public checkVault(_id) {
    delete VAULTS[_id];
  }
}
