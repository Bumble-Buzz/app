import Cors from 'cors';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import S3Query from '@/components/backend/s3/S3Query';
import IPFS from '@/utils/ipfs-js';
import { IncomingForm } from 'formidable';

export const config = {
  api: {
    bodyParser: false
  }
};

const asyncParse = (req) => {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({ multiples: true });
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

export default async function handler(req, res) {
  const result = await asyncParse(req);
  
  // const files = [
  //   {
  //     name: result.fields.name,
  //     path: result.files.image.filepath
  //   }
  // ];
  // const cid = await IPFS.add(files, false);

  const fileName = uuidv4();
  const fileBuffer = fs.readFileSync(result.files.image.filepath);
  const params = { Bucket: process.env.AWS_S3_BUCKET_NAME, Key: `image/${fileName}`, Body: fileBuffer };
  // const params = { Bucket: "bumblebuzz", Key: `image/${uuidv4(result.files.image)}`, Body: fileBuffer };
  await S3Query.put(params);

  // const urlParams = { Bucket: process.env.AWS_S3_BUCKET_NAME , Key: "image/480bc579-6d61-4dea-b1ca-b0d8bd318a9b" };
  // const url = await S3Query.signedUrl(urlParams);
  // console.log('url', url);
  // get:  https://bumblebuzz.s3.us-east-1.amazonaws.com/image/480bc579-6d61-4dea-b1ca-b0d8bd318a9b?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA344E2BD5FK3G6ZWW%2F20220513%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220513T194619Z&X-Amz-Expires=3600&X-Amz-Signature=c360b1434636d8149985077d407bbaad42525d778d9aea70b166e8298311f2c5&X-Amz-SignedHeaders=host&x-id=GetObject
  // port: https://bumblebuzz.s3.us-east-1.amazonaws.com/image/89773281-d1a6-4c5e-8928-c10f8bc2427c?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA344E2BD5FK3G6ZWW%2F20220513%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220513T194503Z&X-Amz-Expires=3600&X-Amz-Signature=8e8dae9696ee1a1e0c655e8d9dfcb6500113e03d3bdf9d7754091fe8e7bc67ed&X-Amz-SignedHeaders=content-length%3Bhost&x-id=PutObject

  // remove file from server as cleanup
  fs.unlinkSync(result.files.image.filepath);

  res.status(200).json(fileName);
}

// Initializing the cors middleware
const cors = Cors({
  methods: ['GET', 'HEAD'],
});
    
// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
};

// import multer from 'multer';
// import Cors from 'cors';
// const fs = require("fs");
// import IPFS from '@/utils/ipfs-js';

// export const config = {
//   api: {
//     bodyParser: false, // Disallow body parsing, consume as stream
//   },
// };

// // Initializing the cors middleware
// const cors = Cors({
//   methods: ['GET', 'HEAD'],
// });

// function runMiddleware(req, res, fn) {
//   return new Promise((resolve, reject) => {
//     fn(req, res, (result) => {
//       if (result instanceof Error) {
//         return reject(result)
//       }

//       return resolve(result)
//     })
//   })
// };

// const upload = multer({
//   storage: multer.diskStorage({
//     destination: (req, file, cb) => cb(null, '/tmp'),
//     filename: (req, file, cb) => cb(null, file.originalname),
//   }),
// });

// export default async function handler(req, res) {
//   await runMiddleware(req, res, upload.single('image'));

//   console.log('req.file', req.file);

//   const file = req.file;
//   const files = [
//     {
//       name: file.originalname,
//       path: file.path
//     }
//   ];

//   console.log('files', files);
//   const cid = await IPFS.add(files, false);

//   // remove file from server as cleanup
//   fs.unlinkSync(files[0].path);
//   console.log(`delete file ${files[0].path} from server`);

//   // Rest of the API logic
//   // res.json({ message: 'Hello Everyone!' })

//   console.log('image cid:', cid);
//   res.status(200).json(cid);
// }
