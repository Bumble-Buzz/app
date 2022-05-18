import Cors from 'cors';
import DynamoDbQuery from '@/components/backend/db/DynamoDbQuery';
import ENUM from '@/enum/ENUM';


export default async function handler(req, res) {
  const data = req.body;
  // console.log('req.body', data);

  // check parameters
  if (!data) return res.status(400).json({ 'error': 'invalid request parameters' });

  let networkId = Number(data.networkId);
  if (!networkId || networkId <= 0) networkId = Number(process.env.NEXT_PUBLIC_CHAIN_ID);
  const network = ENUM.NETWORKS.getNetworkById(networkId);

  let Items = [];
  if (data.ids.length > 0) {
    const payloadKeys = Object.values(data.ids).map(item => ({'contractAddress': item.contractAddress, 'tokenId': item.tokenId}));
    const payload = {
      RequestItems: {
        [network.tables.asset]: { Keys: payloadKeys }
      }
    };
    const results = await DynamoDbQuery.item.getBatch(payload);
    Items = results.Responses.asset;
  }
  const LastEvaluatedKey = undefined;
  const Count = Items.length;
  const ScannedCount = Items.length;

  res.status(200).json({ Items, LastEvaluatedKey, Count, ScannedCount });
};


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
