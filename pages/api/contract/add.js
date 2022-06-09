import Cors from 'cors';
import { ethers } from 'ethers';
import { getSession } from "next-auth/react";
import DynamoDbQuery from '@/components/backend/db/DynamoDbQuery';
import { RpcNode } from '@/components/backend/Rpc';
import ENUM from '@/enum/ENUM';
import IERC721Abi from '@bumblebuzz/contracts/artifacts/@openzeppelin/contracts/token/ERC721/IERC721.sol/IERC721.json';

const ERC_20_INTERFACE_ID = '0x36372b07';
const ERC_165_INTERFACE_ID = '0x01ffc9a7';
const ERC_721_INTERFACE_ID = '0x80ac58cd';
const ERC_1155_INTERFACE_ID = '0xd9b67a26';


/**
 * @todo If we are unable to verify data on blockchain, then we need to be more creative.
 * We will need to use the databse to make sure when a collection is active, no one can modify it's main keys except
 * for the owner, or the admin.
**/
const checkLocal = async (data) => {
  return (ethers.utils.getAddress(data.contractAddress) === ethers.utils.getAddress(process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS));
};

const checkErc721 = async (data) => {
  if (!RpcNode) { console.log('skipping blockchain check'); return true; }

  const provider = new ethers.providers.JsonRpcProvider(RpcNode);
  const contract = new ethers.Contract(ethers.utils.getAddress(data.contractAddress), IERC721Abi.abi, provider);
  const onChainData = await contract.callStatic.supportsInterface(ERC_721_INTERFACE_ID);

  return onChainData;
};

const checkErc1155 = async (data) => {
  if (!RpcNode) { console.log('skipping blockchain check'); return true; }

  const provider = new ethers.providers.JsonRpcProvider(RpcNode);
  const contract = new ethers.Contract(ethers.utils.getAddress(data.contractAddress), IERC721Abi.abi, provider);
  const onChainData = await contract.callStatic.supportsInterface(ERC_1155_INTERFACE_ID);

  return onChainData;
};

export default async function handler(req, res) {
  const session = await getSession({ req })
  const data = req.body;
  // console.log('req.body', data);

  // check parameters
  if (!data) return res.status(400).json({ 'error': 'invalid request parameters' });
  if (!session) return res.status(401).json({ 'error': 'not authenticated' });

  // @todo This can only be run locally at the moment. Once deployed on testnet/mainnet, this needs to run
  let contractType;
  const isLocal = await checkLocal(data);
  if (isLocal) contractType = 1;
  if (!isLocal) {
    const isErc721 = await checkErc721(data);
    if (isErc721) contractType = 721;
    if (!isErc721) {
      const isErc1155 = await checkErc1155(data);
      if (isErc1155) contractType = 1155;
    }
  }
  if (!contractType) return res.status(400).json({ 'error': 'contract address is not valid' });

  // process contract address: go through all tokens and create asset records in db
  // 0===do not process this contract address, 1===process this contract address
  const processContract = (contractType === 1) ? 0 : 1;

  let networkId = Number(data.networkId);
  if (!networkId || networkId <= 0) networkId = Number(process.env.NEXT_PUBLIC_CHAIN_ID);
  const network = ENUM.NETWORKS.getNetworkById(networkId);

  // ensure if id already exists, we don't overwrite the record
  const payload = {
    TableName: network.tables.contract,
    Item: {
      'contractAddress': ethers.utils.getAddress(data.contractAddress),
      'type': Number(contractType),
      'isVerified': 1,
      'isProcessed': Number(processContract)
    },
    ExpressionAttributeNames: { '#contractAddress': 'contractAddress' },
    ExpressionAttributeValues: { ':contractAddress': data.contractAddress },
    ConditionExpression: "#contractAddress <> :contractAddress"
  };
  await DynamoDbQuery.item.put(payload);

  res.status(200).json({ 'status': 'success' });
};


// Initializing the cors middleware
const cors = Cors({
  methods: ['GET', 'HEAD'],
});
    
// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })

    
  })
};
