import Cors from 'cors';
import { ethers } from 'ethers';
import DynamoDbQuery from '@/components/backend/db/DynamoDbQuery';
import ENUM from '@/enum/ENUM';


export default async function handler(req, res) {
  const { owner, contract, tokenId, limit, networkId } = req.query
  // console.log('api param:', id, contract, tokenId, limit);


  const formattedTokenId = Number(tokenId);
  let formattedLimit = Number(limit);
  if (formattedLimit > 50) limit = 50;
  
  let exclusiveStartKey = undefined;
  if (owner && contract && formattedTokenId && Number.isInteger(formattedTokenId)) {
    const formattedOwner = ethers.utils.getAddress(owner);
    const formattedContract = ethers.utils.getAddress(contract);
    exclusiveStartKey = {
      'contractAddress': formattedContract, 'tokenId': formattedTokenId, 'owner': formattedOwner, 'onSale': Number(1)
    };
  }

  let formattedNetworkId = Number(networkId);
  if (!formattedNetworkId || formattedNetworkId <= 0) formattedNetworkId = Number(process.env.NEXT_PUBLIC_CHAIN_ID);
  const network = ENUM.NETWORKS.getNetworkById(formattedNetworkId);

  let payload = {
    TableName: network.tables.asset,
    IndexName: 'onSale-gsi',
    ExpressionAttributeNames: { '#onSale': 'onSale' },
    ExpressionAttributeValues: { ':onSale': Number(1) },
    KeyConditionExpression: '#onSale = :onSale',
    ExclusiveStartKey: exclusiveStartKey,
    Limit: formattedLimit || 10
  };
  let results = await DynamoDbQuery.item.query(payload);
  const {Items, LastEvaluatedKey, Count, ScannedCount} = results;

  // for each item, get unique list of collectionIds, and also return collection names
  if (Items.length > 0) {
    let walletIds = {};
    let collectionIds = {};
    Items.forEach(item => {
      walletIds[item.owner] = item.owner;
      collectionIds[item.collectionId] = item.collectionId;
    });
    const userPayloadKeys = Object.values(walletIds).map(id => ({'walletId': id}));
    const collectionPayloadKeys = Object.values(collectionIds).map(id => ({'id': id}));
    payload = {
      RequestItems: {
        [network.tables.user]: {
          Keys: userPayloadKeys,
          ExpressionAttributeNames: { '#walletId': 'walletId', '#name': 'name' },
          ProjectionExpression: "#walletId, #name"
        },
        [network.tables.collection]: {
          Keys: collectionPayloadKeys,
          ExpressionAttributeNames: { '#id': 'id', '#name': 'name' },
          ProjectionExpression: "#id, #name"
        }
      },
    };
    results = await DynamoDbQuery.item.getBatch(payload);
    const users = results.Responses[network.tables.user];
    const collections = results.Responses[network.tables.collection];
    Items.forEach(item => {
      users.forEach(user => {
        if (item.owner === user.walletId) {
          item['ownerName'] = user.name
        }
      });
      collections.forEach(collection => {
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
