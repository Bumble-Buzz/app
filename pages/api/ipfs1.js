const execFile = require('child_process').execFile;

export default async function handler(req, res) {
    const response = await fetch('http://localhost:8080/ipfs/QmW8vjBKPYt7fQZ4yNjdxe1RbE3Ty3W9oMBc7upq5Jrg3o/1.json');
    const data = await response.json();
    res.status(200).json(data);
}