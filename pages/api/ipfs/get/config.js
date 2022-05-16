import Cors from 'cors';
import axios from 'axios';
import IPFS from '@/utils/ipfs';


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

const API = axios.create({
  baseURL: IPFS.getIpfsBaseUrl()
});


export default async function handler(req, res) {
  const config = await API.get(req.body.tokenURI);

  res.status(200).json(config.data);
}
