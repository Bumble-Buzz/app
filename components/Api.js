import axios from 'axios';

const API = axios.create({
  baseURL: '/api/'
});
const API_CANCEL = axios.CancelToken.source();


/***************************
******** API CALLs *********
****************************/

// cancel api call
const cancelApi = () => {
  API_CANCEL.cancel("Cancelling in cleanup");
};


const apis = {
  ipfs: {
    image: payload => API.put(`ipfs/image`, payload),
    config: payload => API.put(`ipfs/config`, payload),
  },
  db: {
    table: {
      list: payload => API.put(`db/table/list`, payload),
      create: payload => API.put(`db/table/create`, payload),
      status: payload => API.put(`db/table/status`, payload),
      delete: payload => API.put(`db/table/delete`, payload),
      scan: payload => API.put(`db/table/scan`, payload)
    },
    item: {
      get: payload => API.put(`db/item/get`, payload),
      put: payload => API.put(`db/item/put`, payload),
      delete: payload => API.put(`db/item/delete`, payload)
    },
  },
  cancelApi
}

export default apis