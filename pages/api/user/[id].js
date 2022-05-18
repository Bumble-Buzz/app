import Cors from 'cors';
import { ethers } from 'ethers';
import DynamoDbQuery from '@/components/backend/db/DynamoDbQuery';


export default async function handler(req, res) {
  const { id } = req.query
  // console.log('api param:', id);

  //check params
  if (!id) return res.status(400).json({ invalid: id });
  const checkSumId = ethers.utils.getAddress(id);

  let payload = {
    TableName: "local_user",
    Key: {'walletId': checkSumId}
  };
  let results = await DynamoDbQuery.item.get(payload);
  const {Item} = results;

  res.status(200).json({ Item });
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
