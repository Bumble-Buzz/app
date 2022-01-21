const SCRIPT_ARGS = require('minimist')(process.argv.slice(2));
process.env.NEXT_PUBLIC_APP_ENV = SCRIPT_ARGS.mode;
const DynamoDbQuery = require('../../components/backend/db/DynamoDbQuery');


(async () => {
  const params = {
    AttributeDefinitions: [
      {
        AttributeName: "id",
        AttributeType: "S",
      },
    ],
    KeySchema: [
      {
        AttributeName: "id",
        KeyType: "HASH",
      },
    ],
    BillingMode: "PAY_PER_REQUEST",
    TableName: "my-table",
  };
  const results = await DynamoDbQuery.table.create(params);
  console.log('results', results.TableDescription.TableName);
})();
