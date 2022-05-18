import Cors from 'cors';
import { ethers } from 'ethers';
import DynamoDbQuery from '@/components/backend/db/DynamoDbQuery';
import ENUM from '@/enum/ENUM';


export default async function handler(req, res) {
  const { contract, id, networkId } = req.query
  // console.log('api param:', contract, id);

  //check params
  if (!contract) return res.status(400).json({ invalid: contract });
  if (!id || !Number.isInteger(Number(id))) return res.status(400).json({ error: `token id '${id}' is invalid` });

  const contractAddress = ethers.utils.getAddress(contract);
  const tokenId = Number(id);

  let formattedNetworkId = Number(networkId);
  if (!formattedNetworkId || formattedNetworkId <= 0) formattedNetworkId = Number(process.env.NEXT_PUBLIC_CHAIN_ID);
  const network = ENUM.NETWORKS.getNetworkById(formattedNetworkId);

  let payload = {
    TableName: network.tables.asset,
    Key: { 'contractAddress': contractAddress, 'tokenId': tokenId }
  };
  let results = await DynamoDbQuery.item.get(payload);
  const {Item, ConsumedCapacity} = results;

  // for item, also include owner alias and creator alias if available
  if (Item) {
    const arr = [ Item.owner, Item.creator ];
    const wallets = [...new Set(arr)]; // remove any duplicates
    const userPayloadKeys = Object.values(wallets).map(id => ({'walletId': id}));
    const collectionPayloadKeys = [{ 'id': Item.collectionId }];
    payload = {
      RequestItems: {
        [network.tables.user]: {
          Keys: userPayloadKeys,
          ExpressionAttributeNames: { '#walletId': 'walletId', '#name': 'name' },
          ProjectionExpression: '#walletId, #name'
        },
        [network.tables.collection]: {
          Keys: collectionPayloadKeys,
          ExpressionAttributeNames: { '#id': 'id', '#name': 'name', '#category': 'category' },
          ProjectionExpression: '#id, #name, #category'
        }
      }
    };
    results = await DynamoDbQuery.item.getBatch(payload);
    const users = results.Responses[network.tables.user];
    users.forEach(user => {
      if (Item.owner === user.walletId) {
        Item['ownerName'] = user.name
      }
      if (Item.creator === user.walletId) {
        Item['creatorName'] = user.name
      }
    });
    const collections = results.Responses[network.tables.collection];
    collections.forEach(collection => {
      Item['collectionName'] = collection.name
      Item['category'] = collection.category
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
