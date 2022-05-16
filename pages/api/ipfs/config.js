import Cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import S3Query from '@/components/backend/s3/S3Query';
import IPFS from '@/utils/ipfs-js';


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


export default async function handler(req, res) {
  // const data = [
  //   {
  //     path: req.body.name,
  //     content: Buffer.from(JSON.stringify(req.body))
  //   }
  // ];
  // const cid = await IPFS.addData(data, false);

  const fileName = uuidv4();
  const params = { Bucket: process.env.AWS_S3_BUCKET_NAME, Key: `config/${fileName}`, Body: JSON.stringify(req.body) };
  await S3Query.put(params);

  console.log('config fileName:', fileName);
  res.status(200).json(fileName);
}
