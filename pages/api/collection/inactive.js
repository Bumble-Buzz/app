import Cors from 'cors';
import { ethers } from 'ethers';
import { getSession } from "next-auth/react";
import DynamoDbQuery from '../../../components/backend/db/DynamoDbQuery';


export default async function handler(req, res) {
  const { id, limit } = req.query
  // console.log('api param:', id, limit);

  const session = await getSession({ req })
  console.log('session', session);

  let exclusiveStartKey = undefined;
  if (id && Number.isInteger(Number(id))) {
    exclusiveStartKey = { 'id': Number(id), 'active': 0 };
  }

  let payload = {
    TableName: "collection",
    IndexName: 'active-gsi',
    ExpressionAttributeNames: { '#active': 'active' },
    ExpressionAttributeValues: { ':active': 0 },
    KeyConditionExpression: '#active = :active',
    ExclusiveStartKey: exclusiveStartKey,
    Limit: Number(limit) || 10
  };
  let results = await DynamoDbQuery.item.query(payload);
  const {Items, LastEvaluatedKey, Count, ScannedCount} = results;

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
