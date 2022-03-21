import Cors from 'cors';
import { getSession } from "next-auth/react";
import DynamoDbQuery from '@/components/backend/db/DynamoDbQuery';


export default async function handler(req, res) {
  const session = await getSession({ req });
  const data = req.body;
  // console.log('req.body', data);

  // check parameters
  if (!data) return res.status(400).json({ 'error': 'invalid request parameters' });
  if (!session) return res.status(401).json({ 'error': 'not authenticated' });

  let Items = [];
  if (data.ids.length > 0) {
    const payloadKeys = Object.values(data.ids).map(item => item);
    const payload = {
      RequestItems: {
        sales: { Keys: payloadKeys }
      }
    };
    const results = await DynamoDbQuery.item.getBatch(payload);
    Items = results.Responses.sales;
  }
  const LastEvaluatedKey = undefined;
  const Count = Items.length;
  const ScannedCount = Items.length;

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
