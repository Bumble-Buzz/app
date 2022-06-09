import Cors from 'cors';
import { ethers } from 'ethers';
import DynamoDbQuery from '@/components/backend/db/DynamoDbQuery';
import ENUM from '@/enum/ENUM';


export default async function handler(req, res) {
  const { id, contract, tokenId, limit, networkId } = req.query
  // console.log('api param:', id, contract, tokenId, limit);

  //check params
  if (!id) return res.status(400).json({ 'error': 'invalid request parameters' });

  const formattedOwner = ethers.utils.getAddress(id);
  const formattedTokenId = Number(tokenId);
  let formattedLimit = Number(limit);
  if (formattedLimit > 50) limit = 50;

  let exclusiveStartKey = undefined;
  if (id && contract && tokenId && Number.isInteger(formattedTokenId)) {
    const formattedContract = ethers.utils.getAddress(contract);
    exclusiveStartKey = { 'contractAddress': formattedContract, 'owner': formattedOwner, 'tokenId': formattedTokenId };
  }

  let formattedNetworkId = Number(networkId);
  if (!formattedNetworkId || formattedNetworkId <= 0) formattedNetworkId = Number(process.env.NEXT_PUBLIC_CHAIN_ID);
  const network = ENUM.NETWORKS.getNetworkById(formattedNetworkId);

  let payload = {
    TableName: network.tables.asset,
    IndexName: 'owner-gsi',
    ExpressionAttributeNames: { '#owner': 'owner', '#onSale': 'onSale' },
    ExpressionAttributeValues: { ':owner': formattedOwner, ':onSale': Number(0) },
    KeyConditionExpression: '#owner = :owner',
    FilterExpression: '#onSale = :onSale',
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
        [network.tables.collection]: {
          Keys: payloadKeys,
          ExpressionAttributeNames: { '#id': 'id', '#name': 'name' },
          ProjectionExpression: "#id, #name"
        }
      },
    };
    results = await DynamoDbQuery.item.getBatch(payload);
    const collections = results.Responses[network.tables.collection];
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
