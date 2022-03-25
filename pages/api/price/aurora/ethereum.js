import Cors from 'cors';
import axios from 'axios';


const API = axios.create({
  baseURL: 'https://api.aurorascan.dev/api'
});


export default async function handler(req, res) {
  const config = await API.get(`?module=stats&action=ethprice&apikey=${process.env.AURORA_SCAN}`);
  res.status(200).json(config.data.result);
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
