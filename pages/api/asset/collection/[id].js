import Cors from 'cors';
import { ethers } from 'ethers';
import DynamoDbQuery from '@/components/backend/db/DynamoDbQuery';


export default async function handler(req, res) {
  const { id, contract, tokenId, limit } = req.query
  // console.log('api param:', id, contract, tokenId, limit);

  //check params
  if (!id || !Number.isInteger(Number(id))) return res.status(400).json({ error: `collection id '${id}' is invalid` });

  const formattedCollectionId = Number(id);
  const formattedTokenId = Number(tokenId);
  let formattedLimit = Number(limit);
  if (formattedLimit > 50) limit = 50;
  
  let exclusiveStartKey = undefined;
  if (contract && tokenId && Number.isInteger(formattedTokenId)) {
    const formattedContract = ethers.utils.getAddress(contract);
    exclusiveStartKey = {
      'contractAddress': formattedContract, 'tokenId': formattedTokenId, 'collectionId': formattedCollectionId
    };
  }

  let payload = {
    TableName: "local_asset",
    IndexName: 'collectionId-gsi',
    ExpressionAttributeNames: { '#collectionId': 'collectionId' },
    ExpressionAttributeValues: { ':collectionId': formattedCollectionId },
    KeyConditionExpression: '#collectionId = :collectionId',
    ExclusiveStartKey: exclusiveStartKey,
    Limit: formattedLimit || 10
  };
  let results = await DynamoDbQuery.item.query(payload);
  const {Items, LastEvaluatedKey, Count, ScannedCount} = results;

  // for item, also include owner alias and creator alias if available
  if (Items.length > 0) {
    let walletIds = {};
    Items.forEach(item => walletIds[item.owner] = item.owner);
    const userPayloadKeys = Object.values(walletIds).map(id => ({'walletId': id}));
    payload = {
      RequestItems: {
        local_user: {
          Keys: userPayloadKeys,
          ExpressionAttributeNames: { '#walletId': 'walletId', '#name': 'name' },
          ProjectionExpression: "#walletId, #name"
        }
      }
    };
    results = await DynamoDbQuery.item.getBatch(payload);
    const users = results.Responses.local_user;
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
