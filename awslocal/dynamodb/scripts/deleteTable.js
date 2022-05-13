const SCRIPT_ARGS = require('minimist')(process.argv.slice(2));
process.env.NEXT_PUBLIC_APP_ENV = SCRIPT_ARGS.mode;
const DynamoDbQuery = require('../../../components/backend/db/DynamoDbQuery');


(async () => {
  const params = {
    TableName: "people",
  };
  const results = await DynamoDbQuery.table.delete(params);
  console.log('results', results.TableDescription.TableName);
})();
