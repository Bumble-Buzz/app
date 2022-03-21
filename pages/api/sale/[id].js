import Cors from 'cors';
import { getSession } from "next-auth/react";
import DynamoDbQuery from '@/components/backend/db/DynamoDbQuery';


export default async function handler(req, res) {
  const session = await getSession({ req });
  const { id } = req.query
  console.log('api param:', id);

  // check parameters
  if (!id || !Number.isInteger(Number(id))) return res.status(400).json({ error: `sale id '${id}' is invalid` });
  if (!session) return res.status(401).json({ 'error': 'not authenticated' });

  const payload = {
    TableName: "sales",
    Key: { 'id': Number(id) }
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
