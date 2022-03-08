import Cors from 'cors';
import { ethers } from 'ethers';
import DynamoDbQuery from '@/components/backend/db/DynamoDbQuery';


export default async function handler(req, res) {
  // console.log('req.body', req.body);
  // console.log('req.url', req.url);
  // console.log('req.query', req.query);
  // console.log('req.param', req.param);

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
