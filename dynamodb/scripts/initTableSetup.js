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
        IndexName: "tokenId-index",
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

const collection = async () => {
  const payload = {
    TableName: "collection",
    AttributeDefinitions: [
      { AttributeName: "category", AttributeType: "S" },
      { AttributeName: "active", AttributeType: "N" },
      { AttributeName: "id", AttributeType: "N" },
      { AttributeName: "owner", AttributeType: "S" }
    ],
    KeySchema: [
      { AttributeName: "category", KeyType: "HASH" },
      { AttributeName: "active", KeyType: "RANGE" }
    ],
    LocalSecondaryIndexes: [
      {
        IndexName: "id-lsi",
        KeySchema: [
          { AttributeName: "category", KeyType: "HASH" },
          { AttributeName: "id", KeyType: "RANGE" }
        ],
        Projection: {
          NonKeyAttributes: [],
          ProjectionType: "ALL"
        }
      }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "id-gsi",
        KeySchema: [
          { AttributeName: "id", KeyType: "HASH" }
        ],
        Projection: {
          NonKeyAttributes: [],
          ProjectionType: "ALL"
        }
      },
      {
        IndexName: "owner-gsi",
        KeySchema: [
          { AttributeName: "owner", KeyType: "HASH" },
          { AttributeName: "active", KeyType: "RANGE" }
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

const collectionDelete = async () => {
  const payload = {
    TableName: "collection"
  };
  const results = await DynamoDbQuery.table.delete(payload);
  console.log('table deleted:', results.TableDescription.TableName);
};


const create = async () => {
  // await contracts();
  // await users();
  await createdAssets();
  // await collection();
};

const cleanup = async () => {
  // await contractsDelete();
  // await usersDelete();
  await createdAssetsDelete();
  // await collectionDelete();
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

const queryCreatedAssets = async () => {
  const payload = {
    TableName: "created-assets",
    ExpressionAttributeNames: { '#walletId': 'walletId', '#contractAddress': 'contractAddress' },
    ExpressionAttributeValues: { ':walletId': '0xda121ab48c7675e4f25e28636e3efe602e49eec6', ':contractAddress': 'contract-address' },
    KeyConditionExpression: '#walletId = :walletId AND #contractAddress = :contractAddress'
  };
  const results = await DynamoDbQuery.item.query(payload);
  console.log('Query item:', results.Items);
};

const queryCreatedAssetsLsi = async () => {
  const payload = {
    TableName: "created-assets",
    IndexName: 'tokenId-index',
    ExpressionAttributeNames: { '#walletId': 'walletId', '#tokenId': 'tokenId' },
    ExpressionAttributeValues: { ':walletId': '0xda121ab48c7675e4f25e28636e3efe602e49eec6', ':tokenId': 123 },
    KeyConditionExpression: '#walletId = :walletId AND #tokenId = :tokenId'
  };
  const results = await DynamoDbQuery.item.query(payload);
  console.log('Query item:', results.Items);
};

const queryCollection = async () => {
  const payload = {
    TableName: "collection",
    ExpressionAttributeNames: { '#category': 'category', '#active': 'active' },
    ExpressionAttributeValues: { ':category': 'photography', ':active': 0 },
    KeyConditionExpression: '#category = :category AND #active = :active'
  };
  const results = await DynamoDbQuery.item.query(payload);
  console.log('Query item:', results.Items);
};

const queryCollectionLsi = async () => {
  const payload = {
    TableName: "collection",
    IndexName: 'id-lsi',
    ExpressionAttributeNames: { '#category': 'category', '#id': 'id' },
    ExpressionAttributeValues: { ':category': 'photography', ':id': 123 },
    KeyConditionExpression: '#category = :category AND #id = :id'
  };
  const results = await DynamoDbQuery.item.query(payload);
  console.log('Query item:', results.Items);
};

const queryCollectionGsi = async () => {
  const payload = {
    TableName: "collection",
    IndexName: 'id-gsi',
    ExpressionAttributeNames: { '#id': 'id' },
    ExpressionAttributeValues: { ':id': 456 },
    KeyConditionExpression: '#id = :id'
  };
  const results = await DynamoDbQuery.item.query(payload);
  console.log('Query item:', results.Items);
};

const queryCollectionGsi2 = async () => {
  const payload = {
    TableName: "collection",
    IndexName: 'owner-gsi',
    ExpressionAttributeNames: { '#owner': 'owner', '#active': 'active' },
    ExpressionAttributeValues: { ':owner': '0xda121ab48c7675e4f25e28636e3efe602e49eec6', ':active': 0 },
    KeyConditionExpression: '#owner = :owner AND #active = :active'
  };
  const results = await DynamoDbQuery.item.query(payload);
  console.log('Query item:', results.Items);
};

const query = async () => {
  // await queryCreatedAssets();
  await queryCreatedAssetsLsi();
  // await queryCollection();
  // await queryCollectionLsi();
  // await queryCollectionGsi();
  // await queryCollectionGsi2();
};

const getUsers = async () => {
  const payload = {
    TableName: "users",
    Key: {
      'walletId': '0xda121ab48c7675e4f25e28636e3efe602e49eec6'
    }
  };
  const results = await DynamoDbQuery.item.get(payload);
  console.log('Get item:', results.Item);
};

const getCreatedAssets = async () => {
  const payload = {
    TableName: "created-assets",
    Key: {
      'walletId': '0xda121ab48c7675e4f25e28636e3efe602e49eec6',
      'contractAddress': 'contract-address',
      // 'tokenId': 123,
    }
  };
  const results = await DynamoDbQuery.item.get(payload);
  console.log('Get item:', results.Item);
};

const get = async () => {
  await getUsers();
  // await getCreatedAssets();
};

const putContracts = async (val) => {
  const payload = {
    TableName: "contracts",
    Item: {
      'contractAddress': val,
    }
  };
  const results = await DynamoDbQuery.item.put(payload);
};

const putUsers = async (val) => {
  const payload = {
    TableName: "users",
    Item: {
      'walletId': '0xda121ab48c7675e4f25e28636e3efe602e49eec6',
      'name': 'joe',
      'bio': 'this is my bio...',
      'picture': 'c-i-d',
      'notifications': [
        { type: 'buy', message: 'NFT some-name was bought by user user-id', isRead: false, ttl: 'timestamp' },
        { type: 'sell', message: 'NFT some-name has been sold to user user-id', isRead: true, ttl: 'timestamp' },
        { type: 'auction-end', message: 'Auction for NFT some-name has ended', isRead: false, ttl: 'timestamp' },
      ]
    }
  };
  const results = await DynamoDbQuery.item.put(payload);
};

const putCreatedAssets = async (val) => {
  let payload = {
    TableName: "created-assets",
    Item: {
      'walletId': '0xda121ab48c7675e4f25e28636e3efe602e49eec6',
      'contractAddress': 'contract-address',
      'tokenId': 123,
      'commission': 2,
      'cid': 'c-i-d'
    }
  };
  await DynamoDbQuery.item.put(payload);

  payload = {
    TableName: "created-assets",
    Item: {
      'walletId': '0xda121ab48c7675e4f25e28636e3efe602e49eec6',
      'contractAddress': 'contract-address2',
      'tokenId': 123,
      'commission': 2,
      'cid': 'c-i-d'
    }
  };
  await DynamoDbQuery.item.put(payload);

  payload = {
    TableName: "created-assets",
    Item: {
      'walletId': '0xC0E62F2F7FDfFF0679Ab940E29210E229cDCb8ED',
      'contractAddress': 'contract-address2',
      'tokenId': 456,
      'commission': 2,
      'cid': 'c-i-d-2'
    }
  };
  await DynamoDbQuery.item.put(payload);
};

const putCollection = async (val) => {
  const payload = {
    TableName: "collection",
    Item: {
      'category': 'photography',
      'active': 0,
      'id': 123,
      'owner': '0xda121ab48c7675e4f25e28636e3efe602e49eec6'
    }
  };
  await DynamoDbQuery.item.put(payload);

  const payload2 = {
    TableName: "collection",
    Item: {
      'category': 'meme',
      'active': 1,
      'id': 456,
      'owner': '0xC0E62F2F7FDfFF0679Ab940E29210E229cDCb8ED'
    }
  };
  await DynamoDbQuery.item.put(payload2);
};

const put = async (val) => {
  // await putContracts();
  // await putUsers();
  await putCreatedAssets();
  // await putCollection();
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
  } else if (ACTION === 'query') {
    await query();
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
