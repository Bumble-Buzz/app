import Cors from 'cors';
import { ethers } from 'ethers';
import DynamoDbQuery from '@/components/backend/db/DynamoDbQuery';
import ENUM from '@/enum/ENUM';


export default async function handler(req, res) {
  const { type, contract, limit, networkId } = req.query
  // console.log('api param:', id, contract, tokenId, limit);

  //check params
  if (!type) return res.status(400).json({ 'error': 'invalid request parameters' });

  const formattedType = Number(type);
  let formattedLimit = Number(limit);
  if (formattedLimit > 50) limit = 50;
  
  let exclusiveStartKey = undefined;
  if (contract && Number.isInteger(formattedType)) {
    const formattedContract = ethers.utils.getAddress(contract);
    exclusiveStartKey = { 'contractAddress': formattedContract, 'type': formattedType };
  }

  let formattedNetworkId = Number(networkId);
  if (!formattedNetworkId || formattedNetworkId <= 0) formattedNetworkId = Number(process.env.NEXT_PUBLIC_CHAIN_ID);
  const network = ENUM.NETWORKS.getNetworkById(formattedNetworkId);

  let payload = {
    TableName: network.tables.contract,
    IndexName: 'type-gsi',
    ExpressionAttributeNames: { '#type': 'type' },
    ExpressionAttributeValues: { ':type': formattedType, },
    KeyConditionExpression: '#type = :type',
    ExclusiveStartKey: exclusiveStartKey,
    Limit: formattedLimit || 10
  };
  let results = await DynamoDbQuery.item.query(payload);
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
