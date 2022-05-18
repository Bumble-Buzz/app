import Cors from 'cors';
import DynamoDbQuery from '@/components/backend/db/DynamoDbQuery';
import ENUM from '@/enum/ENUM';


export default async function handler(req, res) {
  const { id, networkId } = req.query
  // console.log('api param:', id);

  //check params
  if (!id || !Number.isInteger(Number(id))) return res.status(400).json({ error: `collection id '${id}' is invalid` });

  const collectionId = Number(id);

  let formattedNetworkId = Number(networkId);
  if (!formattedNetworkId || formattedNetworkId <= 0) formattedNetworkId = Number(process.env.NEXT_PUBLIC_CHAIN_ID);
  const network = ENUM.NETWORKS.getNetworkById(formattedNetworkId);

  let payload = {
    TableName: network.tables.collection,
    ExpressionAttributeNames: { '#id': 'id' },
    ExpressionAttributeValues: { ':id': collectionId },
    KeyConditionExpression: '#id = :id',
  };
  let results = await DynamoDbQuery.item.query(payload);
  const {Items, LastEvaluatedKey, Count, ScannedCount} = results;

  if (Items.length > 0) {
    payload = {
      TableName: network.tables.user,
      Key: {
        'walletId': Items[0].owner
      }
    };
    results = await DynamoDbQuery.item.get(payload);
    const { Item } = results;
    if (Item) Items[0].ownerName = Item.name;
  }

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
