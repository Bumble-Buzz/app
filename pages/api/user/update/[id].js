import Cors from 'cors';
import { ethers } from 'ethers';
import { getSession } from "next-auth/react";
import DynamoDbQuery from '@/components/backend/db/DynamoDbQuery';
import Date from '@/utils/Date';


export default async function handler(req, res) {
  const session = await getSession({ req });
  const { id } = req.query
  const data = req.body;
  // console.log('req.body', data);

  //check params
  if (!id) return res.status(400).json({ 'error': 'invalid request parameters' });
  if (!data) return res.status(400).json({ 'error': 'invalid request parameters' });
  if (!session) return res.status(401).json({ 'error': 'not authenticated' });

  const formattedWalletId = ethers.utils.getAddress(id);

  if (session.user.id !== formattedWalletId) return res.status(401).json({ 'error': 'not authenticated' });

  const payload = {
    TableName: "user",
    Key: { 'walletId': formattedWalletId },
    ExpressionAttributeNames: { '#name': 'name', '#bio': 'bio', '#timestamp': 'timestamp' },
    ExpressionAttributeValues: { ':name': data.name, ':bio': data.bio, ':timestamp': Date.getTimestamp().toString() },
    UpdateExpression: 'set #name = :name, #bio = :bio, #timestamp = :timestamp'
  };
  const results = await DynamoDbQuery.item.update(payload);
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
