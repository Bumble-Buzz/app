import Cors from 'cors';
import { ethers } from 'ethers';
import { getSession } from "next-auth/react";
import DynamoDbQuery from '@/components/backend/db/DynamoDbQuery';
import { RpcNode } from '@/components/backend/Rpc';
import ENUM from '@/enum/ENUM';
import CollectionItemAbi from '@bumblebuzz/contracts/artifacts/contracts/collectionItem/CollectionItem.sol/CollectionItem.json';


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
  return (
    collection.id === Number(onChainData.id) && collection.contractAddress === onChainData.contractAddress &&
    collection.owner === onChainData.owner && collection.ownerIncentiveAccess === onChainData.ownerIncentiveAccess
  );
};

export default async function handler(req, res) {
  const session = await getSession({ req });
  const data = req.body;
  // console.log('req.body', data);

  // check parameters
  if (!data) return res.status(400).json({ 'error': 'invalid request parameters' });
  if (!session) return res.status(401).json({ 'error': 'not authenticated' });
  if (session.user.id !== data.owner) return res.status(401).json({ 'error': 'not authenticated' });
  if (!data.id || !Number.isInteger(Number(data.id))) return res.status(400).json({ error: `collection id '${data.id}' is invalid` });

  // @todo This can only be run locally at the moment. Once deployed on testnet/mainnet, this needs to run
  if (!(await checkBlockchain(data))) return res.status(400).json({ 'error': 'record not found on blockchain' });

  let networkId = Number(data.networkId);
  if (!networkId || networkId <= 0) networkId = Number(process.env.NEXT_PUBLIC_CHAIN_ID);
  const network = ENUM.NETWORKS.getNetworkById(networkId);

  const payload = {
    TableName: network.tables.collection,
    Key: { 'id': Number(data.id) },
    ExpressionAttributeNames: { "#ownerIncentiveAccess": "ownerIncentiveAccess" },
    ExpressionAttributeValues: { ":ownerIncentiveAccess": data.ownerIncentiveAccess },
    UpdateExpression: `set #ownerIncentiveAccess = :ownerIncentiveAccess`
  };
  const results = await DynamoDbQuery.item.update(payload);
  const {Items, LastEvaluatedKey, Count, ScannedCount} = results;

  res.status(200).json({ Items, LastEvaluatedKey, Count, ScannedCount });
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
