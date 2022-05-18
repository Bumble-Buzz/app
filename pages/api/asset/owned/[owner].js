import Cors from 'cors';
import { ethers } from 'ethers';
import DynamoDbQuery from '@/components/backend/db/DynamoDbQuery';


export default async function handler(req, res) {
  const { owner, contract, tokenId, limit } = req.query
  // console.log('api param:', id, contract, tokenId, limit);

  //check params
  if (!owner) return res.status(400).json({ 'error': 'invalid request parameters' });
  if (!contract) return res.status(400).json({ 'error': 'invalid request parameters' });

  const formattedOwner = ethers.utils.getAddress(owner);
  const formattedContract = ethers.utils.getAddress(contract);
  const formattedTokenId = Number(tokenId);
  let formattedLimit = Number(limit);
  if (formattedLimit > 50) limit = 50;

  let exclusiveStartKey = undefined;
  if (owner && tokenId && Number.isInteger(formattedTokenId)) {
    exclusiveStartKey = { 'contractAddress': formattedContract, 'owner': formattedOwner, 'tokenId': formattedTokenId };
  }

  let payload = {
    TableName: "local_asset",
    IndexName: 'owner-lsi',
    ExpressionAttributeNames: { '#contractAddress': 'contractAddress', '#owner': 'owner' },
    ExpressionAttributeValues: { ':contractAddress': formattedContract, ':owner': formattedOwner },
    KeyConditionExpression: '#contractAddress = :contractAddress AND #owner = :owner',
    ExclusiveStartKey: exclusiveStartKey,
    Limit: formattedLimit || 10
  };
  let results = await DynamoDbQuery.item.query(payload);
  const {Items, LastEvaluatedKey, Count, ScannedCount} = results;

  // for each item, get unique list of collectionIds, and also return collection names
  if (Items.length > 0) {
    let collectionIds = {};
    Items.forEach(item => collectionIds[item.collectionId] = item.collectionId);
    const payloadKeys = Object.values(collectionIds).map(id => ({'id': id}));
    payload = {
      RequestItems: {
        local_collection: {
          Keys: payloadKeys,
          ExpressionAttributeNames: { '#id': 'id', '#name': 'name' },
          ProjectionExpression: "#id, #name"
        }
      },
    };
    results = await DynamoDbQuery.item.getBatch(payload);
    const collections = results.Responses.local_collection;
    collections.forEach(collection => {
      Items.forEach(item => {
        if (item.collectionId === collection.id) {
          item['collectionName'] = collection.name
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
