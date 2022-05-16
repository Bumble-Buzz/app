const { S3Client } = require('./S3');
const {
  CreateBucketCommand, PutObjectCommand, GetObjectCommand, ListObjectsCommand
} = require('@aws-sdk/client-s3');
const {
  getSignedUrl
} = require('@aws-sdk/s3-request-presigner');


module.exports = {
  create: async params => await S3Client.send(new CreateBucketCommand(params)),
  put: async params => await S3Client.send(new PutObjectCommand(params)),
  get: async params => await S3Client.send(new GetObjectCommand(params)),
  list: async params => await S3Client.send(new ListObjectsCommand(params)),
  signedUrl: async params => await getSignedUrl(S3Client, new GetObjectCommand(params), { expiresIn: 3600 })
}
