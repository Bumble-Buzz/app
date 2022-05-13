const clientS3 = require("@aws-sdk/client-s3");


const props = { region: "us-east-1" };
const S3Client2 = new clientS3.S3Client(props);


module.exports = {
  S3Client: S3Client2
}
