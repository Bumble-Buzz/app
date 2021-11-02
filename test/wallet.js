const { assert, expect } = require('chai');
require('chai').use(require('chai-as-promised')).should();



const NAME = 'Avaxocado';
const SYMBOL = 'ACD';
const BASE_URI = '';
let ACCOUNTS = [];
let CONTRACT;
let PAYABLE_AMOUNT;
describe("AvaxocadoNft - wallet", () => {
  before(async () => {
    PAYABLE_AMOUNT = ethers.utils.parseEther('0.50');
    ACCOUNTS = await ethers.getSigners();
  });

  beforeEach(async () => {
    const contractFactory = await ethers.getContractFactory("AvaxocadoNft");
    CONTRACT = await contractFactory.deploy(NAME, SYMBOL, BASE_URI);
    await CONTRACT.deployed();
  });

  describe('wallet token balance', async () => {
    it('no tokens', async () => {
      const tokenCount = await CONTRACT.balanceOf(ACCOUNTS[1].address);
      expect(tokenCount).to.equal(0);
    });

    it('one token', async () => {
      await CONTRACT.connect(ACCOUNTS[1]).mint(ACCOUNTS[1].address, 1, { value: PAYABLE_AMOUNT });
      const tokenCount = await CONTRACT.balanceOf(ACCOUNTS[1].address);
      expect(tokenCount).to.equal(1);
    });

    it('multiple tokens', async () => {
      await CONTRACT.connect(ACCOUNTS[1]).mint(ACCOUNTS[1].address, 1, { value: PAYABLE_AMOUNT });
      await CONTRACT.connect(ACCOUNTS[1]).mint(ACCOUNTS[1].address, 1, { value: PAYABLE_AMOUNT });
      await CONTRACT.connect(ACCOUNTS[2]).mint(ACCOUNTS[2].address, 1, { value: PAYABLE_AMOUNT });
      await CONTRACT.connect(ACCOUNTS[3]).mint(ACCOUNTS[3].address, 1, { value: PAYABLE_AMOUNT });
      await CONTRACT.connect(ACCOUNTS[1]).mint(ACCOUNTS[1].address, 1, { value: PAYABLE_AMOUNT });
      const tokenCount = await CONTRACT.balanceOf(ACCOUNTS[1].address);
      expect(tokenCount).to.equal(3);
      const supply = await CONTRACT.totalSupply();
      expect(supply).to.equal(5);
    });
  });

  // it('wallet test', async () => {
  //   await CONTRACT.mint(ACCOUNTS[1], 1);
  //   await CONTRACT.mint(ACCOUNTS[1], 1);
  //   await CONTRACT.mint(ACCOUNTS[2], 1);
  //   await CONTRACT.mint(ACCOUNTS[3], 1);
  //   await CONTRACT.mint(ACCOUNTS[1], 1);
  //   const tokenCount = await CONTRACT.balanceOf(ACCOUNTS[1]);
  //   expect(tokenCount).to.be.bignumber.equal(new BN(3));
  //   const supply = await CONTRACT.totalSupply();
  //   expect(supply).to.be.bignumber.equal(new BN(5));

  //   const walletTokens = await CONTRACT.walletTokens(ACCOUNTS[1]);
  //   expect(walletTokens[0]).to.be.bignumber.equal(new BN(1));
  //   expect(walletTokens[1]).to.be.bignumber.equal(new BN(2));
  //   expect(walletTokens[2]).to.be.bignumber.equal(new BN(5));
  // });
});
