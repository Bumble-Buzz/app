const AWS = require("aws-sdk");
const CheckEnvironment = require('../../CheckEnvironment');


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

console.log('CheckEnvironment', CheckEnvironment);
console.log('DynamoDB props', props);

const DynamoDB = new AWS.DynamoDB(props);
const DynamoDBClient = new AWS.DynamoDB.DocumentClient(props);


module.exports = {
  DynamoDB,
  DynamoDBClient
}