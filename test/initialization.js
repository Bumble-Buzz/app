const { assert, expect } = require('chai');


const NAME = 'Avaxocado';
const SYMBOL = 'ACD';
const BASE_URI = '';
let ACCOUNTS = [];
let CONTRACT;
describe("AvaxocadoNft - initialization", () => {
  before(async () => {
    ACCOUNTS = await ethers.getSigners();
  });

  beforeEach(async () => {
    const contractFactory = await ethers.getContractFactory("AvaxocadoNft");
    CONTRACT = await contractFactory.deploy(NAME, SYMBOL, BASE_URI);
    await CONTRACT.deployed();
  });

  it('deploys successfully', async () => {
    const address = await CONTRACT.address;
    assert.notEqual(address, '');
    assert.notEqual(address, 0x0);
  });

  it('owner', async () => {
    const owner = await CONTRACT.owner();
    expect(owner).to.be.equal(ACCOUNTS[0].address);
  });

  it('name', async () => {
    const name = await CONTRACT.name();
    expect(name).to.be.equal(NAME);
  });

  it('symbol', async () => {
    const symbol = await CONTRACT.symbol();
    expect(symbol).to.be.equal(SYMBOL);
  });

  it('supply', async () => {
    const supply = await CONTRACT.totalSupply();
    expect(supply).to.equal(0);
  });
});
