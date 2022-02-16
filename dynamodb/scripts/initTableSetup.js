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

const assets = async () => {
  const payload = {
    TableName: "asset",
    AttributeDefinitions: [
      { AttributeName: "contractAddress", AttributeType: "S" },
      { AttributeName: "tokenId", AttributeType: "N" },
      { AttributeName: "creator", AttributeType: "S" },
      { AttributeName: "owner", AttributeType: "S" }
    ],
    KeySchema: [
      { AttributeName: "contractAddress", KeyType: "HASH" },
      { AttributeName: "tokenId", KeyType: "RANGE" }
    ],
    LocalSecondaryIndexes: [
      {
        IndexName: "creator-lsi",
        KeySchema: [
          { AttributeName: "contractAddress", KeyType: "HASH" },
          { AttributeName: "creator", KeyType: "RANGE" }
        ],
        Projection: {
          NonKeyAttributes: [],
          ProjectionType: "ALL"
        }
      },
      {
        IndexName: "owner-lsi",
        KeySchema: [
          { AttributeName: "contractAddress", KeyType: "HASH" },
          { AttributeName: "owner", KeyType: "RANGE" }
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
      { AttributeName: "id", AttributeType: "N" },
      { AttributeName: "category", AttributeType: "S" },
      { AttributeName: "owner", AttributeType: "S" },
      { AttributeName: "active", AttributeType: "N" }
    ],
    KeySchema: [
      { AttributeName: "id", KeyType: "HASH" },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "category-gsi",
        KeySchema: [
          { AttributeName: "category", KeyType: "HASH" },
          { AttributeName: "active", KeyType: "RANGE" }
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

const sales = async () => {
  const payload = {
    TableName: "sales",
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "N" },
      { AttributeName: "category", AttributeType: "S" },
      { AttributeName: "active", AttributeType: "N" }
    ],
    KeySchema: [
      { AttributeName: "id", KeyType: "HASH" }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "category-gsi",
        KeySchema: [
          { AttributeName: "category", KeyType: "HASH" },
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

const assetsDelete = async () => {
  const payload = {
    TableName: "asset"
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

const salesDelete = async () => {
  const payload = {
    TableName: "sales"
  };
  const results = await DynamoDbQuery.table.delete(payload);
  console.log('table deleted:', results.TableDescription.TableName);
};

const create = async () => {
  // await contracts();
  // await users();
  await assets();
  // await collection();
  // await sales();
};

const cleanup = async () => {
  // await contractsDelete();
  // await usersDelete();
  await assetsDelete();
  // await collectionDelete();
  // await salesDelete();
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

const queryAssets = async () => {
  const payload = {
    TableName: "asset",
    ExpressionAttributeNames: { '#contractAddress': 'contractAddress', '#tokenId': 'tokenId' },
    ExpressionAttributeValues: { ':contractAddress': 'contract-address', ':tokenId': 123 },
    KeyConditionExpression: '#contractAddress = :contractAddress AND #tokenId = :tokenId'
  };
  const results = await DynamoDbQuery.item.query(payload);
  console.log('Query item:', results.Items);
};

const queryAssetsLsi = async () => {
  const payload = {
    TableName: "asset",
    IndexName: 'creator-lsi',
    ExpressionAttributeNames: { '#contractAddress': 'contractAddress', '#creator': 'creator' },
    ExpressionAttributeValues: { ':contractAddress': 'contract-address', ':creator': '0xda121ab48c7675e4f25e28636e3efe602e49eec6' },
    KeyConditionExpression: '#contractAddress = :contractAddress AND #creator = :creator'
  };
  const results = await DynamoDbQuery.item.query(payload);
  console.log('Query item:', results.Items);
};

const queryCollection = async () => {
  const payload = {
    TableName: "collection",
    ExpressionAttributeNames: { '#id': 'id' },
    ExpressionAttributeValues: { ':id': 123 },
    KeyConditionExpression: '#id = :id'
  };
  const results = await DynamoDbQuery.item.query(payload);
  console.log('Query item:', results.Items);
};

const queryCollectionGsi = async () => {
  const payload = {
    TableName: "collection",
    IndexName: 'category-gsi',
    ExpressionAttributeNames: { '#category': 'category', '#active': 'active' },
    ExpressionAttributeValues: { ':category': 'photography', ':active': 0 },
    KeyConditionExpression: '#category = :category AND #active = :active'
  };
  const results = await DynamoDbQuery.item.query(payload);
  console.log('Query item:', results.Items);
};

const queryCollectionGsi2 = async () => {
  const payload = {
    TableName: "collection",
    IndexName: 'owner-gsi',
    ExpressionAttributeNames: { '#owner': 'owner', '#active': 'active' },
    ExpressionAttributeValues: { ':owner': '0xC0E62F2F7FDfFF0679Ab940E29210E229cDCb8ED', ':active': 1 },
    KeyConditionExpression: '#owner = :owner AND #active = :active'
  };
  const results = await DynamoDbQuery.item.query(payload);
  console.log('Query item:', results.Items);
};

const querySales = async () => {
  const payload = {
    TableName: "sales",
    ExpressionAttributeNames: { '#id': 'id' },
    ExpressionAttributeValues: { ':id': 1 },
    KeyConditionExpression: '#id = :id'
  };
  const results = await DynamoDbQuery.item.query(payload);
  console.log('Query item:', results.Items);
};

const querySalesGsi = async () => {
  const payload = {
    TableName: "sales",
    IndexName: 'category-gsi',
    ExpressionAttributeNames: { '#category': 'category', '#active': 'active' },
    ExpressionAttributeValues: { ':category': 'photography', ':active': 0 },
    KeyConditionExpression: '#category = :category AND #active = :active'
  };
  const results = await DynamoDbQuery.item.query(payload);
  console.log('Query item:', results.Items);
};

const query = async () => {
  // await queryAssets();
  // await queryAssetsLsi();
  // await queryCollection();
  // await queryCollectionGsi();
  // await queryCollectionGsi2();
  // await querySales();
  await querySalesGsi();
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

const putAssets = async (val) => {
  let payload = {
    TableName: "asset",
    Item: {
      'contractAddress': 'contract-address',
      'tokenId': 123,
      'creator': '0xda121ab48c7675e4f25e28636e3efe602e49eec6',
      'owner': '0xda121ab48c7675e4f25e28636e3efe602e49eec6',
      'cid': 'c-i-d'
    }
  };
  await DynamoDbQuery.item.put(payload);

  payload = {
    TableName: "asset",
    Item: {
      'contractAddress': 'contract-address',
      'tokenId': 456,
      'creator': '0xda121ab48c7675e4f25e28636e3efe602e49eec6',
      'owner': '0xda121ab48c7675e4f25e28636e3efe602e49eec6',
      'cid': 'c-i-d'
    }
  };
  await DynamoDbQuery.item.put(payload);

  payload = {
    TableName: "asset",
    Item: {
      'contractAddress': 'contract-address2',
      'tokenId': 789,
      'creator': '0xda121ab48c7675e4f25e28636e3efe602e49eec6',
      'owner': '0xC0E62F2F7FDfFF0679Ab940E29210E229cDCb8ED',
      'cid': 'c-i-d-2'
    }
  };
  await DynamoDbQuery.item.put(payload);
};

const putCollection = async (val) => {
  const payload = {
    TableName: "collection",
    Item: {
      'id': 123,
      'category': 'photography',
      'owner': '0xda121ab48c7675e4f25e28636e3efe602e49eec6',
      'commission': 2,
      'active': 0
    }
  };
  await DynamoDbQuery.item.put(payload);

  const payload2 = {
    TableName: "collection",
    Item: {
      'id': 456,
      'category': 'meme',
      'owner': '0xC0E62F2F7FDfFF0679Ab940E29210E229cDCb8ED',
      'commission': 3,
      'active': 1
    }
  };
  await DynamoDbQuery.item.put(payload2);
};

const putSales = async (val) => {
  let payload = {
    TableName: "sales",
    Item: {
      'id': 1,
      'contractAddress': 'contract-address',
      'tokenId': 123,
      'category': 'photography',
      'seller': '0xda121ab48c7675e4f25e28636e3efe602e49eec6',
      'buyer': 'buyer-address',
      'commission': 2,
      'active': 0
    }
  };
  await DynamoDbQuery.item.put(payload);

  payload = {
    TableName: "sales",
    Item: {
      'id': 2,
      'contractAddress': 'contract-address',
      'tokenId': 456,
      'category': 'photography',
      'seller': '0xC0E62F2F7FDfFF0679Ab940E29210E229cDCb8ED',
      'buyer': '',
      'commission': 3,
      'active': 0
    }
  };
  await DynamoDbQuery.item.put(payload);

  payload = {
    TableName: "sales",
    Item: {
      'id': 3,
      'contractAddress': 'contract-address2',
      'tokenId': 789,
      'category': 'meme',
      'seller': '0xC0E62F2F7FDfFF0679Ab940E29210E229cDCb8ED',
      'buyer': '',
      'commission': 3,
      'active': 1
    }
  };
  await DynamoDbQuery.item.put(payload);
};

const put = async (val) => {
  // await putContracts();
  // await putUsers();
  await putAssets();
  // await putCollection();
  // await putSales();
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