import axios from 'axios';

const BACKEND_API = axios.create({
  baseURL: 'http://localhost:3000/api/'
});
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


module.exports = {
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
      id: (contract,tokenId) => `asset/${contract}/${tokenId}`,
      created: (id,tokenId,limit) => `asset/created/${id}?tokenId=${tokenId}&limit=${limit}`,
      collection: (id,tokenId,limit) => `asset/${id}?tokenId=${tokenId}&limit=${limit}`
    },
    collection: {
      id: (id) => `collection/${id}`,
      owned: (owner,id,limit) => `collection/owned/${owner}?id=${id}&limit=${limit}`,
      pending: (owner,address,limit) => `collection/pending?owner=${owner}&address=${address}&limit=${limit}`,
      active: (id,limit) => `collection/active?id=${id}&limit=${limit}`,
      inactive: (id,limit) => `collection/inactive?id=${id}&limit=${limit}`
    },
    sale: {
      id: (contract,tokenId) => `sale/${contract}/${tokenId}`,
      all: (id,tokenId,limit) => `sale/all?id=${id}&tokenId=${tokenId}&limit=${limit}`
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
  asset: {
    id: (contract,tokenId) => API.get(`asset/${contract}/${tokenId}`),
    create: payload => API.post(`asset/create`, payload),
    batch: payload => API.post(`asset/batch`, payload),
    created: (id,tokenId,limit) => API.get(`asset/created/${id}?tokenId=${tokenId}&limit=${limit}`),
    collection: (id,tokenId,limit) => API.get(`asset/${id}?tokenId=${tokenId}&limit=${limit}`),
    update: {
      owner: payload => API.post(`asset/update/owner`, payload)
    }
  },
  collection: {
    id: id => API.get(`collection/${id}`),
    owned: (owner,id,limit) => API.get(`collection/owned/${owner}?id=${id}&limit=${limit}`),
    remove: payload => API.post(`collection/remove`, payload),
    active: {
      activate: payload => API.post(`collection/active/activate`, payload),
      deactivate: payload => API.post(`collection/active/deactivate`, payload)
    },
    create: {
      local: payload => API.post(`collection/create/local`, payload),
      verified: payload => API.post(`collection/create/verified`, payload),
      unverified: payload => API.post(`collection/create/unverified`, payload)
    },
    update: {
      id: (id,payload) => API.post(`collection/update/${id}`, payload),
      ownerincentiveaccess: (id,payload) => API.post(`collection/update/${id}/ownerincentiveaccess`, payload)
    }
  },
  sale: {
    id: (contract,tokenId) => API.get(`sale/${contract}/${tokenId}`),
    all: (id,tokenId,limit) => API.post(`sale/all?id=${id}&tokenId=${tokenId}&limit=${limit}`),
    create: payload => API.post(`sale/create`, payload),
    remove: payload => API.post(`sale/remove`, payload)
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
  backend: {
    asset: {
      id: (contract,tokenId) => BACKEND_API.get(`asset/${contract}/${tokenId}`)
    },
    collection: {
      id: id => BACKEND_API.get(`collection/${id}`)
    },
    sale: {
      all: (id,tokenId,limit) => BACKEND_API.post(`sale/all?id=${id}&tokenId=${tokenId}&limit=${limit}`)
    }
  },
  cancelApi
}
