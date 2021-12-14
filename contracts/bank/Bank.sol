// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.4 <0.9.0;


// import '@openzeppelin/contracts/access/AccessControl.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import '@openzeppelin/contracts/token/ERC1155/IERC1155.sol';

import "./UserAccount.sol";
import "./CollectionAccount.sol";
import "./Vault.sol";
import "hardhat/console.sol";


contract Bank is Ownable, UserAccount, CollectionAccount, Vault {

  // Access Control
  // bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

  // modifiers
  modifier checkBank(address _id) {
    require(_bankExists(_id), "The bank for this user does not exist");
    _;
  }
  modifier checkContractValidity(address _contractAddress) {
    require(_isContractAddressValid(_contractAddress), "Provided contract address is not valid");
    _;
  }

  // data structures
  struct BankDS {
    address id; // owner of this bank account
    UserAccountDS user; // user account
    CollectionAccountDS collection; // collection account
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
    * @dev Is contract address valid ERC721 or ERC1155
  */
  function _isContractAddressValid(address _contractAddress) private view returns (bool) {
    if (
        IERC721(_contractAddress).supportsInterface(type(IERC721).interfaceId) ||
        IERC1155(_contractAddress).supportsInterface(type(IERC1155).interfaceId)
    ) {
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
    * @dev Add bank
  */
  function addBank(address _id) public onlyOwner() {
    if (isBankOwnerUnique(_id)) {
      _addBankOwner(_id);
      _addUserAccount(_id);
      _addCollectionAccount(_id);
      _addVault(_id);
    }
  }

  /**
    * @dev Get bank for given user
  */
  function getBank(address _id) public view checkBank(_id) returns (BankDS memory) {
    BankDS memory bank = BankDS({
      id: _id,
      user: _getUserAccount(_id),
      collection: _getCollectionAccount(_id),
      vault: _getVault(_id)
    });
    return bank;
  }

  /**
    * @dev Get banks for list of users
  */
  function getBanks(address[] memory _ids) public view returns (BankDS[] memory) {
    uint256 arrLength = _ids.length;
    BankDS[] memory banks = new BankDS[](arrLength);
    for (uint256 i = 0; i < arrLength; i++) {
      address id = _ids[i];
      // ensure bank id is valid. If not, kill transaction
      require(_bankExists(id), "A user in the list does not own a bank");
      BankDS memory bank = BankDS({
        id: id,
        user: _getUserAccount(id),
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
  function updateBank(
    address _id, uint256 _general, uint256 _nftCommission, uint256 _collectionCommission,
    uint256[] memory _reflectionVault, uint256 _incentiveVault, uint256 _balance
  ) public checkBank(_id) onlyOwner() {
    _updateUserAccount(_id, _general, _nftCommission, _collectionCommission);
    _updateCollectionAccount(_id, _reflectionVault, _incentiveVault);
    _updateVault(_id, _balance);
  }

  /**
    * @dev Nullify bank
    * @custom:type private
  */
  function _nullifyBank(address _id) public checkBank(_id) {
    _nullifyUserAccount(_id);
    _nullifyCollectionAccount(_id);
    _nullifyVault(_id);
  }

  /**
    * @dev Remove bank
    * @custom:type private
  */
  function _removeBank(address _id) public checkBank(_id) {
    _removeBankOwner(_id);
    _removeUserAccount(_id);
    _removeCollectionAccount(_id);
    _removeVault(_id);
  }


  /** 
    *****************************************************
    **************** Monetary Functions *****************
    *****************************************************
  */

  /**
    * @dev Increase account balance by given amounts
  */
  function incrementUserAccount(
    address _id, uint256 _general, uint256 _nftCommission, uint256 _collectionCommission
  ) external onlyOwner() {
    _incrementUserAccount(_id, _general, _nftCommission, _collectionCommission);
  }

  /**
    * @dev Increase collection balance by given amounts
  */
  function incrementCollectionAccount(
    address _id, uint256 _rewardPerItem, uint256 _incentiveVault
  ) external onlyOwner() {
    _incrementCollectionAccount(_id, _rewardPerItem, _incentiveVault);
  }

  /**
    * @dev Claim account general reward for this user
  */
  function claimGeneralRewardUserAccount(address _owner) external onlyOwner() returns (uint256) {
    uint256 reward = _getGeneralUserAccount(_owner);
    _updateGeneralUserAccount(_owner, 0);
    return reward;
  }

  /**
    * @dev Claim account nft commission reward for this user
  */
  function claimNftCommissionRewardUserAccount(address _owner) external onlyOwner() returns (uint256) {
    uint256 reward = _getNftCommissionUserAccount(_owner);
    _updateNftCommissionUserAccount(_owner, 0);
    return reward;
  }

  /**
    * @dev Claim account collection commission reward for this user
  */
  function claimCollectionCommissionRewardUserAccount(address _owner) external onlyOwner() returns (uint256) {
    uint256 reward = _getCollectionCommissionUserAccount(_owner);
    _updateCollectionCommissionUserAccount(_owner, 0);
    return reward;
  }

  /**
    * @dev Claim collection reflection reward for this token id
  */
  function claimReflectionRewardCollectionAccount(uint256 _tokenId, address _contractAddress) external onlyOwner() returns (uint256) {
    require(_tokenId > 0, "Bank: Invalid token id provided");

    uint256 vaultIndex = _tokenId - 1;
    uint256 reward = _getReflectionVaultIndexCollectionAccount(_contractAddress, vaultIndex);
    _updateReflectionVaultIndexCollectionAccount(_contractAddress, vaultIndex, 0);
    
    //  todo use tokeId to check the owner from nft contract. Compare with this owner

    // ensure contract address is a valid IERC721 or IERC1155 contract
    // require(_isContractAddressValid(_contractAddress), "Provided contract address is not valid");

    // ownerOf(_tokenId) == msg.sender then continue, else revert transaction
    // require(IERC721(_contractAddress).ownerOf(_tokenId) == msg.sender, "You are not the owner of this item");

    return reward;
  }

  /**
    * @dev Distribute collection reflection reward between all token id's
  */
  function distributeCollectionReflectionReward(address _contractAddress, uint256 _totalSupply, uint256 _reflectionReward) external onlyOwner() {
    uint256 reflectionRewardPerItem = _reflectionReward / _totalSupply;
    _increaseReflectionVaultCollectionAccount(_contractAddress, reflectionRewardPerItem);
  }

  /**
    * @dev Update collection incentive reward
  */
  function updateCollectionIncentiveReward(address _contractAddress, uint256 _value, bool _increase) external onlyOwner() returns (uint256) {
    // todo caller must be admin or collection owner

    uint256 incentiveVault = _getIncentiveVaultCollectionAccount(_contractAddress);
    if (_increase) {
      uint256 newIncentiveVault = incentiveVault + _value;
      _updateIncentiveVaultCollectionAccount(_contractAddress, newIncentiveVault);
    } else {
      require(incentiveVault >= _value, "Bank: Passed in value must be greater than vault balance");
      uint256 newIncentiveVault = incentiveVault - _value;
      _updateIncentiveVaultCollectionAccount(_contractAddress, newIncentiveVault);
    }

    return _getIncentiveVaultCollectionAccount(_contractAddress);
  }


  /** 
    *****************************************************
    ************** BANK_OWNERS Functions ****************
    *****************************************************
  */
  /**
    * @dev Add bank owner
    * @custom:type private
  */
  function _addBankOwner(address _id) public {
    BANK_OWNERS.push(_id);
  }

  /**
    * @dev Get bank owners
  */
  function getBankOwners() public view returns (address[] memory) {
    return BANK_OWNERS;
  }

  /**
    * @dev Does bank owner already exist in the mapping?
  */
  function isBankOwnerUnique(address _id) public view returns (bool) {
    for (uint256 i = 0; i < BANK_OWNERS.length; i++) {
      if (BANK_OWNERS[i] == _id) {
        return false;
      }
    }
    return true;
  }

  /**
    * @dev Remove bank owner
    * @custom:type private
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


  /** 
    *****************************************************
    ************** Expose Child Functions ***************
    *****************************************************
  */

  // UserAccount.sol
  /**
    * @dev Get account of user
  */
  function getUserAccount(address _id) external view returns (UserAccountDS memory) {
    return _getUserAccount(_id);
  }
  /**
    * @dev Get accounts for list of users
  */
  function getUserAccounts(address[] memory _ids) external view returns (UserAccountDS[] memory) {
    return _getUserAccounts(_ids);
  }

  /**
    * @dev Get general user account
  */
  function getGeneralUserAccount(address _id) external view returns (uint256) {
    return _getGeneralUserAccount(_id);
  }

  /**
    * @dev Get nft commission user account
  */
  function getNftCommissionUserAccount(address _id) external view returns (uint256) {
    return _getNftCommissionUserAccount(_id);
  }

  /**
    * @dev Get collection commission user account
  */
  function getCollectionCommissionUserAccount(address _id) external view returns (uint256) {
    return _getCollectionCommissionUserAccount(_id);
  }

  // CollectionAccount.sol
  /**
    * @dev Get account of collection
  */
  function getCollectionAccount(address _id) external view returns (CollectionAccountDS memory) {
    return _getCollectionAccount(_id);
  }

  /**
    * @dev Get collections for list of users
  */
  function getCollectionAccounts(address[] memory _ids) external view returns (CollectionAccountDS[] memory) {
    return _getCollectionAccounts(_ids);
  }

  /**
    * @dev Initialize a collection reflection vault for the given collection
  */
  function initReflectionVaultCollectionAccount(address _id, uint256 _totalSupply) external {
    return _initReflectionVaultCollectionAccount(_id, _totalSupply);
  }

  /**
    * @dev Get collection reflection vault
  */
  function getReflectionVaultCollectionAccount(address _id) external view returns (uint256[] memory) {
    return _getReflectionVaultCollectionAccount(_id);
  }

  /**
    * @dev Get collection reflection reward for this token id
  */
  function getReflectionRewardCollectionAccount(uint256 _tokenId, address _contractAddress) external view returns (uint256) {
    uint256 vaultIndex = _tokenId - 1;
    return _getReflectionVaultIndexCollectionAccount(_contractAddress, vaultIndex);
  }

  /**
    * @dev Get collection incentive vault
  */
  function getIncentiveVaultCollectionAccount(address _id) external view returns (uint256) {
    return _getIncentiveVaultCollectionAccount(_id);
  }

  // Vault.sol
  /**
    * @dev Get vault of user
  */
  function getVault(address _id) external view returns (VaultDS memory) {
    return _getVault(_id);
  }
}
