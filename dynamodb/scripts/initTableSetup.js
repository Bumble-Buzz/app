const SCRIPT_ARGS = require('minimist')(process.argv.slice(2));
process.env.NEXT_PUBLIC_APP_ENV = SCRIPT_ARGS.mode || 'dev';
const ACTION = SCRIPT_ARGS.action;
const DynamoDbQuery = require('../../components/backend/db/DynamoDbQuery');


const list = async () => {
  const results = await DynamoDbQuery.table.list({});
  console.log('Tables:', results.TableNames);

}

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
  let ExclusiveStartKey;
  let dbData = [];
  const payload = {
    TableName: "contracts",
    ExclusiveStartKey,
    Limit: 10
  };
  let results = await DynamoDbQuery.table.scan(payload);
  dbData = [...dbData, ...results.Items];
  console.log('ExclusiveStartKey', results.LastEvaluatedKey);
  console.log('dbData', dbData.length);

  payload.ExclusiveStartKey = results.LastEvaluatedKey;
  results = await DynamoDbQuery.table.scan(payload);
  dbData = [...dbData, ...results.Items];
  console.log('ExclusiveStartKey', results.LastEvaluatedKey);
  console.log('dbData', dbData.length);

  payload.ExclusiveStartKey = results.LastEvaluatedKey;
  results = await DynamoDbQuery.table.scan(payload);
  dbData = [...dbData, ...results.Items];
  console.log('ExclusiveStartKey', results.LastEvaluatedKey);
  console.log('dbData', dbData.length);

  payload.ExclusiveStartKey = results.LastEvaluatedKey;
  results = await DynamoDbQuery.table.scan(payload);
  dbData = [...dbData, ...results.Items];
  console.log('ExclusiveStartKey', results.LastEvaluatedKey);
  console.log('dbData', dbData.length);

  // console.log('dbData', dbData);
  console.log('dbData', dbData[9]);
  console.log('dbData', dbData[10]);
  console.log('dbData', dbData[11]);
  console.log('dbData', dbData[19]);
  console.log('dbData', dbData[20]);
  console.log('dbData', dbData[21]);
  // console.log('dbData', dbData[299]);
  // console.log('dbData', dbData[300]);
  // console.log('dbData', dbData[301]);
};

const scan2 = async () => {
  let ExclusiveStartKey;
  let dbData = [];
  const payload = {
    TableName: "contracts",
    ExclusiveStartKey,
    Limit: 100
  };
  let results = await DynamoDbQuery.item.scan(payload);
  dbData = [...dbData, ...results.Items];
  console.log('dbData', dbData.length);

  ExclusiveStartKey = results.LastEvaluatedKey;
  results = await DynamoDbQuery.item.scan(payload);
  dbData = [...dbData, ...results.Items];
  console.log('dbData', dbData.length);

  console.log('dbData', dbData);
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

const put = async (val) => {
  const payload = {
    TableName: "contracts",
    Item: {
      'contractAddress': val,
    }
  };
  const results = await DynamoDbQuery.item.put(payload);
};

const cleanup = async () => {
  const params = {
    TableName: "users"
  };
  const results = await DynamoDbQuery.table.delete(params);
  console.log('table deleted:', results.TableDescription.TableName);
};

(async () => {
  if (ACTION === 'list') {
    await list();
  } else if (ACTION === 'create') {
    await users();
  } else if (ACTION === 'delete') {
    await cleanup();
  } else if (ACTION === 'scan') {
    await scan2();
  } else if (ACTION === 'get') {
    await get();
  } else if (ACTION === 'put') {
    let val = '';
    for (let i = 0; i < 100; i++) {
      val = "sample"
      val += i;
      await put(val);
      console.log(val);
    }
    // await put('sample');
  } else {}
})();
