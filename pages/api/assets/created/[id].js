import Cors from 'cors';
import { ethers } from 'ethers';
import DynamoDbQuery from '../../../../components/backend/db/DynamoDbQuery';


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


export default async function handler(req, res) {
//   const config = await API.get(req.body.tokenURI);

  // console.log('test api');
  // console.log('req', req);
  // console.log('req.body', req.body);
  // console.log('req.url', req.url);
  // console.log('req.query', req.query);
  // console.log('req.param', req.param);

  const { id, limit, tokenId } = req.query
  // console.log('api param:', id, tokenId, limit);

  //check params
  if (!id) return res.status(400).json({ invalid: id });
  const checkSumId = ethers.utils.getAddress(id);

  let exclusiveStartKey = undefined;
  if (id && tokenId && Number.isInteger(parseInt(tokenId,10))) {
    exclusiveStartKey = { 'contractAddress': process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS, 'creator': checkSumId, 'tokenId': parseInt(tokenId,10) };
  }

  const payload = {
    TableName: "asset",
    IndexName: 'creator-lsi',
    ExpressionAttributeNames: { '#contractAddress': 'contractAddress', '#creator': 'creator' },
    ExpressionAttributeValues: { ':contractAddress': process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS, ':creator': checkSumId },
    KeyConditionExpression: '#contractAddress = :contractAddress AND #creator = :creator',
    ExclusiveStartKey: exclusiveStartKey,
    Limit: limit
  };
  const results = await DynamoDbQuery.item.query(payload);
  const {Items, LastEvaluatedKey, Count, ScannedCount} = results;
  // console.log('results', Items);

  res.status(200).json({ Items, LastEvaluatedKey, Count, ScannedCount });
}
