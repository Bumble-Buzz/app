import Cors from 'cors';
import { getSession } from "next-auth/react";
import DynamoDbQuery from '../../../../components/backend/db/DynamoDbQuery';


export default async function handler(req, res) {
  const session = await getSession({ req })
  const { id } = req.query
//   console.log('api param:', id);

  // check parameters
  if (!id) return res.status(400).json({ 'error': 'invalid request parameters' });
  if (!Number.isInteger(Number(id))) return res.status(400).json({ 'error': 'invalid request parameters' });
  if (!session) return res.status(401).json({ 'error': 'not authenticated' });
  if (session.user.id !== process.env.NEXT_PUBLIC_ADMIN_WALLET_ID) return res.status(401).json({ 'error': 'not authenticated' });

  const payload = {
    TableName: "collection",
    Key: { 'id': Number(id) },
    ExpressionAttributeNames: { "#active": "active" },
    ExpressionAttributeValues: { ":active": 0 },
    UpdateExpression: `set #active = :active`
  };
  await DynamoDbQuery.item.update(payload);

  res.status(200).json({ 'status': 'success' });
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
