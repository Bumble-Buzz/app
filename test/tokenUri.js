const { assert, expect } = require('chai');
require('chai').use(require('chai-as-promised')).should();



const NAME = 'Avaxocado';
const SYMBOL = 'ACD';
const BASE_URI = 'ipfs://some-cid/';
let ACCOUNTS = [];
let CONTRACT;
describe("AvaxocadoNft - tokenURI", () => {
  before(async () => {
    ACCOUNTS = await ethers.getSigners();
  });

  beforeEach(async () => {
    const contractFactory = await ethers.getContractFactory("AvaxocadoNft");
    CONTRACT = await contractFactory.deploy(NAME, SYMBOL, BASE_URI);
    await CONTRACT.deployed();
    await CONTRACT.setContractRevealState(true);
  });

  describe('unsuccessful tokenUri', async () => {
    it('tokenUri does not exist', async () => {
      await CONTRACT.tokenURI(0).should.be.rejectedWith('ERC721Metadata: URI query for nonexistent token');
    });

    it('contract not revealed', async () => {
      await CONTRACT.setContractRevealState(false);
      await CONTRACT.mint(ACCOUNTS[1].address, 1);
      const tokenUri = await CONTRACT.tokenURI(1);
      expect(tokenUri).to.be.equal('');
    });

    it('no base uri', async () => {
      const contractFactory = await ethers.getContractFactory("AvaxocadoNft");
      const localContract = await contractFactory.deploy(NAME, SYMBOL, '');
      await localContract.mint(ACCOUNTS[1].address, 1);
      await localContract.tokenURI(1);
      const tokenUri = await localContract.tokenURI(1);
      expect(tokenUri).to.be.equal('');
    });
  });

  describe('successful tokenUri', async () => {
    it('tokenUri does exist', async () => {
      await CONTRACT.mint(ACCOUNTS[1].address, 1);
      await CONTRACT.tokenURI(1);
    });

    it('get tokenUri', async () => {
      await CONTRACT.mint(ACCOUNTS[1].address, 1);
      const tokenUri = await CONTRACT.tokenURI(1);
      expect(tokenUri).to.be.equal(`${BASE_URI}1.json`);
    });
  });
});
