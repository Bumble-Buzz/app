import Cors from 'cors';
import { ethers } from 'ethers';
import DynamoDbQuery from '@/components/backend/db/DynamoDbQuery';


export default async function handler(req, res) {
  const { contract, id: tokenId } = req.query
  // console.log('api param:', contract, tokenId);

  // check parameters
  if (!contract) return res.status(400).json({ invalid: contract });
  if (!tokenId || !Number.isInteger(Number(tokenId))) return res.status(400).json({ error: `token id '${tokenId}' is invalid` });
  
  const formattedContract = ethers.utils.getAddress(contract);
  const formattedTokenId = Number(tokenId);

  const payload = {
    TableName: "sale",
    Key: { 'contractAddress': formattedContract, 'tokenId': formattedTokenId }
  };
  let results = await DynamoDbQuery.item.get(payload);
  const {Item, ConsumedCapacity} = results;

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
