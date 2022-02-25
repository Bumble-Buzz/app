import Cors from 'cors';
import { ethers } from 'ethers';
import DynamoDbQuery from '../../../../components/backend/db/DynamoDbQuery';


export default async function handler(req, res) {
  const { owner, address, limit } = req.query
  // console.log('api param:', owner, address, limit);

  let exclusiveStartKey = undefined;
  if (owner && owner !== 'null' && address && address !== 'null') {
    const checkSumId = ethers.utils.getAddress(owner);
    let sortKey = 'null';
    if (address) sortKey = address;
    exclusiveStartKey = { 'owner': checkSumId, 'contractAddress': sortKey };
  }

  let payload = {
    TableName: "pending-collection",
    ExclusiveStartKey: exclusiveStartKey,
    Limit: Number(limit) || 10
  };
  let results = await DynamoDbQuery.item.scan(payload);
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
