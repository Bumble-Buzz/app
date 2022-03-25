import Cors from 'cors';
import axios from 'axios';


const API = axios.create({
  baseURL: 'https://api.coingecko.com/api/v3/simple/price'
});


export default async function handler(req, res) {
  const config = await API.get('?ids=ethereum&vs_currencies=usd');
  res.status(200).json({ ethusd: config.data.ethereum.usd.toString() });
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
