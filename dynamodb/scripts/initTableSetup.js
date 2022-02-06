const SCRIPT_ARGS = require('minimist')(process.argv.slice(2));
process.env.NEXT_PUBLIC_APP_ENV = SCRIPT_ARGS.mode || 'dev';
const ACTION = SCRIPT_ARGS.action;
const DynamoDbQuery = require('../../components/backend/db/DynamoDbQuery');


const users = async () => {
  const params = {
    TableName: "users",
    AttributeDefinitions: [
      {
        AttributeName: "walletId",
        AttributeType: "S",
      }
    ],
    KeySchema: [
      {
        AttributeName: "walletId",
        KeyType: "HASH",
      }
    ],
    BillingMode: "PAY_PER_REQUEST",
  };
  const results = await DynamoDbQuery.table.create(params);
  console.log('table created:', results.TableDescription.TableName);
};

const scan = async () => {
  const payload = {
    TableName: "users",
  };
  const results = await DynamoDbQuery.table.scan(payload);
  console.log('Scan:', results.Items);
};

const get = async () => {
  const payload = {
    TableName: "users",
    Key: {
      'walletId': '0xda121ab48c7675e4f25e28636e3efe602e49eec6'
    }
  };
  const results = await DynamoDbQuery.item.get(payload);
  console.log('Get item:', results.Item);
};

const cleanup = async () => {
  const params = {
    TableName: "users"
  };
  const results = await DynamoDbQuery.table.delete(params);
  console.log('table deleted:', results.TableDescription.TableName);
};

(async () => {
  if (ACTION === 'create') {
    await users();
  } else if (ACTION === 'delete') {
    await cleanup();
  } else if (ACTION === 'scan') {
    await scan();
  } else if (ACTION === 'get') {
    await get();
  } else {}
})();
