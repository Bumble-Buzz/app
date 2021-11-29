// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.4 <0.9.0;

import '@openzeppelin/contracts/access/Ownable.sol';
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// import "./User.sol";
import "./market/Market.sol";
import "./bank/Bank.sol";
import "./sale/Sale.sol";

import "hardhat/console.sol";


contract AvaxTrade is Market, Bank, Sale, Ownable {
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

  // state variables
  uint256 private LISTING_PRICE = 0.0 ether; // price to list item in marketplace
  uint8 private MARKETPLACE_COMMISSION = 2; // commission rate charged upon every sale, in percentage

  // monetary
  BalanceSheetDS private BALANCE_SHEET;


  constructor() {
    BALANCE_SHEET = BalanceSheetDS(0, 0, 0, 0, 0, 0, 0, 0);

    // create collections
    _createUnvariviedCollection('Unverified');
    // @todo we should already know the contract address of the local collection
    // _createLocalCollection('Local', '', address(0));
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
    uint256 itemId = _addItemToCollection(
      _tokenId,
      _contractAddress,
      msg.sender,
      buyer,
      _price
    );
    _createSale(itemId, msg.sender, _saleType);
    // take care of balances
    // transfer nft to market place
  }

  /**
    * @dev Cancel market item from sale
  */
  function cancelMarketSale(uint256 _itemId) external {
    _cancelItemInCollection(_itemId, msg.sender);
    _removeSale(_itemId, msg.sender);
    // take care of balances
    // transfer nft back to to owner
  }

  /**
    * @dev Remove market item from sale. For a varified collection
  */
  function completeMarketSale(uint256 _itemId) external payable {
    _markItemSoldInCollection(_itemId);
    _removeSale(_itemId, msg.sender);
  
    // take care of balances
    uint256 remainingBalance = msg.value;

    // deduct marketplace 2% commission
    uint256 marketplaceReward = (remainingBalance * MARKETPLACE_COMMISSION / 100);
    remainingBalance = remainingBalance - marketplaceReward;
    _incrementBankAccount(address(this), marketplaceReward, 0, 0);

    // deduct nft commission, if applicable
    uint256 nftCommissionReward = _calculateNftCommissionReward(_itemId, remainingBalance);
    if (nftCommissionReward > 0) {
      remainingBalance = remainingBalance - nftCommissionReward;

      address itemCreator = _getCreatorOfItem(_itemId);
      _addBank(itemCreator); // this is okay even if bank account already exists
      _incrementBankAccount(itemCreator, 0, nftCommissionReward, 0);
    }

    // deduct collection reflection rewards, if applicable
    uint256 collectionReflectionReward = _calculateCollectionReflectionReward(_itemId, remainingBalance);
    if (collectionReflectionReward > 0) {
      remainingBalance = remainingBalance - collectionReflectionReward;
    }

    // deduct collection commission rewards, if applicable
    uint256 collectionCommissionReward = _calculateCollectionCommissionReward(_itemId, remainingBalance);
    if (collectionCommissionReward > 0) {
      remainingBalance = remainingBalance - collectionCommissionReward;

      address collectionOwner = _getOwnerOfCollection(_itemId);
      _addBank(collectionOwner); // this is okay even if bank account already exists
      _incrementBankAccount(collectionOwner, 0, 0, collectionCommissionReward);
    }
    
    // add collection incentive rewards, if applicable
    uint256 calculateCollectionIncentiveReward = _calculateCollectionIncentiveReward(_itemId);
    if (calculateCollectionIncentiveReward > 0) {
      remainingBalance = remainingBalance + calculateCollectionIncentiveReward;
    }
    
    // add marketplace incentive rewards, if applicable
    // todo add marketplace incentive rewards to remainingBalance

    // transfer nft back to to owner
  }


  /** 
    *****************************************************
    ***************** Reward Functions ******************
    *****************************************************
  */
  /**
    * @dev Claim nft commission reward for this user
  */
  function claimNftCommissionReward() public payable returns (uint256) {
    uint256 reward = _claimAccountNftCommissionReward(msg.sender);
    // todo ensure this is a safe way to transfer funds
    ( bool success, ) = payable(msg.sender).call{ value: reward }("");
    require(success, "Nft commission reward transfer to user was unccessfull");
    return reward;
  }

  /**
    * @dev Claim collection reflection reward for this user
  */
  function claimCollectionReflectionReward(uint256 _itemId) public payable returns (uint256) {
    uint256 reward = _claimCollectionReflectionReward(_itemId);
    // todo use itemId to get tokenId, use tokeId to get owner from nft contract
    address owner = address(0);
    // todo ensure this is a safe way to transfer funds
    ( bool success, ) = payable(owner).call{ value: reward }("");
    require(success, "Collection reflection reward transfer to user was unccessfull");
    return reward;
  }

  /**
    * @dev Claim collection commission reward for this user
  */
  function claimCollectionCommissionReward() public payable returns (uint256) {
    uint256 reward = _claimAccountCollectionCommissionReward(msg.sender);
    // todo ensure this is a safe way to transfer funds
    ( bool success, ) = payable(msg.sender).call{ value: reward }("");
    require(success, "Collection commission reward transfer to user was unccessfull");
    return reward;
  }

  /**
    * @dev Claim all rewards for this user
  */
  function claimAllRewards(uint256 _itemId) external payable returns (uint256) {
    uint256 reward = 0;
    reward += claimNftCommissionReward();
    reward += claimCollectionReflectionReward(_itemId);
    reward += claimCollectionCommissionReward();
    return reward;
  }


  /** 
    *****************************************************
    ************** Expose Child Functions ***************
    *****************************************************
  */

}
