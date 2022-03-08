import Cors from 'cors';
const fs = require("fs");
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
  const data = [
    {
      path: req.body.name,
      content: Buffer.from(JSON.stringify(req.body))
    }
  ];
  const cid = await IPFS.addData(data, false);

  console.log('config cid:', cid);
  res.status(200).json(cid);
}
