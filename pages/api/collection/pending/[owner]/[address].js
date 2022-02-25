import Cors from 'cors';
import { ethers } from 'ethers';
import DynamoDbQuery from '../../../../../components/backend/db/DynamoDbQuery';


export default async function handler(req, res) {
  const { owner, address } = req.query
  // console.log('api param:', owner, address);

  //check params
  if (!owner) return res.status(400).json({ invalid: owner });
  const checkSumId = ethers.utils.getAddress(owner);
  if (!address) return res.status(400).json({ invalid: address });
  const checkSumAddress = ethers.utils.getAddress(address);

  let payload = {
    TableName: "pending-collection",
    ExpressionAttributeNames: { '#owner': 'owner', '#contractAddress': 'contractAddress' },
    ExpressionAttributeValues: { ':owner': checkSumId, ':contractAddress': checkSumAddress },
    KeyConditionExpression: '#owner = :owner AND #contractAddress = :contractAddress'
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
