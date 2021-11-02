const execFile = require('child_process').execFile;

export default async function handler(req, res) {

    const response = await execFile('ipfs', ['swarm', 'peers'], (err, stdout, stderr) => {
        // if (err) {
        //   return reject(stderr)
        // }
        // const match = stdout.match(
        //   new RegExp('pinned ([a-zA-Z0-9]+) recursively')
        // )
        // if (!match) {
        //   reject(new Error('Can not pin: ' + ipfs))
        // }
        console.log('stdout', stdout);
        return resolve()
      })

    //   console.log('response', response);
    // const data = await response.json();
    // res.status(200).json(data);
}