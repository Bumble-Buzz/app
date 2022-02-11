const SCRIPT_ARGS = require('minimist')(process.argv.slice(2));
process.env.NEXT_PUBLIC_APP_ENV = SCRIPT_ARGS.mode || 'dev';
const ACTION = SCRIPT_ARGS.action;
const TABLE_NAME = SCRIPT_ARGS.table;
const DynamoDbQuery = require('../../components/backend/db/DynamoDbQuery');


const list = async () => {
  const results = await DynamoDbQuery.table.list({});
  console.log('Tables:', results.TableNames);

};

const contracts = async () => {
  const payload = {
    TableName: "contracts",
    AttributeDefinitions: [
      {
        AttributeName: "contractAddress",
        AttributeType: "S",
      }
    ],
    KeySchema: [
      {
        AttributeName: "contractAddress",
        KeyType: "HASH",
      }
    ],
    BillingMode: "PAY_PER_REQUEST",
  };
  const results = await DynamoDbQuery.table.create(payload);
  console.log('table created:', results.TableDescription.TableName);
};

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

const createdAssets = async () => {
  const payload = {
    TableName: "created-assets",
    AttributeDefinitions: [
      { AttributeName: "walletId", AttributeType: "S" },
      { AttributeName: "contractAddress", AttributeType: "S" },
      { AttributeName: "tokenId", AttributeType: "N" }
    ],
    KeySchema: [
      { AttributeName: "walletId", KeyType: "HASH" },
      { AttributeName: "contractAddress", KeyType: "RANGE" }
    ],
    LocalSecondaryIndexes: [
      {
        IndexName: "tokenId",
        KeySchema: [
          { AttributeName: "walletId", KeyType: "HASH" },
          { AttributeName: "tokenId", KeyType: "RANGE" }
        ],
        Projection: {
          NonKeyAttributes: [],
          ProjectionType: "ALL"
        }
      }
    ],
    BillingMode: "PAY_PER_REQUEST",
  };
  const results = await DynamoDbQuery.table.create(payload);
  console.log('table created:', results.TableDescription.TableName);
};

const contractsDelete = async () => {
  const payload = {
    TableName: "contracts"
  };
  const results = await DynamoDbQuery.table.delete(payload);
  console.log('table deleted:', results.TableDescription.TableName);
};

const usersDelete = async () => {
  const payload = {
    TableName: "users"
  };
  const results = await DynamoDbQuery.table.delete(payload);
  console.log('table deleted:', results.TableDescription.TableName);
};

const createdAssetsDelete = async () => {
  const payload = {
    TableName: "created-assets"
  };
  const results = await DynamoDbQuery.table.delete(payload);
  console.log('table deleted:', results.TableDescription.TableName);
};

const create = async () => {
  // await contracts();
  // await users();
  await createdAssets();
};

const cleanup = async () => {
  // await contractsDelete();
  // await usersDelete();
  await createdAssetsDelete();
};

const scan = async () => {
  const payload = {
    TableName: TABLE_NAME,
  };
  const results = await DynamoDbQuery.table.scan(payload);
  console.log('Scan:', results.Items);
};

const scanLazy = async () => {
  let ExclusiveStartKey;
  let dbData = [];
  const payload = {
    TableName: "contracts",
    ExclusiveStartKey,
    Limit: 10
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

(async () => {
  if (ACTION === 'list') {
    await list();
  } else if (ACTION === 'create') {
    await create();
  } else if (ACTION === 'delete') {
    await cleanup();
  } else if (ACTION === 'scan') {
    await scan();
  } else if (ACTION === 'get') {
    await get();
  } else if (ACTION === 'put') {
    // let val = '';
    // for (let i = 0; i < 100; i++) {
    //   val = "sample"
    //   val += i;
    //   await put(val);
    //   console.log(val);
    // }
    await put('sample');
  } else {}
})();
