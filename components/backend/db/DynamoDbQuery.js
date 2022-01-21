const DynamoDB = require('./DynamoDb');


module.exports = {
  table: {
    list: async params => await DynamoDB.DynamoDB.listTables(params).promise(),
    create: async params => await DynamoDB.DynamoDB.createTable(params).promise(),
    describe: async params => await DynamoDB.DynamoDB.describeTable(params).promise(),
    delete: async params => await DynamoDB.DynamoDB.deleteTable(params).promise(),
    scan: async params => await DynamoDB.DynamoDB.scan(params).promise()
  },
  item: {
    get: async params => await DynamoDB.DynamoDBClient.get(params).promise(),
    getBatch: async params => await DynamoDB.DynamoDBClient.batchGet(params).promise(),
    put: async params => await DynamoDB.DynamoDBClient.put(params).promise(),
    putBatch: async params => await DynamoDB.DynamoDBClient.batchWrite(params).promise(),
    update: async params => await DynamoDB.DynamoDBClient.update(params).promise(),
    delete: async params => await DynamoDB.DynamoDBClient.delete(params).promise(),
    deleteBatch: async params => await DynamoDB.DynamoDBClient.batchWrite(params).promise()
  }
}