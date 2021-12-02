// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.4 <0.9.0;

import '@openzeppelin/contracts/access/Ownable.sol';
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// import "./User.sol";
import "./market/CollectionItem.sol";
import "./bank/Bank.sol";
import "./sale/Sale.sol";

import "hardhat/console.sol";


contract AvaxTrade is Ownable, Sale, Bank {
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

    // Bank bank = new Bank();
    // CONTRACTS.bank = address(bank);
    // Sale sale = new Sale();
    // CONTRACTS.sale = address(sale);
    CollectionItem collectionItem = new CollectionItem();
    CONTRACTS.collectionItem = address(collectionItem);
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
    CollectionItem(CONTRACTS.collectionItem).addItemToCollection(
      _tokenId,
      _contractAddress,
      msg.sender,
      buyer,
      _price
    );
    uint256 itemId = CollectionItem(CONTRACTS.collectionItem)._getItemId(_tokenId, _contractAddress, msg.sender);
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
    uint256 itemId = CollectionItem(CONTRACTS.collectionItem)._getItemId(_tokenId, _contractAddress, msg.sender);
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

    uint256 itemId = CollectionItem(CONTRACTS.collectionItem)._getItemId(_tokenId, _contractAddress, msg.sender);

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

    // uint256 itemId = CollectionItem(CONTRACTS.collectionItem)._getItemId(_tokenId, _contractAddress, msg.sender);

    CollectionItem(CONTRACTS.collectionItem).markItemSoldInCollection(_tokenId, _contractAddress, _owner);
    _removeSale(itemId, _owner);

    // price passed in
    uint256 remainingBalance = _price;

    // deduct marketplace 2% commission
    uint256 marketplaceReward = (remainingBalance * MARKETPLACE_COMMISSION / 100);
    remainingBalance = remainingBalance - marketplaceReward;
    _incrementBankAccount(owner(), marketplaceReward, 0, 0);

    // deduct nft commission, if applicable
    uint256 nftCommissionReward = CollectionItem(CONTRACTS.collectionItem).getNftCommissionReward(_tokenId, _contractAddress, _owner, remainingBalance);
    if (nftCommissionReward > 0) {
      remainingBalance = remainingBalance - nftCommissionReward;

      address itemCreator = CollectionItem(CONTRACTS.collectionItem)._getCreatorOfItem(itemId);
      _addBank(itemCreator); // this is okay even if bank account already exists
      _incrementBankAccount(itemCreator, 0, nftCommissionReward, 0);
    }

    // deduct collection reflection rewards, if applicable
    CollectionItem(CONTRACTS.collectionItem).handleReflectionRewards(_tokenId, _contractAddress, _owner, remainingBalance);
    uint256 collectionReflectionReward = CollectionItem(CONTRACTS.collectionItem).getCollectionReflectionReward(_tokenId, _contractAddress, _owner, remainingBalance);
    if (collectionReflectionReward > 0) {
      // CollectionItem(CONTRACTS.collectionItem)._distributeCollectionReflectionReward(itemId, collectionReflectionReward);
      remainingBalance = remainingBalance - collectionReflectionReward;
    }

    // deduct collection commission rewards, if applicable
    uint256 collectionCommissionReward = CollectionItem(CONTRACTS.collectionItem).getCollectionCommissionReward(_tokenId, _contractAddress, _owner, remainingBalance);
    if (collectionCommissionReward > 0) {
      remainingBalance = remainingBalance - collectionCommissionReward;

      address collectionOwner = CollectionItem(CONTRACTS.collectionItem)._getOwnerOfItemCollection(itemId);
      _addBank(collectionOwner); // this is okay even if bank account already exists
      _incrementBankAccount(collectionOwner, 0, 0, collectionCommissionReward);
    }
    
    // add collection incentive rewards, if applicable
    CollectionItem(CONTRACTS.collectionItem).handleIncentiveRewards(_tokenId, _contractAddress, _owner);
    uint256 collectionIncentiveReward = CollectionItem(CONTRACTS.collectionItem).getCollectionIncentiveReward(_tokenId, _contractAddress, _owner);
    if (collectionIncentiveReward > 0) {
      remainingBalance = remainingBalance + collectionIncentiveReward;
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

  // /**
  //   * @dev Claim collection reflection reward for this user
  // */
  // function claimCollectionReflectionReward(uint256 _tokenId, address _contractAddress) public returns (uint256) {
  //   uint256 reward = CollectionItem(CONTRACTS.collectionItem).getCollectionReflectionTokenReward(_tokenId, _contractAddress);
  //   CollectionItem(CONTRACTS.collectionItem)._updateCollectionReflectionTokenReward(_tokenId, _contractAddress, 0);
  //   // todo use tokeId to check the owner from nft contract. Compare with this owner
  //   address owner = msg.sender;
  //   // todo ensure this is a safe way to transfer funds
  //   ( bool success, ) = payable(owner).call{ value: reward }("");
  //   require(success, "Collection reflection reward transfer to user was unccessfull");
  //   return reward;
  // }

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


  /** 
    *****************************************************
    ************** Expose Child Functions ***************
    *****************************************************
  */

  // Collection.sol
  /**
    * @dev Create local collection
  */
  // function createLocalCollection(string memory _name, address _contractAddress) public {
  //   Market(CONTRACTS.collectionItem)._createLocalCollection(_name, _contractAddress);
  // }

  /**
    * @dev Create verified collection
  */
  // function createVerifiedCollection(
  //   string memory _name, address _contractAddress, uint256 _totalSupply, uint8 _reflection, uint8 _commission, address _owner
  // ) public {
  //   Market(CONTRACTS.collectionItem)._createVerifiedCollection(_name, _contractAddress, _totalSupply, _reflection, _commission, _owner);
  // }

  /**
    * @dev Create unvarivied collection
  */
  // function createUnvariviedCollection(string memory _name) public {
  //   Market(CONTRACTS.collectionItem)._createUnvariviedCollection(_name);
  // }
  /**
    * @dev Get collection
  */
  // function getCollection(uint256 _collectionId) external view returns (CollectionDS memory) {
  //   return Market(CONTRACTS.collectionItem)._getCollection(_collectionId);
  // }

  // Item.sol
  /**
    * @dev Get item
  */
  // function getItem(uint256 _itemId) external view returns (ItemDS memory) {
  //   return Market(CONTRACTS.collectionItem)._getItem(_itemId);
  // }

}
