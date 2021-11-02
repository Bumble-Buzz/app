import Cors from 'cors';

// Initializing the cors middleware
const cors = Cors({
    methods: ['GET', 'HEAD'],
  })
  
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
  }
  

export default async function handler(req, res) {
    // Run the middleware
    await runMiddleware(req, res, cors);

    const uriUrl = req.body.uriUrl;
    console.log('uriUrl', uriUrl);
    const response = await fetch(uriUrl);
    const data = await response.json();
    console.log(data);
    res.status(201).json(data);
}