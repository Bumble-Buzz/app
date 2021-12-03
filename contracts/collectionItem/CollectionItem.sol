// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.4 <0.9.0;

import '@openzeppelin/contracts/access/Ownable.sol';

import "./Collection.sol";
import "./Item.sol";

import "hardhat/console.sol";


contract CollectionItem is Collection, Item, Ownable {

  // modifiers
  modifier onlyOwnerCollectionOwner(address _collectionOwner) {
    require(
      (owner() == _msgSender()) || (_collectionOwner == _msgSender()),
      "Caller is not the owner or collection owner"
    );
    _;
  }
  modifier checkCollectionItem(uint256 _id) {
    require(_collectionItemExists(_id), "The collection item does not exist");
    _;
  }
  modifier checkCollectionItemId(uint256 _id, uint256 _itemId) {
    require(_collectionItemIdExists(_id, _itemId), "The collection item id does not exist");
    _;
  }

  // enums

  // data structures

  // state variables
  mapping(uint256 => uint256[]) private COLLECTION_ITEMS; // mapping collection id to list of item ids


  /**
    * @dev Check if collection item exists
  */
  function _collectionItemExists(uint256 _id) private view returns (bool) {
    if (COLLECTION_ITEMS[_id].length > 0) {
      return true;
    }
    return false;
  }

  /**
    * @dev Check if collection item id exists
    * todo is this redundant? do we really need this check?
  */
  function _collectionItemIdExists(uint256 _id, uint256 _itemId) private view returns (bool) {
    uint256[] memory  collectionItem = COLLECTION_ITEMS[_id];
    for (uint256 i = 0; i < collectionItem.length; i++) {
      if (collectionItem[i] == _itemId) {
        return true;
      }
    }
    return false;
  }


  constructor() {
    // create collections
    _createUnvariviedCollection('Unverified');
  }

  /**
    * @dev Calculate percent change
  */
  function _calculatePercentChange(uint256 _value, uint8 _percent) private pure returns (uint256) {
    return (_value * _percent / 100);
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
    * @dev Add item to collection
  */
  function addItemToCollection(
    uint256 _tokenId, address _contractAddress, address _seller, address _buyer, uint256 _price
  ) public onlyOwner() returns (uint256) {
    uint256 collectionId = _getCllectionForContract(_contractAddress);
    if (collectionId == 0) {
      // this means this is an unvarified item, so we will use the unvarified collection
      collectionId = UNVERIFIED_COLLECTION_ID;
    }

    uint8 commission = 0;
    address creator = address(0);
    COLLECTION_TYPE collectionType = _getCollectionType(collectionId);
    if (collectionType == COLLECTION_TYPE.local) {
      // todo fetch this information from the local nvt contract
      commission = 2; // fetch commission from nft contract
      creator = address(this); // fetch creator from nft contract
    }

    uint256 itemId = _addItem(
                        collectionId,
                        _tokenId,
                        _contractAddress,
                        _seller,
                        _buyer,
                        _price,
                        commission,
                        creator
                      );
    _addItemIdInCollection(collectionId, itemId);
    return itemId;
  }

  /**
    * @dev Cancel item that is currently on sale
  */
  function cancelItemInCollection(uint256 _tokenId, address _contractAddress, address _owner) public onlyOwner() {
    uint256 itemId = _getItemId(_tokenId, _contractAddress, _owner);
    uint256 collectionId = _getItemCollectionId(itemId);
    require(_collectionItemIdExists(collectionId, itemId), "Collection or item does not exist");

    _deactivateItem(itemId);
    _removeItemIdInCollection(collectionId, itemId);
  }

  /**
    * @dev Mark item sold in collection
  */
  function markItemSoldInCollection(uint256 _tokenId, address _contractAddress, address _owner) public onlyOwner() {
    uint256 itemId = _getItemId(_tokenId, _contractAddress, _owner);
    uint256 collectionId = _getItemCollectionId(itemId);
    require(_collectionItemIdExists(collectionId, itemId), "Collection or item does not exist");

    _markItemSold(itemId);
    _removeItemIdInCollection(collectionId, itemId);
  }

  // /**
  //   * @dev Handle collection reflection rewards
  // */
  // function handleReflectionRewards(uint256 _tokenId, address _contractAddress, address _owner, uint256 _price) public onlyOwner() {
  //   uint256 itemId = _getItemId(_tokenId, _contractAddress, _owner);

  //   uint256 collectionReflectionReward = getCollectionReflectionReward(_tokenId, _contractAddress, _owner, _price);
  //   if (collectionReflectionReward > 0) {
  //     distributeCollectionReflectionReward(itemId, collectionReflectionReward);
  //   }
  // }

  // /**
  //   * @dev Handle collection incentive rewards
  // */
  // function handleIncentiveRewards(uint256 _tokenId, address _contractAddress, address _owner) public onlyOwner() {
  //   uint256 itemId = _getItemId(_tokenId, _contractAddress, _owner);
  //   uint256 collectionId = _getItemCollectionId(itemId);

  //   uint256 collectionIncentiveReward = getCollectionIncentiveReward(_tokenId, _contractAddress, _owner);
  //   if (collectionIncentiveReward > 0) {
  //     _decreaseCollectionIncentiveReward(collectionId, collectionIncentiveReward);
  //   }
  // }

  /**
    * @dev Handle collection reflection token reward
  */
  function claimReflectionTokenReward(uint256 _tokenId, address _contractAddress) public onlyOwner() returns (uint256) {
    // todo caller must be admin or collection owner

    uint256 reward = getCollectionReflectionTokenReward(_tokenId, _contractAddress);
    if (reward > 0) {
      _updateCollectionReflectionTokenReward(_tokenId, _contractAddress, 0);

      // todo use tokeId to check the owner from nft contract. Compare with this owner
      address owner = msg.sender;
      // todo ensure this is a safe way to transfer funds
      ( bool success, ) = payable(owner).call{ value: reward }("");
      require(success, "Collection reflection reward transfer to user was unccessfull");
    }
    return reward;
  }

  // /**
  //   * @dev Calculate nft commission reward
  // */
  // function getNftCommissionReward(uint256 _tokenId, address _contractAddress, address _owner, uint256 _price) public view returns (uint256) {
  //   uint256 itemId = _getItemId(_tokenId, _contractAddress, _owner);

  //   uint8 percent = _getItemCommission(itemId);
  //   return _calculatePercentChange(_price, percent);
  // }

  // /**
  //   * @dev Calculate collection commission reward
  // */
  // function getCollectionCommissionReward(uint256 _tokenId, address _contractAddress, address _owner, uint256 _price) public view returns (uint256) {
  //   uint256 itemId = _getItemId(_tokenId, _contractAddress, _owner);
  //   uint256 collectionId = _getItemCollectionId(itemId);

  //   uint8 percent = _getCollectionCommission(collectionId);
  //   return _calculatePercentChange(_price, percent);
  // }

  // /**
  //   * @dev Calculate collection reflection reward
  // */
  // function getCollectionReflectionReward(uint256 _tokenId, address _contractAddress, address _owner, uint256 _price) public view returns (uint256) {
  //   uint256 itemId = _getItemId(_tokenId, _contractAddress, _owner);
  //   uint256 collectionId = _getItemCollectionId(itemId);

  //   uint8 percent = _getCollectionReflection(collectionId);
  //   return _calculatePercentChange(_price, percent);
  // }

  /**
    * @dev Distribute collection reflection reward
  */
  function distributeCollectionReflectionReward(uint256 _collectionId, uint256 _reflectionReward) public {
    // uint256 collectionId = _getItemCollectionId(_itemId);
    // require(_collectionItemIdExists(collectionId, _itemId), "Collection or item does not exist");

    // if (collectionId == 0) {
    //   collectionId = UNVERIFIED_COLLECTION_ID;
    // }
    COLLECTION_TYPE collectionType = _getCollectionType(_collectionId);
    if (collectionType == COLLECTION_TYPE.verified) {
      uint256 totalSupply = _getCollectionTotalSupply(_collectionId);
      uint256 reflectionRewardPerItem = _reflectionReward / totalSupply;
      _increaseCollectionReflectionVault(_collectionId, reflectionRewardPerItem);
    }
  }

  /**
    * @dev Get collection reflection token reward
  */
  function getCollectionReflectionTokenReward(uint256 _tokenId, address _contractAddress) public view returns (uint256) {
    uint256 collectionId = _getCllectionForContract(_contractAddress);
    if (collectionId == 0) {
      collectionId = UNVERIFIED_COLLECTION_ID;
    }
    COLLECTION_TYPE collectionType = _getCollectionType(collectionId);
    if (collectionType != COLLECTION_TYPE.verified) {
      revert("This NFT can not collect reflection rewards");
    }

    uint256 vaultIndex = _tokenId - 1;
    return _getCollectionReflectionVaultIndex(collectionId, vaultIndex);
  }

  /**
    * @dev Update collection reflection reward for item from vault
    * @custom:return-type private
  */
  function _updateCollectionReflectionTokenReward(uint256 _tokenId, address _contractAddress, uint256 _newVal) public onlyOwner() {
    uint256 collectionId = _getCllectionForContract(_contractAddress);
    if (collectionId == 0) {
      collectionId = UNVERIFIED_COLLECTION_ID;
    }
    COLLECTION_TYPE collectionType = _getCollectionType(collectionId);
    if (collectionType != COLLECTION_TYPE.verified) {
      revert("This NFT can not deduct reflection rewards");
    }

    uint256 vaultIndex = _tokenId - 1;
    _updateCollectionReflectionVaultIndex(collectionId, vaultIndex, _newVal);
  }

  /**
    * @dev Set collection incentive percentage
  */
  function _setCollectionIncentive(uint256 _collectionId, uint8 _incentive) public checkCollection(_collectionId) {
    COLLECTION_TYPE collectionType = _getCollectionType(_collectionId);
    if (collectionType == COLLECTION_TYPE.verified) {
      _updateCollectionIncentive(_collectionId, _incentive);
    }
  }

  /**
    * @dev Calculate collection incentive reward
  */
  function getCollectionIncentiveReward(uint256 _tokenId, address _contractAddress, address _owner) public view returns (uint256) {
    uint256 itemId = _getItemId(_tokenId, _contractAddress, _owner);
    uint256 collectionId = _getItemCollectionId(itemId);

    uint256 incentiveVault = _getCollectionIncentiveVault(collectionId);
    uint8 percent = _getCollectionIncentive(collectionId);
    return _calculatePercentChange(incentiveVault, percent);
  }

  /**
    * @dev Update collection incentive reward
  */
  function _updateCollectionIncentiveReward(uint256 _collectionId, uint256 _value, bool _increase) public checkCollection(_collectionId) {
    // todo caller must be admin or collection owner

    COLLECTION_TYPE collectionType = _getCollectionType(_collectionId);
    if (collectionType == COLLECTION_TYPE.verified) {
      uint256 incentiveVault = _getCollectionIncentiveVault(_collectionId);
      if (_increase) {
        uint256 newIncentiveVault = incentiveVault + _value;
        _updateCollectionIncentiveVault(_collectionId, newIncentiveVault);
      } else {
        require(incentiveVault > _value, "Passed in value must be greater than vault balance");
        uint256 newIncentiveVault = incentiveVault - _value;
        _updateCollectionIncentiveVault(_collectionId, newIncentiveVault);
      }
    }
  }

  // /**
  //   * @dev Increase collection incentive reward
  //   * @custom:return-type private
  // */
  // function _increaseCollectionIncentiveReward(uint256 _collectionId, uint256 _value) public checkCollection(_collectionId) {
  //   COLLECTION_TYPE collectionType = _getCollectionType(_collectionId);
  //   if (collectionType == COLLECTION_TYPE.verified) {
  //     uint256 incentiveVault = _getCollectionIncentiveVault(_collectionId);
  //     uint256 newIncentiveVault = incentiveVault + _value;
  //     _updateCollectionIncentiveVault(_collectionId, newIncentiveVault);
  //   }
  // }

  // /**
  //   * @dev Decrease collection incentive reward
  //   * @custom:return-type private
  // */
  // function _decreaseCollectionIncentiveReward(uint256 _collectionId, uint256 _value) public checkCollection(_collectionId) {
  //   COLLECTION_TYPE collectionType = _getCollectionType(_collectionId);
  //   if (collectionType == COLLECTION_TYPE.verified) {
  //     uint256 incentiveVault = _getCollectionIncentiveVault(_collectionId);
  //     if (incentiveVault > _value) {
  //       uint256 newIncentiveVault = incentiveVault - _value;
  //       _updateCollectionIncentiveVault(_collectionId, newIncentiveVault);
  //     }
  //   }
  // }

  /**
    * @dev Deposit funds into the inventive vault
  */
  function depositCollectionIncentiveVault(uint256 _collectionId) public payable checkCollection(_collectionId) {
    // todo check if msg.sender is the owner of this collection

    _updateCollectionIncentiveReward(_collectionId, msg.value, true);
  }

  /**
    * @dev Withdraw funds from the inventive vault
  */
  function withdrawCollectionIncentiveVault(uint256 _collectionId, uint256 _value) public returns (uint256) {
    // todo check if msg.sender is the owner of this collection

    uint256 initialVaultState = _getCollectionIncentiveVault(_collectionId);
    _updateCollectionIncentiveReward(_collectionId, _value, false);
    uint256 afterVaultState = _getCollectionIncentiveVault(_collectionId);

    if ((initialVaultState - _value) == afterVaultState) {
      // todo use tokeId to check the owner from nft contract. Compare with this owner
      address owner = msg.sender;
      // todo ensure this is a safe way to transfer funds
      ( bool success, ) = payable(owner).call{ value: _value }("");
      require(success, "Collection incentive vault transfer was unccessfull");
    }
    return _value;
    // todo 
  }


  /** 
    *****************************************************
    *********** COLLECTION_ITEMS Functions *************
    *****************************************************
  */
  /**
    * @dev Add a new collection id (if necessary) and add item id to the array
  */
  function _addItemIdInCollection(uint256 _id, uint256 _itemId) public {
    COLLECTION_ITEMS[_id].push(_itemId);
  }

  /**
    * @dev Get item ids for the given collection
  */
  function _getItemIdsInCollection(uint256 _id) public view returns (uint256[] memory) {
    return COLLECTION_ITEMS[_id];
  }

  /**
    * @dev Remove an item in collection
  */
  function _removeItemIdInCollection(uint256 _id, uint256 _itemId) public {
    uint256 arrLength = COLLECTION_ITEMS[_id].length - 1;
    uint256[] memory data = new uint256[](arrLength);
    uint8 dataCounter = 0;
    for (uint256 i = 0; i < COLLECTION_ITEMS[_id].length; i++) {
      if (COLLECTION_ITEMS[_id][i] != _itemId) {
        data[dataCounter] = COLLECTION_ITEMS[_id][i];
        dataCounter++;
      }
    }
    COLLECTION_ITEMS[_id] = data;
  }

  /**
    * @dev Remove the collection item
  */
  function _removeCollectionItem(uint256 _id) public {
    delete COLLECTION_ITEMS[_id];
  }


  /** 
    *****************************************************
    ************* Public Getter Functions ***************
    *****************************************************
  */

  /**
    * @dev Get all item ids in collection
  */
  function _getItemsInCollection(uint256 _id) public view checkCollection(_id) returns (ItemDS[] memory) {
    uint256[] memory itemsIds = _getItemIdsInCollection(_id);
    return _getItems(itemsIds);
  }

  /**
    * @dev Get item id given token id and contract address
  */
  function _getItemId(uint256 _tokenId, address _contractAddress, address _owner) public view returns (uint256) {
    uint256[] memory itemIds = _getItemsForOwner(_owner);
    uint256 itemId = 0;
    for (uint256 i = 0; i < itemIds.length; i++) {
      if (_getItemTokenId(itemIds[i]) == _tokenId && _getItemContractAddress(itemIds[i]) == _contractAddress) {
        itemId = itemIds[i];
      }
    }
    require(_doesItemExist(itemId), "The item does not exist");
    require(_isSellerTheOwner(itemId, _owner), "This user is not the owner of the item");
    return itemId;
  }

  /**
    * @dev Get owner of collection
  */
  function _getOwnerOfCollection(uint256 _collectionId) public view checkCollection(_collectionId) returns (address) {
    return _getCollectionOwner(_collectionId);
  }

  /**
    * @dev Get owner of collection for this item
  */
  function _getOwnerOfItemCollection(uint256 _itemId) public view returns (address) {
    uint256 collectionId = _getItemCollectionId(_itemId);
    _doesCollectionExist(collectionId);
    require(_collectionItemIdExists(collectionId, _itemId), "Collection or item does not exist");

    return _getCollectionOwner(collectionId);
  }

  /**
    * @dev Get creator of this item
  */
  function _getCreatorOfItem(uint256 _itemId) public view checkItem(_itemId) returns (address) {
    return _getItemCreator(_itemId);
  }


  /** 
    *****************************************************
    ************** Expose Child Functions ***************
    *****************************************************
  */

  // Collection.sol
  /**
    * @dev Create local collection
  */
  function createLocalCollection(string memory _name, address _contractAddress) public onlyOwner() {
    // todo update so local address can be passed in
    _createLocalCollection(_name, _contractAddress);
  }

  /**
    * @dev Create verified collection
  */
  function createVerifiedCollection(
    string memory _name, address _contractAddress, uint256 _totalSupply, uint8 _reflection, uint8 _commission, address _owner
  ) public onlyOwner() {
    _createVerifiedCollection(_name, _contractAddress, _totalSupply, _reflection, _commission, _owner);
  }

  /**
    * @dev Create unvarivied collection
  */
  function createUnvariviedCollection(string memory _name) public onlyOwner() {
    // todo update so local address can be passed in
    _createUnvariviedCollection(_name);
  }

  /**
    * @dev Get collection
  */
  function getCollection(uint256 _collectionId) external view returns (CollectionDS memory) {
    return _getCollection(_collectionId);
  }

  /**
    * @dev Get collection
  */
  function getCollectionType(uint256 _collectionId) external view returns (COLLECTION_TYPE) {
    return _getCollectionType(_collectionId);
  }

  /**
    * @dev Get collection
  */
  function getCollectionIncentive(uint256 _collectionId) external view returns (uint8) {
    return _getCollectionIncentive(_collectionId);
  }

  /**
    * @dev Get collection
  */
  function getCollectionIncentiveVault(uint256 _collectionId) external view returns (uint256) {
    return _getCollectionIncentiveVault(_collectionId);
  }

  /**
    * @dev Update collection
  */
  function updateCollection(
    uint256 _id, string memory _name, address _contractAddress, uint8 _reflection, uint8 _commission,
    uint8 _incentive, address _owner
  ) external {
    // todo if collectionType == unverified / local, only admin can update
    // todo if collectionType == verified, only collection owner can update

    return _updateCollection(_id, _name, _contractAddress, _reflection, _commission, _incentive, _owner);
  }

  /**
    * @dev Get collection commission
  */
  function getCollectionCommission(uint256 _collectionId) external view returns (uint8) {
    return _getCollectionCommission(_collectionId);
  }

  /**
    * @dev Get collection reflection
  */
  function getCollectionReflection(uint256 _collectionId) external view returns (uint8) {
    return _getCollectionReflection(_collectionId);
  }

  /**
    * @dev Activate collection
  */
  function activateCollection(uint256 _collectionId) external onlyOwner() {
    return _activateCollection(_collectionId);
  }

  /**
    * @dev Deactivate collection
  */
  function deactivateCollection(uint256 _collectionId) external onlyOwner() {
    return _deactivateCollection(_collectionId);
  }

  /**
    * @dev Get active collection ids
  */
  function getActiveCollectionIds() external view returns (uint256[] memory) {
    return _getActiveCollectionIds();
  }

  /**
    * @dev Get local collection ids
  */
  function getLocalCollectionIds() external view returns (uint256[] memory) {
    return _getLocalCollectionIds();
  }

  /**
    * @dev Get verified collection ids
  */
  function getVerifiedCollectionIds() external view returns (uint256[] memory) {
    return _getVerifiedCollectionIds();
  }

  /**
    * @dev Get unverified collection ids
  */
  function getUnverifiedCollectionIds() external view returns (uint256[] memory) {
    return _getUnverifiedCollectionIds();
  }

  /**
    * @dev Get collection ids
  */
  function getCollectionIds() external view returns (CollectionIdDS memory) {
    return _getCollectionIds();
  }

  /**
    * @dev Get collections for owner
  */
  function getCollectionsForOwner(address _owner) external view returns (uint256[] memory) {
    return _getCollectionsForOwner(_owner);
  }

  /**
    * @dev Get collection reflection vault
  */
  function getCollectionReflectionVault(uint256 _id) external view returns (uint256[] memory) {
    return _getCollectionReflectionVault(_id);
  }

  /**
    * @dev Get collection reflection vault index
  */
  function getCollectionReflectionVaultIndex(uint256 _id, uint256 _index) external view returns (uint256) {
    return _getCollectionReflectionVaultIndex(_id, _index);
  }

  /**
    * @dev Get collection for given contract address
  */
  function getCllectionForContract(address _contract) external view returns (uint256) {
    return _getCllectionForContract(_contract);
  }


  // Item.sol
  /**
    * @dev Get item
  */
  function getItem(uint256 _itemId) external view returns (ItemDS memory) {
    return _getItem(_itemId);
  }

  /**
    * @dev Get items
  */
  function getItems(uint256[] memory _itemIds) external view returns (ItemDS[] memory) {
    return _getItems(_itemIds);
  }

  /**
    * @dev Get all items
  */
  function getAllItems() external view returns (ItemDS[] memory) {
    return _getAllItems();
  }

  /**
    * @dev Deactivate item
  */
  function activateItem(uint256 _itemId) external onlyOwner() {
    return _activateItem(_itemId);
  }

  /**
    * @dev Activate item
  */
  function deactivateItem(uint256 _itemId) external onlyOwner() {
    return _deactivateItem(_itemId);
  }

  /**
    * @dev Get items for owner
  */
  function getItemsForOwner() external view onlyOwner() returns (uint256[] memory) {
    return _getItemsForOwner(msg.sender);
  }

  /**
    * @dev Get item commission
  */
  function getItemCommission(uint256 _itemId) external view returns (uint8) { 
    return _getItemCommission(_itemId);
  }

  /**
    * @dev Get item collection id
  */
  function getItemCollectionId(uint256 _itemId) external view returns (uint256) { 
    return _getItemCollectionId(_itemId);
  }

}
