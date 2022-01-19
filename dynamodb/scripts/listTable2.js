const AWS = require("aws-sdk");

const props = {
  region: "us-east-1",
  accessKeyId: "sample",
  secretAccessKey: "sample",
  endpoint: "http://dynamodb-local:8000"
};
// const dynamoDB = new AWS.DynamoDB({ region: "us-east-1", endpoint: "http://localhost:8000" });
// const dynamoDB = new AWS.DynamoDB({
//   region: "us-east-1",
//   accessKeyId: "sample",
//   secretAccessKey: "sample",
//   endpoint: "http://dynamodb-local:8000"
// });
console.log('props', props);
const dynamoDB = new AWS.DynamoDB(props);


let results;
var params = {
};
dynamoDB.listTables(params, (err, data) => {
  if (err) {
    console.log(err, err.stack); // an error occurred
  } else {
    console.log(data);           // successful response
    results = data;
  }
});

const listTables = async () => {
  const params = {};
  return await dynamoDB.listTables(params).promise();
};

// module.exports = {
//   listTables
// };