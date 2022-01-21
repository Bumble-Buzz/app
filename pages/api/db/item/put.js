import Cors from 'cors';
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
  const results = await DynamoDbQuery.item.put(req.body);

  res.status(200).json({});
}
