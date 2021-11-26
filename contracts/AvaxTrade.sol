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


contract AvaxTrade is Market, Bank, Sale {
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
  struct BalanceSheet {
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
  BalanceSheet private CONTRACT_BANK;


  constructor() {
    CONTRACT_BANK = BalanceSheet(0, 0, 0, 0, 0, 0, 0, 0);

    // create collections
    _createUnvariviedCollection('Unverified');
    // @todo we should already know the contract address of the local collection
    // _createLocalCollection('Local', '', address(0));
  }

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
    _cancelItemInCollection(_itemId);
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
    _incrementBankAccount(address(this), marketplaceReward, 0, 0, 0);

    // deduct nft commission, if applicable
    uint256 nftCommissionReward = _calculateNftCommissionReward(_itemId, remainingBalance);
    if (nftCommissionReward > 0) {
      remainingBalance = remainingBalance - nftCommissionReward;

      address itemCreator = _getCreatorOfItem(_itemId);
      _addBank(itemCreator); // this is okay even if bank account already exists
      _incrementBankAccount(itemCreator, 0, nftCommissionReward, 0, 0);
    }

    // deduct collection reflection rewards, if applicable
    uint256 reflectionReward = _calculateCollectionReflectionReward(_itemId, remainingBalance);
    if (reflectionReward > 0) {
      remainingBalance = remainingBalance - reflectionReward;
    }

    // deduct collection commission rewards, if applicable
    uint256 commissionReward = _calculateCollectionCommissionReward(_itemId, remainingBalance);
    if (commissionReward > 0) {
      remainingBalance = remainingBalance - commissionReward;

      address collectionOwner = _getOwnerOfCollection(_itemId);
      _addBank(collectionOwner); // this is okay even if bank account already exists
      _incrementBankAccount(collectionOwner, 0, 0, 0, commissionReward);
    }

    // transfer nft back to to owner
  }




  // /**
  //   * @dev Create local market sale
  //   * todo the `_commission` and `_creator` can not be passed in. Need to track this upon creation of nft
  //   *       and then use it here 
  // */
  // function createLocalMarketSale(
  //   uint256 _tokenId, address _contractAddress, uint256 _price, SALE_TYPE_2 _saleType
  // ) external payable {
  //   // @todo deal with these inputs
  //   uint8 commission = 123; // fetch commission from nft contract
  //   address creator = address(0); // fetch creator from nft contract
  //   uint256 itemId = _addItemToCollection2(
  //     _tokenId,
  //     _contractAddress,
  //     msg.sender,
  //     address(0),
  //     _price,
  //     commission,
  //     creator
  //   );
  //   _createSale(itemId, msg.sender, _saleType);
  //   // take care of balances
  //   // transfer nft to market place
  // }

  // /**
  //   * @dev Create direct market sale
  // */
  // function createDirectMarketSale(
  //   uint256 _tokenId, address _contractAddress, address _buyer, uint256 _price
  // ) external payable {
  //   uint256 itemId = _addItemToCollection2(
  //     _tokenId,
  //     _contractAddress,
  //     msg.sender,
  //     _buyer,
  //     _price,
  //     0,
  //     address(0)
  //   );
  //   _createSale(itemId, msg.sender, SALE_TYPE_2.direct);
  //   // take care of balances
  //   // transfer nft to market place
  // }

  // /**
  //   * @dev Create verified market sale
  // */
  // function createVerifiedMarketSale(
  //   uint256 _tokenId, address _contractAddress, uint256 _price, SALE_TYPE_2 _saleType
  // ) external payable {
  //   uint256 itemId = _addItemToCollection2(
  //     _tokenId,
  //     _contractAddress,
  //     msg.sender,
  //     address(0),
  //     _price,
  //     0,
  //     address(0)
  //   );
  //   _createSale(itemId, msg.sender, _saleType);
  //   // take care of balances
  //   // transfer nft to market place
  // }

  // /**
  //   * @dev Create unverified market sale
  // */
  // function createUnverifiedMarketSale(
  //   uint256 _tokenId, address _contractAddress, uint256 _price, SALE_TYPE_2 _saleType
  // ) external payable {
  //   uint256 itemId = _addItemToCollection2(
  //     _tokenId,
  //     _contractAddress,
  //     msg.sender,
  //     address(0),
  //     _price,
  //     0,
  //     address(0)
  //   );
  //   _createSale(itemId, msg.sender, _saleType);
  //   // take care of balances
  //   // transfer nft to market place
  // }

}
