// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.4 <0.9.0;

import "./UserAccount.sol";
import "./CollectionAccount.sol";
import "./Vault.sol";
import "hardhat/console.sol";


contract Bank is UserAccount, CollectionAccount, Vault {

  // modifiers
  modifier checkBank(address _id) {
    require(_bankExists(_id), "The bank for this user does not exist");
    _;
  }

  // data structures
  struct BankDS {
    address id; // owner of this bank account
    UserAccountDS accounts; // bank accounts
    CollectionAccountDS collection; // collection accounts
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
  function _addBank(address _id) internal {
    if (_isBankOwnerUnique(_id)) {
      _addBankOwner(_id);
      _addUserAccount(_id);
      _addCollectionAccount(_id);
      _addVault(_id);
    }
  }

  /**
    * @dev Get bank for given user
  */
  function _getBank(address _id) internal view checkBank(_id) returns (BankDS memory) {
    BankDS memory bank = BankDS({
      id: _id,
      accounts: _getUserAccount(_id),
      collection: _getCollectionAccount(_id),
      vault: _getVault(_id)
    });
    return bank;
  }

  // /**
  //   * @dev Get bank account
  // */
  // function _getBankAccount(address _id) internal view checkBank(_id) returns (UserAccountDS memory) {
  //   return _getUserAccount(_id);
  // }

  // /**
  //   * @dev Get bank collection account
  // */
  // function _getBankCollectionAccount(address _id) internal view checkBank(_id) returns (CollectionAccountDS memory) {
  //   return _getCollectionAccount(_id);
  // }

  // /**
  //   * @dev Get bank vault
  // */
  // function _getBankVault(address _id) internal view checkBank(_id) returns (VaultDS memory) {
  //   return _getVault(_id);
  // }

  /**
    * @dev Get banks for list of users
  */
  function _getBanks(address[] memory _ids) internal view returns (BankDS[] memory) {
    uint256 arrLength = _ids.length;
    BankDS[] memory banks = new BankDS[](arrLength);
    for (uint256 i = 0; i < arrLength; i++) {
      address id = _ids[i];
      // ensure bank id is valid. If not, kill transaction
      require(_bankExists(id), "A user in the list does not own a bank");
      BankDS memory bank = BankDS({
        id: id,
        accounts: _getUserAccount(id),
        collection: _getCollectionAccount(id),
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
    address _id, uint256 _general, uint256 _nftCommission, uint256 _collectionCommission,
    uint256[] memory _reflectionVault, uint256 _incentiveVault, uint256 _balance
  ) internal checkBank(_id) {
    _updateUserAccount(_id, _general, _nftCommission, _collectionCommission);
    _updateCollectionAccount(_id, _reflectionVault, _incentiveVault);
    _updateVault(_id, _balance);
  }

  // /**
  //   * @dev Update bank account
  // */
  // function _updateBankAccount(
  //   address _id, uint256 _general, uint256 _nftCommission, uint256 _collectionCommission
  // ) internal checkBank(_id) {
  //   _updateUserAccount(_id, _general, _nftCommission, _collectionCommission);
  // }

  // /**
  //   * @dev Update bank collection account
  // */
  // function _updateBankCollectionAccount(
  //   address _id, uint256[] memory _reflectionVault, uint256 _incentiveVault
  // ) internal checkBank(_id) {
  //   _updateCollectionAccount(_id, _reflectionVault, _incentiveVault);
  // }

  // /**
  //   * @dev Increment bank account balances with given amounts 
  // */
  // function _incrementBankAccount(
  //   address _id, uint256 _general, uint256 _nftCommission, uint256 _collectionCommission
  // ) internal checkBank(_id) {
  //   _incrementUserAccount(_id, _general, _nftCommission, _collectionCommission);
  // }

  // /**
  //   * @dev Increment bank account balances with given amounts 
  // */
  // function _incrementBankCollection(
  //   address _id, uint256 _rewardPerItem, uint256 _incentiveVault
  // ) internal checkBank(_id) {
  //   _incrementCollectionAccount(_id, _rewardPerItem, _incentiveVault);
  // }

  // /**
  //   * @dev Update bank vault
  // */
  // function _updateBankVault(
  //   address _id, uint256 _balance
  // ) internal checkBank(_id) {
  //   _updateVault(_id, _balance);
  // }

  /**
    * @dev Nullify bank
  */
  function _nullifyBank(address _id) internal checkBank(_id) {
    _nullifyUserAccount(_id);
    _nullifyCollectionAccount(_id);
    _nullifyVault(_id);
  }

  /**
    * @dev Remove bank
  */
  function _removeBank(address _id) internal checkBank(_id) {
    _removeBankOwner(_id);
    _removeUserAccount(_id);
    _removeCollectionAccount(_id);
    _removeVault(_id);
  }


  /** 
    *****************************************************
    **************** Withdraw Functions *****************
    *****************************************************
  */
  /**
    * @dev Claim account general reward for this user
  */
  function _claimAccountGeneralReward(address _id) internal returns (uint256) {
    uint256 reward = _getGeneralUserAccount(_id);
    _updateGeneralUserAccount(_id, 0);
    return reward;
  }

  /**
    * @dev Claim account nft commission reward for this user
  */
  function _claimAccountNftCommissionReward(address _id) internal returns (uint256) {
    uint256 reward = _getNftCommissionUserAccount(_id);
    _updateNftCommissionUserAccount(_id, 0);
    return reward;
  }

  /**
    * @dev Claim account collection commission reward for this user
  */
  function _claimAccountCollectionCommissionReward(address _id) internal returns (uint256) {
    uint256 reward = _getCollectionCommissionUserAccount(_id);
    _updateCollectionCommissionUserAccount(_id, 0);
    return reward;
  }

  /**
    * @dev Distribute collection reflection reward
  */
  function _distributeCollectionReflectionReward(address _contractAddress, uint256 _totalSupply, uint256 _reflectionReward) internal {
    uint256 reflectionRewardPerItem = _reflectionReward / _totalSupply;
    _increaseReflectionVaultCollectionAccount(_contractAddress, reflectionRewardPerItem);
  }

  /**
    * @dev Update collection incentive reward
  */
  function _updateCollectionIncentiveReward(address _contractAddress, uint256 _value, bool _increase) internal {
    // todo caller must be admin or collection owner

    uint256 incentiveVault = _getIncentiveVaultCollectionAccount(_contractAddress);
    if (_increase) {
      uint256 newIncentiveVault = incentiveVault + _value;
      _updateIncentiveVaultCollectionAccount(_contractAddress, newIncentiveVault);
    } else {
      require(incentiveVault > _value, "Passed in value must be greater than vault balance");
      uint256 newIncentiveVault = incentiveVault - _value;
      _updateIncentiveVaultCollectionAccount(_contractAddress, newIncentiveVault);
    }
  }

  /**
    * @dev Get collection reflection token reward
  */
  function getCollectionReflectionTokenReward(uint256 _tokenId, address _contractAddress) internal view returns (uint256) {
    uint256 vaultIndex = _tokenId - 1;
    return _getReflectionVaultIndexCollectionAccount(_contractAddress, vaultIndex);
  }

  /**
    * @dev Update collection reflection reward for item from vault
    * @custom:return-type private
  */
  function _updateCollectionReflectionTokenReward(uint256 _tokenId, address _contractAddress, uint256 _newVal) internal {
    uint256 vaultIndex = _tokenId - 1;
    _updateReflectionVaultIndexCollectionAccount(_contractAddress, vaultIndex, _newVal);
  }


  /** 
    *****************************************************
    ************* BANK_OWNERS Functions ***************
    *****************************************************
  */
  /**
    * @dev Add bank owner
  */
  function _addBankOwner(address _id) internal {
    BANK_OWNERS.push(_id);
  }

  /**
    * @dev Get bank owners
  */
  function _getBankOwners() internal view returns (address[] memory) {
    return BANK_OWNERS;
  }

  /**
    * @dev Does bank owner already exist in the mapping?
  */
  function _isBankOwnerUnique(address _id) internal view returns (bool) {
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
  function _removeBankOwner(address _id) internal checkBank(_id) {
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
