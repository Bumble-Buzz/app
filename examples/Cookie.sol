// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.4;


contract Cookie {

  // suppose the deployed contract has a purpose
  function getFlavor() public pure returns (string memory flavor) {
    return "mmm ... chocolate chip";
  }
}
