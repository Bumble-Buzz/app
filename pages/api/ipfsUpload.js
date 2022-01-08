import Cors from 'cors';
const fs = require("fs");
import IPFS from '../../utils/ipfs-js';
import { IncomingForm } from 'formidable';


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
  
  const files = [
    {
      name: result.fields.name,
      path: result.files.image.filepath
    }
  ];
  const cid = await IPFS.add(files, false);

  console.log('name:', files[0].name);
  console.log('path:', files[0].path);
  console.log('cid:', cid);

  // remove file from server as cleanup
  fs.unlinkSync(files[0].path);
  console.log(`delete file ${files[0].path} from server`);

  res.status(200).json(cid);
  // res.status(200).json({ result, cid });
}