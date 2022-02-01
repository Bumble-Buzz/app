const SCRIPT_ARGS = require('minimist')(process.argv.slice(2));
process.env.NEXT_PUBLIC_APP_ENV = SCRIPT_ARGS.mode;
const DynamoDbQuery = require('../../components/backend/db/DynamoDbQuery');


(async () => {
  const params = {
    TableName: "NextAuthTable",
    AttributeDefinitions: [
      {
        AttributeName: "pk",
        AttributeType: "S",
      },
      {
        AttributeName: "sk",
        AttributeType: "S",
      },
      {
        AttributeName: "GSI1PK",
        AttributeType: "S",
      },
      {
        AttributeName: "GSI1SK",
        AttributeType: "S",
      }
    ],
    KeySchema: [
      {
        AttributeName: "pk",
        KeyType: "HASH",
      },
      {
        AttributeName: "sk",
        KeyType: "RANGE",
      }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'GSI1',
        KeySchema: [
          {
            AttributeName: "GSI1PK",
            KeyType: "HASH"
          },
          {
            AttributeName: "GSI1SK",
            KeyType: "RANGE"
          }
        ],
        Projection: {
          ProjectionType: "ALL"
        }
      }
    ],
    BillingMode: "PAY_PER_REQUEST",
  };
  const results = await DynamoDbQuery.table.create(params);
  console.log('results', results.TableDescription.TableName);
})();
