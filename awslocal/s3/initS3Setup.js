const SCRIPT_ARGS = require('minimist')(process.argv.slice(2));
process.env.NEXT_PUBLIC_APP_ENV = SCRIPT_ARGS.mode || 'dev';
const ACTION = SCRIPT_ARGS.action;
const TABLE_NAME = SCRIPT_ARGS.table;
const S3Query = require('../../components/backend/s3/S3Query');

const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000'



const create = async () => {
  const params = { Bucket: "bumblebuzz" };
  const results = await S3Query.create(params);
  console.log('bucket created:', results);
};

const put = async () => {
  const params = { Bucket: "bumblebuzz", Key: "assets/OBJECT_NAME", Body: "BODY" };
  const results = await S3Query.put(params);
  console.log('put:', results);
};

const get = async () => {
  const streamToString = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });

  const params = { Bucket: "bumblebuzz", Key: "assets/OBJECT_NAME" };
  const results = await S3Query.get(params);
  const bodyContents = await streamToString(results.Body);
  console.log(bodyContents);
  // console.log('get:', results);
};

const list = async () => {
  const params = { Bucket: "bumblebuzz" };
  const results = await S3Query.list(params);
  console.log('list:', results);
};

(async () => {
  if (ACTION === 'list') {
    await list();
  } else if (ACTION === 'create') {
    await create();
  } else if (ACTION === 'put') {
    await put();
  } else if (ACTION === 'get') {
    await get();
  } else if (ACTION === 'list') {
    await list();
  }  else {}
})();
