import Cors from 'cors';
import { ethers } from 'ethers';
import DynamoDbQuery from '@/components/backend/db/DynamoDbQuery';


export default async function handler(req, res) {
  const { id, tokenId, limit } = req.query
  // console.log('api param:', id, tokenId, limit);

  // check parameters
  // if (!id) return res.status(400).json({ invalid: `invalid id ${id}` });
  
  const formattedTokenId = Number(tokenId);
  let formattedLimit = Number(limit);
  if (formattedLimit > 50) limit = 50;

  let exclusiveStartKey = undefined;
  if (id && tokenId && Number.isInteger(formattedTokenId)) {
    const checkSumId = ethers.utils.getAddress(id);
    exclusiveStartKey = { 'contractAddress': checkSumId, 'tokenId': formattedTokenId };
  }

  const payload = {
    TableName: "sale",
    ExpressionAttributeNames: { '#contractAddress': 'contractAddress', '#tokenId': 'tokenId', '#saleId': 'saleId' },
    ProjectionExpression: '#contractAddress, #tokenId, #saleId',
    ExclusiveStartKey: exclusiveStartKey,
    Limit: formattedLimit || 10
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
