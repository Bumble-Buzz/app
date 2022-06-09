import Cors from 'cors';
import { ethers } from 'ethers';
import DynamoDbQuery from '@/components/backend/db/DynamoDbQuery';
import ENUM from '@/enum/ENUM';


export default async function handler(req, res) {
  const { id, limit, tokenId, networkId } = req.query
  // console.log('api param:', id, tokenId, limit);

  //check params
  if (!id) return res.status(400).json({ invalid: id });

  const formattedCreator = ethers.utils.getAddress(id);
  const formattedTokenId = Number(tokenId);
  let formattedLimit = Number(limit);
  if (formattedLimit > 50) limit = 50;

  let exclusiveStartKey = undefined;
  if (id && tokenId && Number.isInteger(formattedTokenId)) {
    exclusiveStartKey = { 'contractAddress': process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS, 'creator': formattedCreator, 'tokenId': formattedTokenId };
  }

  let formattedNetworkId = Number(networkId);
  if (!formattedNetworkId || formattedNetworkId <= 0) formattedNetworkId = Number(process.env.NEXT_PUBLIC_CHAIN_ID);
  const network = ENUM.NETWORKS.getNetworkById(formattedNetworkId);

  let payload = {
    TableName: network.tables.asset,
    IndexName: 'creator-lsi',
    ExpressionAttributeNames: { '#contractAddress': 'contractAddress', '#creator': 'creator' },
    ExpressionAttributeValues: { ':contractAddress': process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS, ':creator': formattedCreator },
    KeyConditionExpression: '#contractAddress = :contractAddress AND #creator = :creator',
    ExclusiveStartKey: exclusiveStartKey,
    Limit: formattedLimit || 10
  };
  let results = await DynamoDbQuery.item.query(payload);
  const {Items, LastEvaluatedKey, Count, ScannedCount} = results;

  // for each item, get unique list of collectionIds, and also return collection names
  if (Items.length > 0) {
    let walletIds = {};
    Items.forEach(item => walletIds[item.owner] = item.owner);
    const payloadKeys = Object.values(walletIds).map(id => ({'walletId': id}));
    payload = {
      RequestItems: {
        [network.tables.user]: {
          Keys: payloadKeys,
          ExpressionAttributeNames: { '#walletId': 'walletId', '#name': 'name' },
          ProjectionExpression: "#walletId, #name"
        }
      },
    };
    results = await DynamoDbQuery.item.getBatch(payload);
    const users = results.Responses[network.tables.user];
    Items.forEach(item => {
      users.forEach(user => {
        if (item.owner === user.walletId) {
          item['ownerName'] = user.name
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
