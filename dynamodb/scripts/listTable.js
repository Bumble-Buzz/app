const AWS = require("aws-sdk")
const dynamoDB = new AWS.DynamoDB({ endpoint: "http://localhost:8000" })


var params = {
};
dynamoDB.listTables(params, (err, data) => {
  if (err) {
    console.log(err, err.stack); // an error occurred
  } else {
    console.log(data);           // successful response
  }
});
