import axios from 'axios';
import useSWR from 'swr';


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
  swr: {
    fetcher: (url) => API.get(url).then(res => res.data),
    options: {
      refreshInterval: 0, // disable auto api call
      revalidateOnFocus: false,
    },
    ipfs: {
      config: (key,param) => `ipfs/get/config?${key}=${param}`
    },
    db: {
      table: {
        list: (key,param) => `db/table/list?${key}=${param}`
      }
    },
    user: {
      id: (id) => `user/${id}`
    },
    asset: {
      created: (id,tokenId,limit) => `asset/created/${id}?tokenId=${tokenId}&limit=${limit}`
    },
    collection: {
      id: (id) => `collection/${id}`,
      owned: (owner,id,limit) => `collection/owned/${owner}?id=${id}&limit=${limit}`,
      pending: (owner,address,limit) => `collection/pending?owner=${owner}&address=${address}&limit=${limit}`,
      active: (id,limit) => `collection/active?id=${id}&limit=${limit}`,
      inactive: (id,limit) => `collection/inactive?id=${id}&limit=${limit}`
    },
    contracts: (limit,uid,chain) => `contracts?limit=${limit}&uid=${uid}&chain=${chain}`
  },
  ipfs: {
    put: {
      image: payload => API.put(`ipfs/image`, payload),
      config: payload => API.put(`ipfs/config`, payload),
    },
    get: {
      config: payload => API.post(`ipfs/get/config`, payload)
    }
  },
  collection: {
    id: id => API.get(`collection/${id}`),
    create: payload => API.post(`collection/create`, payload),
    activate: id => API.post(`collection/${id}/activate`),
    deactivate: id => API.post(`collection/${id}/deactivate`)
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
      getBatch: payload => API.put(`db/item/getBatch`, payload),
      put: payload => API.put(`db/item/put`, payload),
      putBatch: payload => API.put(`db/item/putBatch`, payload),
      update: payload => API.put(`db/item/update`, payload),
      delete: payload => API.put(`db/item/delete`, payload),
      deleteBatch: payload => API.put(`db/item/deleteBatch`, payload),
      scan: payload => API.put(`db/item/scan`, payload)
    },
  },
  cancelApi
}

export default apis