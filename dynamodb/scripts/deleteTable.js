const AWS = require("aws-sdk")
// const dynamoDB = new AWS.DynamoDB({ endpoint: "http://localhost:8000" });
const dynamoDB = new AWS.DynamoDB({
  region: "us-east-1",
  accessKeyId: "sample",
  secretAccessKey: "sample",
  endpoint: "http://dynamodb-local:8000"
});


dynamoDB
  .deleteTable({
    TableName: "my-table",
  })
  .promise()
  .then(() => console.log("Table has been deleted"))
  .catch(console.error)
