const fs = require("fs");
const path = require('path');
const slash = require('slash');
const glob = require('glob');
const CheckEnvironment = require('@/components/CheckEnvironment');


const ipfsClient = require('ipfs-http-client');
let ipfs;
if (CheckEnvironment.isK8) {
  // ipfs = ipfsClient.create({ host: 'localhost', port: '5001', protocol: 'http' });
  // ipfs = ipfsClient.create({ protocol: 'https', port: '443', host: 'ipfs.bumblebuzz.io', path: 'create' });
  // ipfs = ipfsClient.create({ url: 'https://ipfs.bumblebuzz.io/create' });
  // ipfs = ipfsClient.create({ url: 'https://ipfspost.bumblebuzz.io' });
  ipfs = ipfsClient.create({ host: 'service-name.mydomain.com', port: '5001', protocol: 'http' });
  // ipfs = ipfsClient.create({ url: 'service-name.mydomain.com' });
} else {
  ipfs = ipfsClient.create({ host: 'localhost', port: '5001', protocol: 'http' });
}


const add = async (_inputFiles, _inDirectory = true) => {
  const inputFilesContent = [];
  _inputFiles.forEach(inputFile => {
      const fileName = inputFile.name;
      const fileBuffer = fs.readFileSync(inputFile.path)
      inputFilesContent.push({ path: fileName, content: fileBuffer });
  });

  if (_inputFiles.length > 1) {
    _inDirectory = true;
  }

  const ipfsObject = await ipfs.add(inputFilesContent, { pin: true, wrapWithDirectory: _inDirectory });
  const cid = ipfsObject.cid.toString();
  return cid
};

const addData = async (_data, _inDirectory = true) => {
  if (_data.length > 1) {
    _inDirectory = true;
  }

  const ipfsObject = await ipfs.add(_data, { wrapWithDirectory: _inDirectory });
  const cid = ipfsObject.cid.toString();
  return cid
};


module.exports = {
  add,
  addData
}