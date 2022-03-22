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
    Key: { 'contractAddress': contractAddress, 'tokenId': tokenId }
  };
  let results = await DynamoDbQuery.item.get(payload);
  const {Item, ConsumedCapacity} = results;

  // for item, also include owner alias and creator alias if available
  if (Item) {
    const arr = [ Item.owner, Item.creator ];
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
          Keys: [{ 'id': Item.collectionId }],
          ExpressionAttributeNames: { '#category': 'category' },
          ProjectionExpression: '#category'
        }
      }
    };
    results = await DynamoDbQuery.item.getBatch(payload);
    const user = results.Responses.users;
    user.forEach(item => {
      if (Item.owner === item.walletId) {
        Item['ownerName'] = item.name
      }
      if (Item.creator === item.walletId) {
        Item['creatorName'] = item.name
      }
    });
    const collection = results.Responses.collection;
    collection.forEach(item => {
      Item['category'] = item.category
    });
  }

  res.status(200).json({ Item, ConsumedCapacity });
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
