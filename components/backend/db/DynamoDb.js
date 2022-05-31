const DynamoDB = require("@aws-sdk/client-dynamodb");
const DynamoDBLib = require("@aws-sdk/lib-dynamodb");
const CheckEnvironment = require('../../CheckEnvironment');


const props = { region: process.env.AWS_REGION };
if (CheckEnvironment.isDevMode) {
  props.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
  // props.endpoint = "http://localhost:8000";
}
// } else if (CheckEnvironment.isDevKindMode) {
//   props.credentials = {
//     accessKeyId: "sample",
//     secretAccessKey: "sample"
//   }
//   props.endpoint = "http://dynamodb-local:8000";
// }

// console.log('CheckEnvironment', CheckEnvironment);
// console.log('DynamoDB props', props);

const DynamoDBClient = new DynamoDB.DynamoDBClient(props);
const DynamoDBDocumentClient = DynamoDBLib.DynamoDBDocumentClient.from(DynamoDBClient);


module.exports = {
  DynamoDBClient,
  DynamoDBDocumentClient
}