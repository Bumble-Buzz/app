import Cors from 'cors';
import { ethers } from 'ethers';
import DynamoDbQuery from '@/components/backend/db/DynamoDbQuery';


export default async function handler(req, res) {
  const { contract, id } = req.query
  // console.log('api param:', contract, id);

  //check params
  if (!contract) return res.status(400).json({ invalid: contract });
  if (!id || !Number.isInteger(Number(id))) return res.status(400).json({ error: `token id '${id}' is invalid` });

  const contractAddress = ethers.utils.getAddress(contract);
  const tokenId = Number(id);

  let payload = {
    TableName: "asset",
    ExpressionAttributeNames: { '#contractAddress': 'contractAddress', '#tokenId': 'tokenId' },
    ExpressionAttributeValues: { ':contractAddress': contractAddress, ':tokenId': tokenId },
    KeyConditionExpression: '#contractAddress = :contractAddress AND #tokenId = :tokenId',
  };
  let results = await DynamoDbQuery.item.query(payload);
  const {Items, LastEvaluatedKey, Count, ScannedCount} = results;

  // for item, also include owner alias and creator alias if available
  if (Items.length > 0) {
    const arr = [ Items[0].owner, Items[0].creator ];
    const wallets = [...new Set(arr)]; // remove any duplicates
    const payloadKeys = Object.values(wallets).map(id => ({'walletId': id}));
    payload = {
      RequestItems: {
        users: {
          Keys: payloadKeys,
          ExpressionAttributeNames: { '#walletId': 'walletId', '#name': 'name' },
          ProjectionExpression: '#walletId, #name'
        },
        collection: {
          Keys: [{ 'id': Items[0].collectionId }],
          ExpressionAttributeNames: { '#category': 'category' },
          ProjectionExpression: '#category'
        }
      }
    };
    results = await DynamoDbQuery.item.getBatch(payload);
    const user = results.Responses.users;
    user.forEach(item => {
      if (Items[0].owner === item.walletId) {
        Items[0]['ownerName'] = item.name
      }
      if (Items[0].creator === item.walletId) {
        Items[0]['creatorName'] = item.name
      }
    });
    const collection = results.Responses.collection;
    collection.forEach(item => {
      Items[0]['category'] = item.category
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
