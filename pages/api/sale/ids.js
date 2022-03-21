import Cors from 'cors';
import DynamoDbQuery from '@/components/backend/db/DynamoDbQuery';


export default async function handler(req, res) {
  let { id, limit } = req.query
  // console.log('api param:', id, limit);

  // check parameters
  if (!id) return res.status(400).json({ invalid: `invalid id ${id}` });
  if (Number(limit) > 50) limit = 50;

  let exclusiveStartKey = undefined;
  if (id && Number.isInteger(Number(id))) {
    exclusiveStartKey = { 'id': Number(id) };
  }

  const payload = {
    TableName: "sales",
    ExpressionAttributeNames: { '#id': 'id', '#contractAddress': 'contractAddress', '#tokenId': 'tokenId' },
    ProjectionExpression: '#id, #contractAddress, #tokenId',
    ExclusiveStartKey: exclusiveStartKey,
    Limit: Number(limit) || 10
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
