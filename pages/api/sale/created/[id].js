import Cors from 'cors';
import { ethers } from 'ethers';
import DynamoDbQuery from '@/components/backend/db/DynamoDbQuery';


export default async function handler(req, res) {
  const { id, contract, tokenId, limit } = req.query
  // console.log('api param:', id, contract, tokenId, limit);

  //check params
  if (!id) return res.status(400).json({ 'error': 'invalid request parameters' });

  const formattedSeller = ethers.utils.getAddress(id);
  const formattedTokenId = Number(tokenId);
  let formattedLimit = Number(limit);
  if (formattedLimit > 50) limit = 50;
  
  let exclusiveStartKey = undefined;
  if (formattedSeller && contract && contract !== 'null' && Number.isInteger(formattedTokenId)) {
    const formattedContractAddress = ethers.utils.getAddress(contract);
    exclusiveStartKey = { 'contractAddress': formattedContractAddress, 'tokenId': formattedTokenId, 'seller': formattedSeller, 'active': 1 };
  }

  let payload = {
    TableName: "sale",
    IndexName: 'seller-gsi',
    ExpressionAttributeNames: { '#seller': 'seller', '#active': 'active', '#contractAddress': 'contractAddress', '#tokenId': 'tokenId', '#price': 'price' },
    ExpressionAttributeValues: { ':seller': formattedSeller, ':active': 1 },
    KeyConditionExpression: '#seller = :seller AND #active = :active',
    ProjectionExpression: "#contractAddress, #tokenId, #price",
    ExclusiveStartKey: exclusiveStartKey,
    Limit: formattedLimit || 10
  };
  let results = await DynamoDbQuery.item.query(payload);
  const {Items, LastEvaluatedKey, Count, ScannedCount} = results;

  // for each item, get unique list of collectionIds, and also return collection names
  if (Items.length > 0) {
    let assets = [];
    Items.forEach(item => assets.push({ contractAddress: item.contractAddress, tokenId: item.tokenId }));
    const payloadKeys = Object.values(assets).map(asset => ({'contractAddress': asset.contractAddress, 'tokenId': asset.tokenId}));
    payload = {
      RequestItems: {
        asset: {
          Keys: payloadKeys,
          ExpressionAttributeNames: { '#contractAddress': 'contractAddress', '#tokenId': 'tokenId', '#config': 'config', '#owner': 'owner' },
          ProjectionExpression: "#contractAddress, #tokenId, #config, #owner"
        }
      },
    };
    results = await DynamoDbQuery.item.getBatch(payload);
    const assetResults = results.Responses.asset;
    assetResults.forEach(asset => {
      Items.forEach(item => {
        if (item.contractAddress === asset.contractAddress && item.tokenId === asset.tokenId) {
          item['config'] = asset.config
          item['owner'] = asset.owner
        }
      });
    });
  }

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
