const AWS = require("aws-sdk")
// const dynamoDB = new AWS.DynamoDB({ endpoint: "http://localhost:8000" });
const dynamoDB = new AWS.DynamoDB({
  region: "us-east-1",
  accessKeyId: "sample",
  secretAccessKey: "sample",
  endpoint: "http://dynamodb-local:8000"
});


dynamoDB
  .createTable({
    AttributeDefinitions: [
      {
        AttributeName: "id",
        AttributeType: "S",
      },
    ],
    KeySchema: [
      {
        AttributeName: "id",
        KeyType: "HASH",
      },
    ],
    BillingMode: "PAY_PER_REQUEST",
    TableName: "my-table",
  })
  .promise()
  .then(data => console.log("Success!", data))
  .catch(console.error)
