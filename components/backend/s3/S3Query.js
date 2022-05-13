const { S3Client } = require('./S3');
const {
  CreateBucketCommand, PutObjectCommand, GetObjectCommand, ListObjectsCommand
} = require('@aws-sdk/client-s3');


module.exports = {
  create: async params => await S3Client.send(new CreateBucketCommand(params)),
  put: async params => await S3Client.send(new PutObjectCommand(params)),
  get: async params => await S3Client.send(new GetObjectCommand(params)),
  list: async params => await S3Client.send(new ListObjectsCommand(params))
}
