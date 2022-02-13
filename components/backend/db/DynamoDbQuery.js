const { DynamoDBClient, DynamoDBDocumentClient } = require('./DynamoDb');
const {
  ListTablesCommand, CreateTableCommand, DescribeTableCommand, DeleteTableCommand
} = require("@aws-sdk/client-dynamodb");
const {
  GetCommand, BatchGetCommand, PutCommand, BatchWriteCommand, UpdateCommand, DeleteCommand, ScanCommand, QueryCommand
} = require('@aws-sdk/lib-dynamodb');


module.exports = {
  table: {
    list: async params => await DynamoDBClient.send(new ListTablesCommand(params)),
    create: async params => await DynamoDBClient.send(new CreateTableCommand(params)),
    describe: async params => await DynamoDBClient.send(new DescribeTableCommand(params)),
    delete: async params => await DynamoDBClient.send(new DeleteTableCommand(params)),
    scan: async params => await DynamoDBClient.send(new ScanCommand(params))
  },
  item: {
    get: async params => await DynamoDBDocumentClient.send(new GetCommand(params)),
    getBatch: async params => await DynamoDBDocumentClient.send(new BatchGetCommand(params)),
    put: async params => await DynamoDBDocumentClient.send(new PutCommand(params)),
    putBatch: async params => await DynamoDBDocumentClient.send(new BatchWriteCommand(params)),
    update: async params => await DynamoDBDocumentClient.send(new UpdateCommand(params)),
    delete: async params => await DynamoDBDocumentClient.send(new DeleteCommand(params)),
    deleteBatch: async params => await DynamoDBDocumentClient.send(new BatchWriteCommand(params)),
    scan: async params => await DynamoDBDocumentClient.send(new ScanCommand(params)),
    query: async params => await DynamoDBDocumentClient.send(new QueryCommand(params))
  }
}
