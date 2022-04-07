import Cors from 'cors';
import { ethers } from 'ethers';
import DynamoDbQuery from '@/components/backend/db/DynamoDbQuery';


export default async function handler(req, res) {
  const { id, limit, tokenId } = req.query
  // console.log('api param:', id, tokenId, limit);

  //check params
  if (!id) return res.status(400).json({ invalid: id });
  const checkSumId = ethers.utils.getAddress(id);

  let exclusiveStartKey = undefined;
  if (id && tokenId && Number.isInteger(Number(tokenId))) {
    exclusiveStartKey = { 'contractAddress': process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS, 'creator': checkSumId, 'tokenId': Number(tokenId) };
  }

  let payload = {
    TableName: "asset",
    IndexName: 'creator-lsi',
    ExpressionAttributeNames: { '#contractAddress': 'contractAddress', '#creator': 'creator' },
    ExpressionAttributeValues: { ':contractAddress': process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS, ':creator': checkSumId },
    KeyConditionExpression: '#contractAddress = :contractAddress AND #creator = :creator',
    ExclusiveStartKey: exclusiveStartKey,
    Limit: Number(limit) || 10
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
        users: {
          Keys: payloadKeys,
          ExpressionAttributeNames: { '#walletId': 'walletId', '#name': 'name' },
          ProjectionExpression: "#walletId, #name"
        }
      },
    };
    results = await DynamoDbQuery.item.getBatch(payload);
    const users = results.Responses.users;
    Items.forEach(item => {
      users.forEach(user => {
        if (item.owner === user.walletId) {
          item['ownerName'] = user.name
        }
      });
    });
    // users.forEach(users => {
    //   Items.forEach(item => {
    //     if (item.collectionId === users.id) {
    //       item['collectionName'] = users.name
    //     }
    //   });
    // });
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
