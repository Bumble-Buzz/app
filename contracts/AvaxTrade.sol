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
    uint256 commission; // outstanding commission reward balance from the item
    uint256 reflection; // outstanding reflection reward balance from the collection
    uint256 collectionCommission; // outstanding commission reward balance from the collection
    uint256 reward; // outstanding reward balance, used to give incentives
    uint256 vault;  // outstanding vault balance
    uint256 availableFunds; // total funds in contract after deductions
  }

  // state variables
  uint256 private LISTING_PRICE = 0.0 ether; // price to list item in marketplace
  uint8 private COMMISSION = 2; // commission rate charged upon every sale, in percentage

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
  ) external payable {
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
  function cancelMarketSale(uint256 _itemId) public {
  }

  /**
    * @dev Remove market item from sale. For a varified collection
  */
  function completeMarketSale(uint256 _collectionId, uint256 _tokenId) public {
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
