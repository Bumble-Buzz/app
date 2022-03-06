import Cors from 'cors';
const fs = require("fs");
import IPFS from '../../../utils/ipfs-js';
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
  
  const files = [
    {
      name: result.fields.name,
      path: result.files.image.filepath
    }
  ];
  const cid = await IPFS.add(files, false);

  // remove file from server as cleanup
  fs.unlinkSync(files[0].path);

  res.status(200).json(cid);
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
// import IPFS from '../../../utils/ipfs-js';

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
