const SCRIPT_ARGS = require('minimist')(process.argv.slice(2));

const fs = require('fs');
const S3Query = require('../../components/backend/s3/S3Query');

process.env.NEXT_PUBLIC_APP_ENV = SCRIPT_ARGS.mode || 'dev';
const ACTION = SCRIPT_ARGS.action;


const create = async () => {
  const params = { Bucket: "bumblebuzz" };
  const results = await S3Query.create(params);
  console.log('bucket created:', results);
};

const put = async () => {
  const params = { Bucket: "bumblebuzz" , Key: "assets/OBJECT_NAME", Body: "BODY" };
  const results = await S3Query.put(params);
  console.log('put:', results);
};

const putImage = async () => {
  const fileStream = fs.createReadStream('public/avocado.jpeg');

  const params = { Bucket: "bumblebuzz" , Key: "assets/avocado.jpeg", Body: fileStream };
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

  const params = { Bucket: "bumblebuzz" , Key: "asset/image/251a5032-178f-4910-a9c9-7eb2e6422200" };
  const results = await S3Query.get(params);
  const bodyContents = await streamToString(results.Body);
  console.log(bodyContents);
  // console.log('get:', results);
};

const list = async () => {
  const params = { Bucket: "bumblebuzz" , Prefix: 'asset/config/c76ad10b-1ae1-4c34-8fd3-67dcfb8237b2' };
  const results = await S3Query.list(params);
  console.log('list:', results);
};

(async () => {
  if (ACTION === 'list') {
    await list();
  } else if (ACTION === 'create') {
    await create();
  } else if (ACTION === 'put') {
    await putImage();
  } else if (ACTION === 'get') {
    await get();
  } else if (ACTION === 'list') {
    await list();
  }  else {}
})();
