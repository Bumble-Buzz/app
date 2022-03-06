import Cors from 'cors';
// const { ethers } = require("hardhat");
import { ethers } from 'ethers';
import { getSession } from "next-auth/react";
import DynamoDbQuery from '../../../../components/backend/db/DynamoDbQuery';
import { RpcNode } from '../../../../components/backend/Rpc';
import CollectionItemAbi from '../../../../artifacts/contracts/collectionItem/CollectionItem.sol/CollectionItem.json';


const COLLECTION_TYPE = [ 'local', 'verified', 'unverified' ];

/**
 * @todo If we are unable to verify data on blockchain, then we need to be more creative.
 * We will need to use the databse to make sure when a collection is active, no one can modify it's main keys except
 * for the owner, or the admin.
**/
const checkBlockchain = async (collection) => {
  if (!RpcNode) { console.log('skipping blockchain check'); return true; }

  const provider = new ethers.providers.JsonRpcProvider(RpcNode);
  const contract = new ethers.Contract(process.env.NEXT_PUBLIC_COLLECTION_ITEM_CONTRACT_ADDRESS, CollectionItemAbi.abi, provider);
  const onChainData = await contract.getCollection(collection.id);

  const collectionType = Number(onChainData.collectionType);
  const isActive = Number(onChainData.active);
  return (
    collection.id === Number(onChainData.id) && collection.name === onChainData.name && collection.contractAddress === onChainData.contractAddress &&
    collection.owner === onChainData.owner && COLLECTION_TYPE[collectionType] === 'verified' && isActive === 0
  );
};

export default async function handler(req, res) {
  const session = await getSession({ req })
  const data = req.body;
  // console.log('req.body', data);

  // check parameters
  if (!data) return res.status(400).json({ 'error': 'invalid request parameters' });
  if (!session) return res.status(401).json({ 'error': 'not authenticated' });

  // @todo This can only be run locally at the moment. Once deployed on testnet/mainnet, this needs to run
  if (!(await checkBlockchain(data))) return res.status(400).json({ 'error': 'record not found on blockchain' });

  // ensure if id already exists, we don't overwrite the record
  const payload = {
    TableName: "collection",
    Item: {
      'id': data.id,
      'contractAddress': data.contractAddress,
      'name': data.name,
      'description': data.description,
      'totalSupply': data.totalSupply,
      'reflection': data.reflection,
      'commission': data.commission,
      'incentive': 0,
      'owner': data.owner,
      'collectionType': 'verified',
      'ownerIncentiveAccess': data.ownerIncentiveAccess,
      'category': data.category,
      'image': data.image,
      'active': 0
    },
    ExpressionAttributeNames: { '#id': 'id' },
    ExpressionAttributeValues: { ':id': data.id },
    ConditionExpression: "#id <> :id"
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
