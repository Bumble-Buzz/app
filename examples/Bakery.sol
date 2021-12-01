// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.4;

import './Cookie.sol';

contract Bakery {

  // index of created contracts
  address[] private contracts;

  // useful to know the row count in contracts index
  function getContractCount() public view returns (uint256) {
    return contracts.length;
  }

  function getContracts() public view returns (address[] memory) {
    return contracts;
  }

  // deploy a new contract
  function newCookie() public returns (address newContract) {
    Cookie c = new Cookie();
    contracts.push(address(c));
    return address(c);
  }

  function callCookieFunc() public view returns (string memory flavor) {
    Cookie c = Cookie(contracts[0]);
    return c.getFlavor();
  }

}
