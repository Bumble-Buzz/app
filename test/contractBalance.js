const { assert, expect } = require('chai');
require('chai').use(require('chai-as-promised')).should();


const NAME = 'Avaxocado';
const SYMBOL = 'ACD';
const BASE_URI = '';
let ACCOUNTS = [];
let CONTRACT;
describe("AvaxocadoNft - contract balance", () => {
  before(async () => {
    ACCOUNTS = await ethers.getSigners();
  });

  beforeEach(async () => {
    const contractFactory = await ethers.getContractFactory("AvaxocadoNft");
    CONTRACT = await contractFactory.deploy(NAME, SYMBOL, BASE_URI);
    await CONTRACT.deployed();
  });

  describe('balance after minting', async () => {
    it('one user - one mint', async () => {
      const payableAmount = ethers.utils.parseEther('0.50');
      await CONTRACT.connect(ACCOUNTS[1]).mint(ACCOUNTS[1].address, 1, { value: payableAmount });
      const balance = await CONTRACT.provider.getBalance(CONTRACT.address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('0.5');
    });

    it('one user - multiple mint', async () => {
      const payableAmount = ethers.utils.parseEther('0.50');
      await CONTRACT.connect(ACCOUNTS[1]).mint(ACCOUNTS[1].address, 1, { value: payableAmount });
      await CONTRACT.connect(ACCOUNTS[1]).mint(ACCOUNTS[1].address, 1, { value: payableAmount });
      await CONTRACT.connect(ACCOUNTS[1]).mint(ACCOUNTS[1].address, 1, { value: payableAmount });
      const balance = await CONTRACT.provider.getBalance(CONTRACT.address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('1.5');
    });

    it('multiple users - multiple mint', async () => {
      const payableAmount = ethers.utils.parseEther('0.50');
      await CONTRACT.connect(ACCOUNTS[1]).mint(ACCOUNTS[1].address, 1, { value: payableAmount });
      await CONTRACT.connect(ACCOUNTS[2]).mint(ACCOUNTS[2].address, 1, { value: payableAmount });
      await CONTRACT.connect(ACCOUNTS[1]).mint(ACCOUNTS[1].address, 1, { value: payableAmount });
      await CONTRACT.connect(ACCOUNTS[3]).mint(ACCOUNTS[3].address, 1, { value: payableAmount });
      await CONTRACT.connect(ACCOUNTS[2]).mint(ACCOUNTS[2].address, 1, { value: payableAmount });
      await CONTRACT.connect(ACCOUNTS[2]).mint(ACCOUNTS[2].address, 1, { value: payableAmount });
      const balance = await CONTRACT.provider.getBalance(CONTRACT.address);
      expect(ethers.utils.formatEther(balance)).to.be.equal('3.0');
    });
  });

  describe('balance after withdraw', async () => {
    it('one mint', async () => {
      const payableAmount = ethers.utils.parseEther('0.50');
      await CONTRACT.connect(ACCOUNTS[1]).mint(ACCOUNTS[1].address, 1, { value: payableAmount });
      const contrctBalance = Number(ethers.utils.formatEther(await CONTRACT.provider.getBalance(CONTRACT.address)));
      expect(contrctBalance).to.be.equal(0.50);

      const accountBalanceBefore = Number(ethers.utils.formatEther(await ACCOUNTS[0].provider.getBalance(ACCOUNTS[0].address)));
      await CONTRACT.connect(ACCOUNTS[0]).withdraw();
      const accountBalanceAfter = Number(ethers.utils.formatEther(await ACCOUNTS[0].provider.getBalance(ACCOUNTS[0].address)));
      expect(accountBalanceAfter-accountBalanceBefore).to.be.closeTo(contrctBalance-0.09, contrctBalance+0.01);
    });

    it('multiple mints', async () => {
      const payableAmount = ethers.utils.parseEther('0.50');
      await CONTRACT.connect(ACCOUNTS[1]).mint(ACCOUNTS[1].address, 1, { value: payableAmount });
      await CONTRACT.connect(ACCOUNTS[2]).mint(ACCOUNTS[2].address, 1, { value: payableAmount });
      await CONTRACT.connect(ACCOUNTS[3]).mint(ACCOUNTS[3].address, 1, { value: payableAmount });
      await CONTRACT.connect(ACCOUNTS[2]).mint(ACCOUNTS[2].address, 1, { value: payableAmount });
      await CONTRACT.connect(ACCOUNTS[2]).mint(ACCOUNTS[2].address, 1, { value: payableAmount });
      await CONTRACT.connect(ACCOUNTS[1]).mint(ACCOUNTS[1].address, 1, { value: payableAmount });
      await CONTRACT.connect(ACCOUNTS[4]).mint(ACCOUNTS[4].address, 1, { value: payableAmount });
      const contrctBalance = Number(ethers.utils.formatEther(await CONTRACT.provider.getBalance(CONTRACT.address)));
      expect(contrctBalance).to.be.equal(3.50);

      const accountBalanceBefore = Number(ethers.utils.formatEther(await ACCOUNTS[0].provider.getBalance(ACCOUNTS[0].address)));
      await CONTRACT.connect(ACCOUNTS[0]).withdraw();
      const accountBalanceAfter = Number(ethers.utils.formatEther(await ACCOUNTS[0].provider.getBalance(ACCOUNTS[0].address)));
      expect(accountBalanceAfter-accountBalanceBefore).to.be.closeTo(contrctBalance-0.09, contrctBalance+0.01);
    });
  });
});
