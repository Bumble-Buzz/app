// import { ethers } from 'ethers';
const ethers = require('ethers').ethers;
// const rpc = require('../components/backend/Rpc');
const AvaxTradeNftAbi = require('../artifacts/contracts/AvaxTradeNft.sol/AvaxTradeNft.json');

// const RPC_NODE = rpc.RpcNode;
const RPC_NODE = 'https://aurora-testnet.infura.io/v3/a6cd767193e8444b8e43e28b7a7267d6';
const NFT_CONTRACT_ADDRESS = '0xfeCB87A6aEf57A16234d1e0A1E5d11364734a31F';
const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';
const WALLET_ADDRESS = '0xdA121aB48c7675E4F25E28636e3Efe602e49eec6';


const main = async () => {
  console.log('start');
  if (!RPC_NODE) { console.log('skipping blockchain check'); return true; }

  const provider = new ethers.providers.JsonRpcProvider(RPC_NODE);
  const contract = new ethers.Contract(ethers.utils.getAddress(NFT_CONTRACT_ADDRESS), AvaxTradeNftAbi.abi, provider);
  // const onChainData = await contract.ownerOf(Number(data.tokenId));

  console.log('1');
  await new Promise(async (resolve, reject) => {
    const listener = async (owner, tokenId) => {
      console.log('found create event: ', owner, tokenId.toNumber());
      // if (owner === WALLET_ADDRESS) {
      //   resolve();
      //   contract.off("onNftMint", listener);
      // }
    };
    console.log('2');
    contract.on("onNftMint", listener);
    console.log('3');
  });
  console.log('end');
};


main();
