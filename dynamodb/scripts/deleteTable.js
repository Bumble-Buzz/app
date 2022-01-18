const AWS = require("aws-sdk")
const dynamoDB = new AWS.DynamoDB({ endpoint: "http://localhost:8000" });

dynamoDB
  .deleteTable({
    TableName: "my-table",
  })
  .promise()
  .then(() => console.log("Table has been deleted"))
  .catch(console.error)
