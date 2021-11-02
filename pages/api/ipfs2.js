const execFile = require('child_process').execFile;

export default async function handler(req, res) {
    const response = await fetch('http://localhost:8080/ipfs/bafybeidt3sruvpojeq2bo3a4c7kjdmj6dl3dskgiz54hp7mxlv2qocn42y/1.json');
    const data = await response.json();
    res.status(200).json(data);
}