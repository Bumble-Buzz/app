import Cors from 'cors';
import { ethers } from 'ethers';
import DynamoDbQuery from '../../../../components/backend/db/DynamoDbQuery';


export default async function handler(req, res) {
  const { owner, id, limit } = req.query
  // console.log('api param:', owner, id, limit);

  //check params
  if (!owner) return res.status(400).json({ invalid: owner });
  const checkSumId = ethers.utils.getAddress(owner);

  let exclusiveStartKey = undefined;
  if (owner && id && Number.isInteger(Number(id))) {
    exclusiveStartKey = { 'owner': checkSumId, 'id': Number(id), 'active': 1 };
  }

  let payload = {
    TableName: "collection",
    IndexName: 'owner-gsi',
    ExpressionAttributeNames: { '#owner': 'owner', '#active': 'active' },
    ExpressionAttributeValues: { ':owner': checkSumId, ':active': 1 },
    KeyConditionExpression: '#owner = :owner AND #active = :active',
    ExclusiveStartKey: exclusiveStartKey,
    Limit: Number(limit) || 10
  };
  let results = await DynamoDbQuery.item.query(payload);
  const {Items, LastEvaluatedKey, Count, ScannedCount} = results;

  // for each item, also include owner alias if available
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
    users.forEach(user => {
      Items.forEach(item => {
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
