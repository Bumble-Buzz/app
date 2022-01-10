const fs = require("fs");
const path = require('path');
const slash = require('slash');
const glob = require('glob');

const ipfsClient = require('ipfs-http-client');
const ipfs = ipfsClient.create({ host: 'localhost', port: '5001', protocol: 'http' });
// const ipfs = ipfsClient.create({ host: 'ipfs', port: '5001', protocol: 'http' });

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

  const ipfsObject = await ipfs.add(inputFilesContent, { wrapWithDirectory: _inDirectory });
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