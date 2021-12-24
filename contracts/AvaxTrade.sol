// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.4 <0.9.0;

import '@openzeppelin/contracts/access/Ownable.sol';
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
// import '@openzeppelin/contracts/token/ERC1155/IERC1155.sol';
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
// import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";

import "./collectionItem/CollectionItem.sol";
import "./bank/Bank.sol";
import "./sale/Sale.sol";

import "hardhat/console.sol";


contract AvaxTrade is Ownable, ReentrancyGuard, IERC721Receiver, Sale {

  // modifiers
  modifier checkContractValidity(address _contractAddress) {
    require(_isContractAddressValid(_contractAddress), "Provided contract address is not valid");
    _;
  }

  // enums

  // data structures
  struct BalanceSheetDS {
    uint256 totalFunds; // total funds in contract before deductions
    uint256 marketplaceRevenue; // outstanding marketplace revenue balance
    uint256 nftCommission; // outstanding nft commission reward balance
    uint256 collectionReflection; // outstanding collection reflection reward balance
    uint256 collectionCommission; // outstanding collection commission reward balance
    uint256 collectionIncentive;  // outstanding collection incentive reward balance
    uint256 incentiveVault; // outstanding incentive vault balance
    uint256 availableFunds; // total funds in contract after deductions
  }

  struct ContractsDS {
    address bank; // address for the bank contract
    address sale; // address for the sale contract
    address collectionItem; // address for the collectionItem contract
  }

  // state variables
  // todo initialize to 0, make it configurable
  uint256 private LISTING_PRICE = 0.0 ether; // price to list item in marketplace
  // todo initialize to 2, make it configurable
  uint8 private MARKETPLACE_COMMISSION = 2; // commission rate charged upon every sale, in percentage
  // todo initialize to 0, make it configurable
  uint8 private MARKETPLACE_INCENTIVE_COMMISSION = 2; // commission rate rewarded upon every sale, in percentage

  ContractsDS private CONTRACTS;

  // monetary
  BalanceSheetDS private BALANCE_SHEET;

  // events
  event onERC721ReceivedEvent(address operator, address from, uint256 tokenId, bytes data);
  // event onERC1155ReceivedEvent(address operator, address from, uint256 id, uint256 value, bytes data);
  // event onERC1155BatchReceivedEvent(address operator, address from, uint256[] ids, uint256[] values, bytes data);


  constructor() {
    BALANCE_SHEET = BalanceSheetDS(0, 0, 0, 0, 0, 0, 0, 0);

    // create collections

    Bank bank = new Bank();
    CONTRACTS.bank = address(bank);
    // Sale sale = new Sale();
    // CONTRACTS.sale = address(sale);
    CollectionItem collectionItem = new CollectionItem(address(this), owner());
    CONTRACTS.collectionItem = address(collectionItem);
  }


  /**
    *****************************************************
    **************** Private Functions ******************
    *****************************************************
  */
  /**
    * @dev Is contract address valid ERC721 or ERC1155
  */
  function _isContractAddressValid(address _contractAddress) private view returns (bool) {
    if (IERC721(_contractAddress).supportsInterface(type(IERC721).interfaceId)) {
      return true;
    }
    return false;
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
    uint256 _tokenId, address _contractAddress, address _buyer, uint256 _price, SALE_TYPE _saleType
  ) external nonReentrant() {
    address buyer = address(0);
    if (_saleType == SALE_TYPE.direct) {
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
    _createSale(itemId, msg.sender, _saleType);

    if (IERC721(_contractAddress).supportsInterface(type(IERC721).interfaceId)) {
      // ownerOf(_tokenId) == msg.sender then continue, else revert transaction
      require(IERC721(_contractAddress).ownerOf(_tokenId) == msg.sender, "You are not the owner of this item");

      // transfer nft to market place
      IERC721(_contractAddress).safeTransferFrom(msg.sender, address(this), _tokenId);
    } else {
      revert("Provided contract address is not valid");
    }

    // take care of balances

    // todo ensure seller owns the nft, if not then revert
  }

  /**
    * @dev Cancel market item from sale
  */
  function cancelMarketSale(uint256 _itemId) external nonReentrant() {
    Item.ItemDS memory item = CollectionItem(CONTRACTS.collectionItem).getItem(_itemId);
    require(!item.sold, "This item has already been sold");
    require(item.active, "This item is inactive");
    require(msg.sender == item.seller, "You are not the original owner of this item");

    // uint256 itemId = CollectionItem(CONTRACTS.collectionItem).cancelItemInCollection(_tokenId, _contractAddress, msg.sender);
    CollectionItem(CONTRACTS.collectionItem).cancelItemInCollection(_itemId);
    _removeSale(_itemId, msg.sender);

    // transfer nft to market place
    IERC721(item.contractAddress).safeTransferFrom(address(this), msg.sender, item.tokenId);

    // todo why confirm if contractAddress is valid ERC721, we already have when creating market sale
    // if (IERC721(item.contractAddress).supportsInterface(type(IERC721).interfaceId)) {
    //   // transfer nft to market place
    //   IERC721(item.contractAddress).safeTransferFrom(address(this), msg.sender, item.tokenId);
    // } else {
    //   revert("Provided contract address is not valid");
    // }

    // take care of balances
    // transfer nft back to to owner
    // todo make a call to the given contractAddress, use tokenId & owner to ensure this is the owner of this nft
    // todo transfer nft back to the owner
  }

  /**
    * @dev Remove market item from sale. For a varified collection
  */
  function completeMarketSale(uint256 itemId) external nonReentrant() payable {
    Item.ItemDS memory item = CollectionItem(CONTRACTS.collectionItem).getItem(itemId);
    require(!item.sold, "This item has already been sold");
    require(item.active, "This item is inactive");
    require(msg.value >= item.price, "Not enough funds to purchase this item");
    require(msg.sender != item.seller, "You can not buy your own item");

    // general require statements here
    // todo ensure msg.value >= listed sale price

    // uint256 itemId = CollectionItem(CONTRACTS.collectionItem).getItemId(_tokenId, _contractAddress, msg.sender);

    if (_isDirectSaleValid(itemId, item.seller)) {
      directMarketSale(item, msg.sender, msg.value);
    } else if (_isImmediateSaleValid(itemId, item.seller)) {
      immediateMarketSale(item, msg.sender, msg.value);
    } else if (_isAuctionSaleValid(itemId, item.seller)) {
      auctionMarketSale(item, msg.sender);
    } else {
      revert("Invalid sale type");
    }

    // todo make sure to properly check before transfers
    // transfer nft to buyer

    // transfer funds to seller
    // todo Remove so many extra addBank() calls
  }

  /**
    * @dev Complete direct market sale
  */
  function directMarketSale(Item.ItemDS memory item, address _buyer, uint256 _price) private {
    require(_buyer == item.buyer, "You are not the authorized buyer");

    // CollectionItem(CONTRACTS.collectionItem).markItemSoldInCollection(_tokenId, _contractAddress, _buyer);
    CollectionItem(CONTRACTS.collectionItem).markItemSoldInCollection(item.id, _buyer);
    _removeSale(item.id, item.seller);

    if (_price > 0) {
      // Bank(CONTRACTS.bank).addBank(item.seller); // this is okay even if bank account already exists
      Bank(CONTRACTS.bank).incrementUserAccount(item.seller, _price, 0, 0);
    }

    // transfer nft to market place
    IERC721(item.contractAddress).safeTransferFrom(address(this), _buyer, item.tokenId);

    // todo why confirm if contractAddress is valid ERC721, we already have when creating market sale
    // if (IERC721(item.contractAddress).supportsInterface(type(IERC721).interfaceId)) {
    //   // transfer nft to market place
    //   IERC721(item.contractAddress).safeTransferFrom(address(this), msg.sender, item.tokenId);
    // } else {
    //   revert("Provided contract address is not valid");
    // }

    // todo make sure to properly check before transfers
    // transfer nft to buyer
    // transfer funds to seller, if any. If 0 then do not attempt fund transfer
  }

  /**
    * @dev Complete immediate market sale
  */
  function immediateMarketSale(Item.ItemDS memory item, address _buyer, uint256 _price) private {
    // todo Test: Unverified item on sale. Then item is now verified but still listed on sale. What happens?

    Collection.CollectionDS memory collection = CollectionItem(CONTRACTS.collectionItem).getCollection(item.collectionId);

    // CollectionItem(CONTRACTS.collectionItem).markItemSoldInCollection(item.tokenId, item.contractAddress, _buyer);
    CollectionItem(CONTRACTS.collectionItem).markItemSoldInCollection(item.id, _buyer);
    _removeSale(item.id, item.seller);

    // deduct marketplace 2% commission
    _price = marketplaceCommission(_price, MARKETPLACE_COMMISSION);

    Collection.COLLECTION_TYPE collectionType = collection.collectionType;
    if (collectionType == Collection.COLLECTION_TYPE.local) {
      console.log('local');

      // deduct nft commission, if applicable
      _price = nftCommission(_price, item.commission, item.creator);

    } else if (collectionType == Collection.COLLECTION_TYPE.verified) {
      console.log('verified');

      // deduct collection reflection rewards, if applicable
      _price = collectionReflection(_price, collection.reflection, collection.contractAddress, collection.totalSupply);

      // deduct collection commission rewards, if applicable
      _price = collectionCommission(_price, collection.commission, collection.owner);

      // add collection incentive rewards, if applicable
      _price = collectionIncentive(_price, collection.incentive, collection.contractAddress);

    } else if (collectionType == Collection.COLLECTION_TYPE.unverified) {
      console.log('unverified');
    } else {
      revert("Invalid collection type");
    }
    
    // add marketplace incentive rewards, if applicable
    _price = marketplaceIncentive(_price, MARKETPLACE_INCENTIVE_COMMISSION);

    // transfer funds to seller
    // Bank(CONTRACTS.bank).addBank(item.seller); // this is okay even if bank account already exists
    Bank(CONTRACTS.bank).incrementUserAccount(item.seller, _price, 0, 0);

    // transfer nft to market place
    IERC721(item.contractAddress).safeTransferFrom(address(this), _buyer, item.tokenId);

    // todo make sure to properly check before transfers
    // transfer nft to buyer
  }

  /**
    * @dev Complete direct market sale
  */
  function auctionMarketSale(Item.ItemDS memory item, address _buyer) private {
    // CollectionItem(CONTRACTS.collectionItem).markItemSoldInCollection(item.tokenId, item.contractAddress, _buyer);
    CollectionItem(CONTRACTS.collectionItem).markItemSoldInCollection(item.id, _buyer);
    _removeSale(item.id, _buyer);

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
    * @dev Deduct marketplace commission
    * @custom:type private
  */
  function marketplaceCommission(uint256 _value, uint8 _percent) private returns (uint256) {
    uint256 reward = _calculatePercentChange(_value, _percent);
    _value -= reward;
    // Bank(CONTRACTS.bank).addBank(owner()); // this is okay even if bank account already exists
    Bank(CONTRACTS.bank).incrementUserAccount(owner(), reward, 0, 0);
    BALANCE_SHEET.marketplaceRevenue += reward;
    return _value;
  }

  /**
    * @dev Deduct nft commission
    * @custom:type private
  */
  function nftCommission(uint256 _value, uint8 _percent, address _creator) private returns (uint256) {
    uint256 reward = _calculatePercentChange(_value, _percent);
    if (reward > 0) {
      _value -= reward;

      // Bank(CONTRACTS.bank).addBank(_creator); // this is okay even if bank account already exists
      Bank(CONTRACTS.bank).incrementUserAccount(_creator, 0, reward, 0);
      BALANCE_SHEET.nftCommission += reward;
    }
    return _value;
  }

  /**
    * @dev Deduct collection reflection
    * @custom:type private
  */
  function collectionReflection(uint256 _value, uint8 _percent, address _contractAddress, uint256 _totalSupply) private returns (uint256) {
    uint256 reward = _calculatePercentChange(_value, _percent);
    if (reward > 0) {
      _value -= reward;

      Bank(CONTRACTS.bank).distributeCollectionReflectionReward(_contractAddress, _totalSupply, reward);
      BALANCE_SHEET.collectionReflection += reward;
    }
    return _value;
  }

  /**
    * @dev Deduct collection commission
    * @custom:type private
  */
  function collectionCommission(uint256 _value, uint8 _percent, address _collectionOwner) private returns (uint256) {
    uint256 reward = _calculatePercentChange(_value, _percent);
    if (reward > 0) {
      _value -= reward;

      // Bank(CONTRACTS.bank).addBank(_collectionOwner); // this is okay even if bank account already exists
      Bank(CONTRACTS.bank).incrementUserAccount(_collectionOwner, 0, 0, reward);
      BALANCE_SHEET.collectionCommission += reward;
    }
    return _value;
  }

  /**
    * @dev Give collection incentives
    * @custom:type private
  */
  function collectionIncentive(uint256 _value, uint8 _percent, address _contractAddress) private returns (uint256) {
    uint256 collectionIncentiveVault = Bank(CONTRACTS.bank).getIncentiveVaultCollectionAccount(_contractAddress);
    uint256 reward = _calculatePercentChange(collectionIncentiveVault, _percent);
    if (reward > 0) {
      _value += reward;

      Bank(CONTRACTS.bank).updateCollectionIncentiveReward(_contractAddress, reward, false);
      BALANCE_SHEET.collectionIncentive -= reward;
    }
    return _value;
  }

  /**
    * @dev Give marketplace incentives
    * @custom:type private
  */
  function marketplaceIncentive(uint256 _value, uint8 _percent) private returns (uint256) {
    uint256 reward = _calculatePercentChange(BALANCE_SHEET.incentiveVault, _percent);
    if (reward > 0) {
      _value += reward;

      BALANCE_SHEET.incentiveVault -= reward;
    }
    return _value;
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
    
    //  todo use tokeId to check the owner from nft contract. Compare with this owner

    // ensure contract address is a valid IERC721 or IERC1155 contract
    // require(_isContractAddressValid(_contractAddress), "Provided contract address is not valid");

    // ownerOf(_tokenId) == msg.sender then continue, else revert transaction
    require(IERC721(_contractAddress).ownerOf(_tokenId) == msg.sender, "You are not the owner of this item");

    // todo ensure this is a safe way to transfer funds
    ( bool success, ) = payable(msg.sender).call{ value: reward }("");
    require(success, "Collection commission reward transfer to user was unccessfull");
  }

  /**
    * @dev Deposit into collection incentive vault
  */
  function depositIncentiveCollectionAccount(address _contractAddress) external payable {
    /**
      * todo
      * why check if person depositing funds is the owner of the collection?
      * Allow anyone to deposit money, in any account? 
    */
    Bank(CONTRACTS.bank).updateCollectionIncentiveReward(_contractAddress, msg.value, true);
    BALANCE_SHEET.collectionIncentive += msg.value;
  }

  /**
    * @dev Withdraw from collection incentive vault
    * todo Provide option where owner of collection can and can not have access to incentive vault?
  */
  function withdrawIncentiveCollectionAccount(address _contractAddress, uint256 _amount) external {
    uint256 collectionId = CollectionItem(CONTRACTS.collectionItem).getCllectionForContract(_contractAddress);
    Collection.CollectionDS memory collection = CollectionItem(CONTRACTS.collectionItem).getCollection(collectionId);
    // address collectionOwner = CollectionItem(CONTRACTS.collectionItem).getOwnerOfCollection(collectionId);

    require(collection.owner == msg.sender, "You are not the owner of this collection");
    require(collection.ownerIncentiveAccess == true, "You do not have access to withdraw");

    Bank(CONTRACTS.bank).updateCollectionIncentiveReward(_contractAddress, _amount, false);

    // todo ensure this is a safe way to transfer funds
    ( bool success, ) = payable(msg.sender).call{ value: _amount }("");
    require(success, "Collection commission reward transfer to user was unccessfull");
  }

  /**
    * @dev Deposit into marketplace incentive vault
  */
  function depositMarketplaceIncentiveVault() external payable {
    BALANCE_SHEET.incentiveVault += msg.value;
  }


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
    Bank(CONTRACTS.bank).addBank(msg.sender); // this is okay even if bank account already exists
  }

  /**
    * @dev Create verified collection
  */
  function createVerifiedCollection(
    string memory _name, address _contractAddress, uint256 _totalSupply, uint8 _reflection, uint8 _commission,
    address _owner, bool _ownerIncentiveAccess
  ) external onlyOwner() {
    // todo require _totalSupply to be > 0

    CollectionItem(CONTRACTS.collectionItem).createVerifiedCollection(
      _name, _contractAddress, _totalSupply, _reflection, _commission, _owner, _ownerIncentiveAccess
    );
    // Bank(CONTRACTS.bank).addBank(_contractAddress); // this is okay even if bank account already exists
    Bank(CONTRACTS.bank).initReflectionVaultCollectionAccount(_contractAddress, _totalSupply);
  }

  /**
    * @dev Create unvarivied collection
  */
  function createUnvariviedCollection(string memory _name) external onlyOwner() {
    // todo update so local address can be passed in
    /**uint256 id = */CollectionItem(CONTRACTS.collectionItem).createUnvariviedCollection(_name, msg.sender);
    Bank(CONTRACTS.bank).addBank(msg.sender); // this is okay even if bank account already exists

    // todo event of collection id?
  }


  /** 
    *****************************************************
    ***************** Public Functions ******************
    *****************************************************
  */
  /**
    * @dev Get list of contract address of oter contracts
  */
  function getContracts() external view returns (ContractsDS memory) {
    return CONTRACTS;
  }

  /**
    * @dev Get contract balance sheet
  */
  function getBalanceSheet() external view returns (BalanceSheetDS memory) {
    return BALANCE_SHEET;
  }


  /** 
    *****************************************************
    ************** Expose Child Functions ***************
    *****************************************************
  */
  /**
    * @dev Get sale
  */
  function getSale(uint256 _id) external view returns (SaleDS memory) {
    return _getSale(_id);
  }


  /** 
    *****************************************************
    ************** Nft Transfter Functions **************
    *****************************************************
  */
  function onERC721Received(address _operator, address _from, uint256 _tokenId, bytes calldata _data
  ) external override returns (bytes4) {
    emit onERC721ReceivedEvent(_operator, _from, _tokenId, _data);
    return bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"));
  }
  // function onERC1155Received(address _operator, address _from, uint256 id, uint256 value, bytes calldata _data
  // ) external returns (bytes4) {
  //   emit onERC1155ReceivedEvent(_operator, _from, id, value, _data);
  //   return bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"));
  // }
  // function onERC1155BatchReceived(address _operator, address _from, uint256[] calldata ids, uint256[] calldata values, bytes calldata _data
  // ) external returns (bytes4) {
  //   emit onERC1155BatchReceivedEvent(_operator, _from, ids, values, _data);
  //   return bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"));
  // }

}
