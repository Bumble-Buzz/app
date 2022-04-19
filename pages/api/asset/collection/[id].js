import Cors from 'cors';
import { ethers } from 'ethers';
import DynamoDbQuery from '@/components/backend/db/DynamoDbQuery';


export default async function handler(req, res) {
  const { id, contract, tokenId, limit } = req.query
  console.log('api param:', id, contract, tokenId, limit);

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
    TableName: "asset",
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
  // if (Item) {
  //   const arr = [ Item.owner, Item.creator ];
  //   const wallets = [...new Set(arr)]; // remove any duplicates
  //   const userPayloadKeys = Object.values(wallets).map(id => ({'walletId': id}));
  //   const collectionPayloadKeys = [{ 'id': Item.collectionId }];
  //   payload = {
  //     RequestItems: {
  //       users: {
  //         Keys: userPayloadKeys,
  //         ExpressionAttributeNames: { '#walletId': 'walletId', '#name': 'name' },
  //         ProjectionExpression: '#walletId, #name'
  //       },
  //       collection: {
  //         Keys: collectionPayloadKeys,
  //         ExpressionAttributeNames: { '#id': 'id', '#name': 'name', '#category': 'category' },
  //         ProjectionExpression: '#id, #name, #category'
  //       }
  //     }
  //   };
  //   results = await DynamoDbQuery.item.getBatch(payload);
  //   const users = results.Responses.users;
  //   users.forEach(user => {
  //     if (Item.owner === user.walletId) {
  //       Item['ownerName'] = user.name
  //     }
  //     if (Item.creator === user.walletId) {
  //       Item['creatorName'] = user.name
  //     }
  //   });
  //   const collections = results.Responses.collection;
  //   collections.forEach(collection => {
  //     Item['collectionName'] = collection.name
  //     Item['category'] = collection.category
  //   });
  // }

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
