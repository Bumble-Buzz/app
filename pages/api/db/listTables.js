import Cors from 'cors';
const AWS = require("aws-sdk");
import CheckEnvironment from '../../../components/CheckEnvironment';

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
  const props = { region: "us-east-1" };
  if (CheckEnvironment.isDevMode) {
    props.accessKeyId = "sample";
    props.secretAccessKey = "sample";
    props.endpoint = "http://localhost:8000";
  } else if (CheckEnvironment.isDevKindMode) {
    props.accessKeyId = "sample";
    props.secretAccessKey = "sample";
    props.endpoint = "http://dynamodb-local:8000";
  }

  console.log('props', props);
  const dynamoDB = new AWS.DynamoDB(props);

  const params = {};
  const results = await dynamoDB.listTables(params).promise();

  res.status(200).json(results);
}
