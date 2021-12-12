// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.4 <0.9.0;

import '@openzeppelin/contracts/access/Ownable.sol';
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import '@openzeppelin/contracts/token/ERC1155/IERC1155.sol';

// import "./User.sol";
import "./collectionItem/CollectionItem.sol";
import "./bank/Bank.sol";
import "./sale/Sale.sol";

import "hardhat/console.sol";


contract AvaxTrade is Ownable, Sale {
  using Counters for Counters.Counter;

  /**
    * Note All calculations using percentages will truncate any decimals.
    * Instead whole numbers will be used.
    *
    * Examples: number = (num * perVar / 100);
    *   - 2% of 100 = 2
    *   - 2% of 75 = 1
    *   - 2% of 50 = 1
    *   - 2% of 20 = 0
  */

  // enums
  // enum SALE_TYPE_2 { direct, immediate, auction }

  // data structures
  struct BalanceSheetDS {
    uint256 totalFunds; // total funds in contract before deductions
    uint256 general; // outstanding general reward balance
    uint256 nftCommission; // outstanding commission reward balance from the item
    uint256 collectionReflection; // outstanding reflection reward balance from the collection
    uint256 collectionCommission; // outstanding commission reward balance from the collection
    uint256 reward; // outstanding reward balance, used to give incentives
    uint256 vault;  // outstanding vault balance
    uint256 availableFunds; // total funds in contract after deductions
  }

  struct ContractsDS {
    address bank; // address for the bank contract
    address sale; // address for the sale contract
    address collectionItem; // address for the collectionItem contract
  }

  // state variables
  uint256 private LISTING_PRICE = 0.0 ether; // price to list item in marketplace
  uint8 private MARKETPLACE_COMMISSION = 2; // commission rate charged upon every sale, in percentage

  ContractsDS private CONTRACTS;

  // monetary
  BalanceSheetDS private BALANCE_SHEET;


  constructor() {
    BALANCE_SHEET = BalanceSheetDS(0, 0, 0, 0, 0, 0, 0, 0);

    // create collections
    // CollectionItem(CONTRACTS.collectionItem).createUnvariviedCollection('Unverified');
    // @todo we should already know the contract address of the local collection
    // _createLocalCollection('Local', '', address(0));

    Bank bank = new Bank();
    CONTRACTS.bank = address(bank);
    // Sale sale = new Sale();
    // CONTRACTS.sale = address(sale);
    CollectionItem collectionItem = new CollectionItem(address(this), owner());
    CONTRACTS.collectionItem = address(collectionItem);
  }

  /**
    * @dev Calculate percent change
  */
  function _calculatePercentChange(uint256 _value, uint8 _percent) private pure returns (uint256) {
    return (_value * _percent / 100);
  }


  /** 
    *****************************************************
    ****************** Main Functions *******************
    *****************************************************
  */
  /**
    * @dev Create market sale
  */
  function createMarketSale(
    uint256 _tokenId, address _contractAddress, address _buyer, uint256 _price, SALE_TYPE_2 _saleType
  ) external {
    address buyer = address(0);
    if (_saleType == SALE_TYPE_2.direct) {
      // only use passed in buyer param when it is a direct sale
      buyer = _buyer;
    }
    uint256 itemId = CollectionItem(CONTRACTS.collectionItem).addItemToCollection(
      _tokenId,
      _contractAddress,
      msg.sender,
      buyer,
      _price
    );
    // uint256 itemId = CollectionItem(CONTRACTS.collectionItem).getItemId(_tokenId, _contractAddress, msg.sender);
    // todo fix this enum issue
    _createSale(itemId, msg.sender, _saleType);
    // if (_saleType == SALE_TYPE_2.direct) {
    //   _createSaleDirect(itemId, msg.sender);
    // } else if (_saleType == SALE_TYPE_2.immediate) {
    //   _createSaleDirect(itemId, msg.sender);
    // } else if (_saleType == SALE_TYPE_2.auction) {
    //   _createSaleDirect(itemId, msg.sender);
    // } else {
    //   revert("Invalid sale type");
    // }
    

    // take care of balances

    // todo ensure seller owns the nft, if not then revert
    // transfer nft to market place
  }

  /**
    * @dev Cancel market item from sale
  */
  function cancelMarketSale(uint256 _tokenId, address _contractAddress) external payable {
    CollectionItem(CONTRACTS.collectionItem).cancelItemInCollection(_tokenId, _contractAddress, msg.sender);
    uint256 itemId = CollectionItem(CONTRACTS.collectionItem).getItemId(_tokenId, _contractAddress, msg.sender);
    _removeSale(itemId, msg.sender);

    // take care of balances
    // transfer nft back to to owner
    // todo make a call to the given contractAddress, use tokenId & owner to ensure this is the owner of this nft
    // todo transfer nft back to the owner
  }

  /**
    * @dev Remove market item from sale. For a varified collection
  */
  function completeMarketSale(uint256 _tokenId, address _contractAddress) external payable {
    // general require statements here
    // todo ensure msg.value >= listed sale price

    uint256 itemId = CollectionItem(CONTRACTS.collectionItem).getItemId(_tokenId, _contractAddress, msg.sender);

    if (_isDirectSaleValid(itemId, msg.sender)) {
      directMarketSale(itemId, _tokenId, _contractAddress, msg.sender);
    } else if (_isImmediateSaleValid(itemId, msg.sender)) {
      immediateMarketSale(itemId, _tokenId, _contractAddress, msg.sender, msg.value);
    } else if (_isAuctionSaleValid(itemId, msg.sender)) {
      auctionMarketSale(itemId, _tokenId, _contractAddress, msg.sender);
    }

    // todo make sure to properly check before transfers
    // transfer nft to buyer

    // transfer funds to seller
  }

  /**
    * @dev Complete direct market sale
  */
  function directMarketSale(uint256 itemId, uint256 _tokenId, address _contractAddress, address _owner) private {
    CollectionItem(CONTRACTS.collectionItem).markItemSoldInCollection(_tokenId, _contractAddress, _owner);
    _removeSale(itemId, _owner);

    // todo make sure to properly check before transfers
    // transfer nft to buyer
    // transfer funds to seller, if any. If 0 then do not attempt fund transfer
  }

  /**
    * @dev Complete immediate market sale
  */
  function immediateMarketSale(uint256 itemId, uint256 _tokenId, address _contractAddress, address _owner, uint256 _price) private {
    // general require statements here
    // todo ensure msg.value >= listed sale price

    // uint256 itemId = CollectionItem(CONTRACTS.collectionItem).getItemId(_tokenId, _contractAddress, msg.sender);
    uint256 collectionId = CollectionItem(CONTRACTS.collectionItem).getItemCollectionId(itemId);
    Collection.CollectionDS memory collection = CollectionItem(CONTRACTS.collectionItem).getCollection(collectionId);

    Collection.COLLECTION_TYPE collectionType = collection.collectionType;

    CollectionItem(CONTRACTS.collectionItem).markItemSoldInCollection(_tokenId, _contractAddress, _owner);
    _removeSale(itemId, _owner);

    // price passed in
    uint256 remainingBalance = _price;

    // initialize generic re-usable variables to avoid `stack too deep` issue
    uint8 percent = 0;
    uint256 reward = 0;

    // deduct marketplace 2% commission
    reward = _calculatePercentChange(remainingBalance, MARKETPLACE_COMMISSION);
    remainingBalance = remainingBalance - reward;
    Bank(CONTRACTS.bank).incrementUserAccount(owner(), reward, 0, 0);
    if (collectionType == Collection.COLLECTION_TYPE.local) {
      console.log('local');

      // deduct nft commission, if applicable
      percent = CollectionItem(CONTRACTS.collectionItem).getItemCommission(itemId);
      reward = _calculatePercentChange(remainingBalance, percent);
      if (reward > 0) {
        remainingBalance = remainingBalance - reward;

        address itemCreator = CollectionItem(CONTRACTS.collectionItem).getCreatorOfItem(itemId);
        Bank(CONTRACTS.bank)._addBank(itemCreator); // this is okay even if bank account already exists
        Bank(CONTRACTS.bank).incrementUserAccount(itemCreator, 0, reward, 0);
      }

    } else if (collectionType == Collection.COLLECTION_TYPE.verified) {
      console.log('verified');

      // deduct collection reflection rewards, if applicable
      percent = collection.reflection;
      reward = _calculatePercentChange(remainingBalance, percent);
      if (reward > 0) {
        remainingBalance = remainingBalance - reward;

        Bank(CONTRACTS.bank).distributeCollectionReflectionReward(collection.contractAddress, collection.totalSupply, reward);
      }

      // deduct collection commission rewards, if applicable
      percent = collection.commission;
      reward = _calculatePercentChange(remainingBalance, percent);
      if (reward > 0) {
        remainingBalance = remainingBalance - reward;

        address collectionOwner = collection.owner;
        Bank(CONTRACTS.bank)._addBank(collectionOwner); // this is okay even if bank account already exists
        Bank(CONTRACTS.bank).incrementUserAccount(collectionOwner, 0, 0, reward);
      }
    
      // add collection incentive rewards, if applicable
      percent = collection.incentive;
      uint256 collectionIncentiveVault = Bank(CONTRACTS.bank).getIncentiveVaultCollectionAccount(collection.contractAddress);
      reward = _calculatePercentChange(collectionIncentiveVault, percent);
      if (reward > 0) {
        remainingBalance = remainingBalance + reward;

        Bank(CONTRACTS.bank).updateCollectionIncentiveReward(collection.contractAddress, reward, false);
      }

    } else if (collectionType == Collection.COLLECTION_TYPE.unverified) {
      console.log('unverified');
    } else {
      revert("Invalid collection type");
    }
    
    // add marketplace incentive rewards, if applicable
    // todo add marketplace incentive rewards to remainingBalance

    // todo make sure to properly check before transfers
    // transfer nft to buyer
    // transfer funds to seller
  }

  /**
    * @dev Complete direct market sale
  */
  function auctionMarketSale(uint256 itemId, uint256 _tokenId, address _contractAddress, address _owner) private {
    CollectionItem(CONTRACTS.collectionItem).markItemSoldInCollection(_tokenId, _contractAddress, _owner);
    _removeSale(itemId, _owner);

    // todo make sure to properly check before transfers
    // transfer nft to buyer
    // transfer funds to seller, if any. If 0 then do not attempt fund transfer
  }


  /** 
    *****************************************************
    **************** Monetary Functions *****************
    *****************************************************
  */
  /**
    * @dev Claim account general reward for this user
  */
  function claimGeneralRewardUserAccount() external returns (uint256) {
    uint256 reward = Bank(CONTRACTS.bank).claimGeneralRewardUserAccount(msg.sender);

    // todo ensure this is a safe way to transfer funds
    ( bool success, ) = payable(msg.sender).call{ value: reward }("");
    require(success, "General reward transfer to user was unccessfull");
    return reward;
  }

  /**
    * @dev Claim account nft commission reward for this user
  */
  function claimNftCommissionRewardUserAccount() external returns (uint256) {
    uint256 reward = Bank(CONTRACTS.bank).claimNftCommissionRewardUserAccount(msg.sender);

    // todo ensure this is a safe way to transfer funds
    ( bool success, ) = payable(msg.sender).call{ value: reward }("");
    require(success, "Nft commission reward transfer to user was unccessfull");
    return reward;
  }

  /**
    * @dev Claim account collection commission reward for this user
  */
  function claimCollectionCommissionRewardUserAccount() external returns (uint256) {
    uint256 reward = Bank(CONTRACTS.bank).claimCollectionCommissionRewardUserAccount(msg.sender);

    // todo ensure this is a safe way to transfer funds
    ( bool success, ) = payable(msg.sender).call{ value: reward }("");
    require(success, "Collection commission reward transfer to user was unccessfull");
    return reward;
  }

  /**
    * @dev Claim collection reflection reward for this token id
  */
  function claimReflectionRewardCollectionAccount(uint256 _tokenId, address _contractAddress) external {
    uint256 reward = Bank(CONTRACTS.bank).claimReflectionRewardCollectionAccount(_tokenId, _contractAddress);

    // todo ensure this is a safe way to transfer funds
    ( bool success, ) = payable(msg.sender).call{ value: reward }("");
    require(success, "Collection commission reward transfer to user was unccessfull");
  }

  /**
    * @dev Deposit into collection incentive vault
  */
  function _depositIncentiveCollectionAccount(address _contractAddress) external payable {
    /**
      * todo
      * why check if person depositing funds is the owner of the collection?
      * Allow anyone to deposit money, in any account? 
    */
    Bank(CONTRACTS.bank).updateCollectionIncentiveReward(_contractAddress, msg.value, true);
  }

  /**
    * @dev Withdraw from collection incentive vault
    * todo Provide option where owner of collection can and can not have access to incentive vault?
  */
  function _withdrawIncentiveCollectionAccount(address _contractAddress, uint256 _amount) external {
    uint256 collectionId = CollectionItem(CONTRACTS.collectionItem).getCllectionForContract(_contractAddress);
    // Collection.CollectionDS memory collection = CollectionItem(CONTRACTS.collectionItem).getCollection(collectionId);
    address collectionOwner = CollectionItem(CONTRACTS.collectionItem).getOwnerOfCollection(collectionId);

    require(collectionOwner == msg.sender, "You are not the owner of this collection");

    Bank(CONTRACTS.bank).updateCollectionIncentiveReward(_contractAddress, _amount, false);

    // todo ensure this is a safe way to transfer funds
    ( bool success, ) = payable(msg.sender).call{ value: _amount }("");
    require(success, "Collection commission reward transfer to user was unccessfull");
  }


  /** 
    *****************************************************
    ***************** Reward Functions ******************
    *****************************************************
  */
  // /**
  //   * @dev Claim nft commission reward for this user
  // */
  // function claimNftCommissionReward() public payable returns (uint256) {
  //   // todo ensure caller is authorized

  //   uint256 reward = _claimNftCommissionRewardUserAccount(msg.sender);
  //   // todo ensure this is a safe way to transfer funds
  //   ( bool success, ) = payable(msg.sender).call{ value: reward }("");
  //   require(success, "Nft commission reward transfer to user was unccessfull");
  //   return reward;
  // }

  // /**
  //   * @dev Claim collection commission reward for this user
  // */
  // function claimCollectionCommissionReward() public payable returns (uint256) {
  //   // todo ensure caller is authorized

  //   uint256 reward = _claimCollectionCommissionRewardUserAccount(msg.sender);
  //   // todo ensure this is a safe way to transfer funds
  //   ( bool success, ) = payable(msg.sender).call{ value: reward }("");
  //   require(success, "Collection commission reward transfer to user was unccessfull");
  //   return reward;
  // }

  // /**
  //   * @dev Claim collection reflection reward for this user
  // */
  // function claimCollectionReflectionReward(uint256 _tokenId, address _contractAddress) public returns (uint256) {
  //   // todo ensure caller is authorized

  //   uint256 reward = getCollectionReflectionTokenReward(_tokenId, _contractAddress);
  //   _updateCollectionReflectionTokenReward(_tokenId, _contractAddress, 0);
  //   // todo use tokeId to check the owner from nft contract. Compare with this owner
  //   address owner = msg.sender;
  //   // todo ensure this is a safe way to transfer funds
  //   ( bool success, ) = payable(owner).call{ value: reward }("");
  //   require(success, "Collection reflection reward transfer to user was unccessfull");
  //   return reward;
  // }

  // /**
  //   * @dev Claim all rewards for this user
  // */
  // function claimAllRewards(uint256 _tokenId, address _contractAddress) external payable returns (uint256) {
  //   uint256 reward = 0;
  //   reward += claimNftCommissionReward();
  //   reward += claimCollectionReflectionReward(_tokenId, _contractAddress);
  //   reward += claimCollectionCommissionReward();
  //   return reward;
  // }

  // /**
  //   * @dev Deposit funds into the inventive vault
  // */
  // function depositCollectionIncentiveVault(address _contractAddress) public payable {
  //   // todo ensure caller is authorized

  //   updateCollectionIncentiveReward(_contractAddress, msg.value, true);
  // }

  // /**
  //   * @dev Withdraw funds from the inventive vault
  // */
  // function withdrawCollectionIncentiveVault(address _contractAddress, uint256 _value) public returns (uint256) {
  //   // todo ensure caller is authorized

  //   uint256 initialVaultState = _getIncentiveVaultCollectionAccount(_contractAddress);
  //   updateCollectionIncentiveReward(_contractAddress, _value, false);
  //   uint256 afterVaultState = _getIncentiveVaultCollectionAccount(_contractAddress);

  //   if ((initialVaultState - _value) == afterVaultState) {
  //     // todo use tokeId to check the owner from nft contract. Compare with this owner
  //     address owner = msg.sender;
  //     // todo ensure this is a safe way to transfer funds
  //     ( bool success, ) = payable(owner).call{ value: _value }("");
  //     require(success, "Collection incentive vault transfer was unccessfull");
  //   }
  //   return _value;
  //   // todo 
  // }


  /** 
    *****************************************************
    *************** Collection Functions ****************
    *****************************************************
  */
  /**
    * @dev Create local collection
  */
  function createLocalCollection(string memory _name, address _contractAddress) external onlyOwner() {
    // todo update so local address can be passed in
    CollectionItem(CONTRACTS.collectionItem).createLocalCollection(_name, _contractAddress, msg.sender);
    Bank(CONTRACTS.bank)._addBank(msg.sender); // this is okay even if bank account already exists
  }

  /**
    * @dev Create verified collection
  */
  function createVerifiedCollection(
    string memory _name, address _contractAddress, uint256 _totalSupply, uint8 _reflection, uint8 _commission, address _owner
  ) external onlyOwner() {
    // todo require _totalSupply to be > 0

    CollectionItem(CONTRACTS.collectionItem).createVerifiedCollection(_name, _contractAddress, _totalSupply, _reflection, _commission, _owner);
    Bank(CONTRACTS.bank)._addBank(_contractAddress); // this is okay even if bank account already exists
    Bank(CONTRACTS.bank).initReflectionVaultCollectionAccount(_contractAddress, _totalSupply);
  }

  /**
    * @dev Create unvarivied collection
  */
  function createUnvariviedCollection(string memory _name) external onlyOwner() {
    // todo update so local address can be passed in
    /**uint256 id = */CollectionItem(CONTRACTS.collectionItem).createUnvariviedCollection(_name, msg.sender);
    Bank(CONTRACTS.bank)._addBank(msg.sender); // this is okay even if bank account already exists

    // todo event of collection id?
  }


  /** 
    *****************************************************
    ************** Expose Child Functions ***************
    *****************************************************
  */

  // // UserAccount.sol
  // /**
  //   * @dev Get account of user
  // */
  // function getUserAccount(address _id) external view returns (UserAccountDS memory) {
  //   return _getUserAccount(_id);
  // }

  // // CollectionAccount.sol
  // /**
  //   * @dev Get account of collection
  // */
  // function getCollectionAccount(address _id) external view returns (CollectionAccountDS memory) {
  //   return _getCollectionAccount(_id);
  // }

  // /**
  //   * @dev Get collection incentive vault
  // */
  // function getIncentiveVaultCollectionAccount(address _id) external view returns (uint256) {
  //   return _getIncentiveVaultCollectionAccount(_id);
  // }

  // // Vault.sol
  // /**
  //   * @dev Get vault of user
  // */
  // function getVault(address _id) external view returns (VaultDS memory) {
  //   return _getVault(_id);
  // }

}
