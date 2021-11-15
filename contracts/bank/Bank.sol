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
    AccountDS accounts; // bank accounts
    VaultDS vault; // bank vault
  }

  address[] private BANK_OWNERS; // current list of bank holders


  /**
    * @dev Check if bank exists
  */
  function _bankExists(address _id) private view returns (bool) {
    for (uint256 i = 0; i < BANK_OWNERS.length; i++) {
      if (BANK_OWNERS[i] == _id) {
        return true;
      }
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
    * @dev Add bank
  */
  function _addBank(address _id) public {
    _addBankOwner(_id);
    _addAccount(_id);
    _addVault(_id);
  }

  /**
    * @dev Get bank all ids
  */
  function _getBankIds() public view returns (address[] memory) {
    return BANK_OWNERS;
  }

  /**
    * @dev Get bank
  */
  function _getBank(address _id) public view checkBank(_id) returns (BankDS memory) {
    BankDS memory bank = BankDS({
      id: _id,
      accounts: _getAccount(_id),
      vault: _getVault(_id)
    });
    return bank;
  }
  // function _getBank(address _id) public view checkBank(_id) returns (AccountDS memory, VaultDS memory) {
  //   return (_getAccount(_id), _getVault(_id));
  // }

  /**
    * @dev Get banks
  */
  function _getBanks(address[] memory _ids) public view returns (BankDS[] memory) {
    uint256 arrLength = _ids.length;
    BankDS[] memory banks = new BankDS[](arrLength);
    for (uint256 i = 0; i < arrLength; i++) {
      address id = _ids[i];
      // ensure bank id is valid. If not, kill transaction
      require(_bankExists(id), "A user in the list does not own a bank");
      BankDS memory bank = BankDS({
        id: id,
        accounts: _getAccount(id),
        vault: _getVault(id)
      });
      banks[i] = bank;
    }
    return banks;
  }

  /**
    * @dev Update bank 
  */
  function _updateBank(
    address _id, uint256 _general, uint256 _commission, uint256 _reflection, uint256 _collectionCommission, uint256 _balance
  ) public checkBank(_id) {
    _updateBankAccount(_id, _general, _commission, _reflection, _collectionCommission);
    _updateBankVault(_id, _balance);
  }

  /**
    * @dev Update bank account
  */
  function _updateBankAccount(
    address _id, uint256 _general, uint256 _commission, uint256 _reflection, uint256 _collectionCommission
  ) public checkBank(_id) {
    _updateAccount(_id, _general, _commission, _reflection, _collectionCommission);
  }

  /**
    * @dev Update bank vault
  */
  function _updateBankVault(
    address _id, uint256 _balance
  ) public checkBank(_id) {
    _updateVault(_id, _balance);
  }

  /**
    * @dev Nullify bank
  */
  function _nullifyBank(address _id) public checkBank(_id) {
    _updateBankAccount(_id, 0, 0, 0, 0);
    _updateBankVault(_id, 0);
  }

  /**
    * @dev Remove bank
  */
  function _removeBank(address _id) public checkBank(_id) {
    _removeBankOwner(_id);
    _removeAccount(_id);
    _removeVault(_id);
  }


  /** 
    *****************************************************
    ************* BANK_OWNERS Functions ***************
    *****************************************************
  */
  /**
    * @dev Add bank owner
  */
  function _addBankOwner(address _id) public {
    BANK_OWNERS.push(_id);
  }

  /**
    * @dev Get bank owner
  */
  function _getBankOwner() public view returns (address[] memory) {
    return BANK_OWNERS;
  }

  /**
    * @dev Does bank owner already exist in the mapping?
  */
  function _isBankOwnerUnique(address _id) public view returns (bool) {
    for (uint256 i = 0; i < BANK_OWNERS.length; i++) {
      if (BANK_OWNERS[i] == _id) {
        return false;
      }
    }
    return true;
  }

  /**
    * @dev Remove bank owner
  */
  function _removeBankOwner(address _id) public checkBank(_id) {
    uint256 arrLength = BANK_OWNERS.length - 1;
    address[] memory data = new address[](arrLength);
    uint8 dataCounter = 0;
    for (uint256 i = 0; i < BANK_OWNERS.length; i++) {
      if (BANK_OWNERS[i] != _id) {
        data[dataCounter] = BANK_OWNERS[i];
        dataCounter++;
      }
    }
    BANK_OWNERS = data;
  }
}
