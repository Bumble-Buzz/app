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
//   const config = await API.get(req.body.tokenURI);

  // console.log('test api');
  // console.log('req', req);
  // console.log('req.body', req.body);
  // console.log('req.url', req.url);
  // console.log('req.query', req.query);
  // console.log('req.param', req.param);

  const { id } = req.query
  console.log('api param:', id);

  const payload = {
    TableName: "asset",
    IndexName: 'creator-lsi',
    ExpressionAttributeNames: { '#contractAddress': 'contractAddress', '#creator': 'creator' },
    ExpressionAttributeValues: { ':contractAddress': '0x0789a8D7c2D9cb50Fc59413ca404026eB6D34251', ':creator': id },
    KeyConditionExpression: '#contractAddress = :contractAddress AND #creator = :creator'
  };
  const results = await DynamoDbQuery.item.query(payload);
  console.log('results', results.Items);

  res.status(200).json({ test: 'api2' });
}
