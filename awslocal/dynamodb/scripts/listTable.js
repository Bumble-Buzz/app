const SCRIPT_ARGS = require('minimist')(process.argv.slice(2));
process.env.NEXT_PUBLIC_APP_ENV = SCRIPT_ARGS.mode;
const DynamoDbQuery = require('../../../components/backend/db/DynamoDbQuery');


(async () => {
  const params = {};
  const results = await DynamoDbQuery.table.list(params);
  console.log('results', results.TableNames);
})();
