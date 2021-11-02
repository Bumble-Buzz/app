import Cors from 'cors';
import IPFS from '../../utils/ipfs';
const nodeFetch = require('node-fetch');

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
  

const fetchUriData = async (uriUrl) => {
  // console.log('uriUrl', uriUrl);
  const response = await nodeFetch(uriUrl);
  const body = await response.json();
  // console.log('body', body);
  return body;
};

const getResponseJson = async (response) => {
  return response.json();
};

export default async function handler(req, res) {
  // Run the middleware
  // await runMiddleware(req, res, cors);

  let data = [];
  const TOKEN_URI_PROMISES = [];
  const tokenUris = req.body.tokenUris;
  for (const tokenUri of tokenUris) {
    const uriUrl = IPFS.getValidHttpUrl(tokenUri);
    // console.log('uriUrl', uriUrl);

    const uriDataPromise = await fetchUriData(uriUrl);
    // console.log('uriDataPromise', uriDataPromise);
    TOKEN_URI_PROMISES.push(uriDataPromise);


    // const response = await fetch(uriUrl);
    // data.push(await response.json());
    // console.log(data);
  }
  

  // const fetchUriDataResponses = await Promise.all(TOKEN_URI_PROMISES);
  // console.log(TOKEN_URI_PROMISES);

  // const fetchUriDataResponsePromises = [];
  // for (const fetchUriDataResponse of TOKEN_URI_PROMISES) {
  //   const fetchUriDataResponsePromise = getResponseJson(fetchUriDataResponse);
  //   fetchUriDataResponsePromises.push(fetchUriDataResponsePromise);
  // }

  // const getResponseJsonResponses = await Promise.all(fetchUriDataResponsePromises);
  // console.log(getResponseJsonResponses);

  // await Promise.all(TOKEN_URI_PROMISES).then(async (_uriData) => {
  //   console.log('_uriData', _uriData);
  //   res.status(201).json(_uriData);
  // });
  res.status(201).json(TOKEN_URI_PROMISES);
}