import Cors from 'cors';
import DynamoDbQuery from '../../components/backend/db/DynamoDbQuery';


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

//   console.log('test api');
//   console.log('req', req);
//   console.log('req.body', req.body);
//   console.log('req.url', req.url);
//   console.log('req.query', req.query);
//   console.log('req.param', req.param);

  const { limit, uid, chain } = req.query
  // console.log('api param:', limit, uid, chain);

  let exclusiveStartKey = undefined;
  if (chain && JSON.parse(chain)) {
    exclusiveStartKey = { 'uid': uid, 'chain': chain };
  }

  const payload = {
    TableName: "contracts",
    ExpressionAttributeNames: { '#uid': 'uid' },
    ExpressionAttributeValues: { ':uid': uid },
    KeyConditionExpression: '#uid = :uid',
    ExclusiveStartKey: exclusiveStartKey,
    Limit: limit
  };
  // console.log('payload', payload);
  const results = await DynamoDbQuery.item.query(payload);
  const {Items, LastEvaluatedKey, Count, ScannedCount} = results;
  // console.log('results', {Items, LastEvaluatedKey});
  // console.log('results', results.Items);

  res.status(200).json({ Items, LastEvaluatedKey, Count, ScannedCount });
  // res.status(200).json({ results });
}
