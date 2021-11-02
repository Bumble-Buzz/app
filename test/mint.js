const { assert, expect } = require('chai');
require('chai').use(require('chai-as-promised')).should();



const NAME = 'Avaxocado';
const SYMBOL = 'ACD';
const BASE_URI = '';
let ACCOUNTS = [];
let CONTRACT;
let PAYABLE_AMOUNT;
describe("AvaxocadoNft - mint", () => {
  before(async () => {
    PAYABLE_AMOUNT = ethers.utils.parseEther('0.50');
    ACCOUNTS = await ethers.getSigners();
  });

  beforeEach(async () => {
    const contractFactory = await ethers.getContractFactory("AvaxocadoNft");
    CONTRACT = await contractFactory.deploy(NAME, SYMBOL, BASE_URI);
    await CONTRACT.deployed();
    await CONTRACT.setCost(PAYABLE_AMOUNT);
  });

  describe('unsuccessful mint', async () => {
    it('mint while contract paused', async () => {
      await CONTRACT.setContractPauseState(true);
      await CONTRACT.connect(ACCOUNTS[1]).mint(ACCOUNTS[1].address, 0).should.be.rejectedWith('The contract is paused, can not mint');
    });
  
    it('mint amount too low', async () => {
      await CONTRACT.connect(ACCOUNTS[1]).mint(ACCOUNTS[1].address, 0).should.be.rejectedWith('Mint amount must be greater');
    });
  
    it('mint amount too big', async () => {
      await CONTRACT.connect(ACCOUNTS[1]).mint(ACCOUNTS[1].address, 6).should.be.rejectedWith('Mint amount too big');
    });
  
    it('reached max mint amount', async () => {
      await CONTRACT.setMaxSupply(2); // set max supply to 2
      await CONTRACT.connect(ACCOUNTS[1]).mint(ACCOUNTS[1].address, 1, { value: PAYABLE_AMOUNT }); // mint first
      await CONTRACT.connect(ACCOUNTS[2]).mint(ACCOUNTS[2].address, 1, { value: PAYABLE_AMOUNT }); // mint second
      await CONTRACT.connect(ACCOUNTS[3]).mint(ACCOUNTS[3].address, 1, { value: PAYABLE_AMOUNT })
        .should.be.rejectedWith('Already reached max mint amount');
    });
  
    it('no funds', async () => {
      const payableAmount = ethers.utils.parseEther('0.09');
      await CONTRACT.connect(ACCOUNTS[1]).mint(ACCOUNTS[1].address, 1, { value: payableAmount })
        .should.be.rejectedWith('Not enough funds to mint');
    });
  
    it('not enough funds - 1 mint', async () => {
      const payableAmount = ethers.utils.parseEther('0.49');
      await CONTRACT.connect(ACCOUNTS[1]).mint(ACCOUNTS[1].address, 1, { value: payableAmount })
        .should.be.rejectedWith('Not enough funds to mint');
    });
  
    it('not enough funds - 2 mint', async () => {
      const payableAmount = ethers.utils.parseEther('0.50');
      await CONTRACT.connect(ACCOUNTS[1]).mint(ACCOUNTS[1].address, 2, { value: payableAmount })
        .should.be.rejectedWith('Not enough funds to mint');
    });
  });

  describe('successful mint', async () => {
    it('one mint', async () => {
      let supply = await CONTRACT.totalSupply();
      expect(supply).to.equal(0);
      let balance = await CONTRACT.balanceOf(ACCOUNTS[1].address);
      expect(balance).to.equal(0);
      let contractBalance = await CONTRACT.provider.getBalance(CONTRACT.address);
      expect(balance).to.equal(0);

      await CONTRACT.connect(ACCOUNTS[1]).mint(ACCOUNTS[1].address, 1, { value: PAYABLE_AMOUNT });
      supply = await CONTRACT.totalSupply();
      expect(supply).to.equal(1);
      balance = await CONTRACT.balanceOf(ACCOUNTS[1].address);
      expect(balance).to.equal(1);
      contractBalance = await CONTRACT.provider.getBalance(CONTRACT.address);
      expect(ethers.utils.formatEther(contractBalance)).to.be.equal('0.5');
    });

    it('two mints', async () => {
      let supply = await CONTRACT.totalSupply();
      expect(supply).to.equal(0);
      let balance = await CONTRACT.balanceOf(ACCOUNTS[1].address);
      expect(balance).to.equal(0);
      let contractBalance = await CONTRACT.provider.getBalance(CONTRACT.address);
      expect(balance).to.equal(0);

      const payableAmount = ethers.utils.parseEther('1.0');
      await CONTRACT.connect(ACCOUNTS[1]).mint(ACCOUNTS[1].address, 2, { value: payableAmount });
      supply = await CONTRACT.totalSupply();
      expect(supply).to.equal(2);
      balance = await CONTRACT.balanceOf(ACCOUNTS[1].address);
      expect(balance).to.equal(2);
      contractBalance = await CONTRACT.provider.getBalance(CONTRACT.address);
      expect(ethers.utils.formatEther(contractBalance)).to.be.equal('1.0');
    });

    it('five mints', async () => {
      let supply = await CONTRACT.totalSupply();
      expect(supply).to.equal(0);
      let balance = await CONTRACT.balanceOf(ACCOUNTS[1].address);
      expect(balance).to.equal(0);
      let contractBalance = await CONTRACT.provider.getBalance(CONTRACT.address);
      expect(balance).to.equal(0);

      const payableAmount = ethers.utils.parseEther('2.5');
      await CONTRACT.connect(ACCOUNTS[1]).mint(ACCOUNTS[1].address, 5, { value: payableAmount });
      supply = await CONTRACT.totalSupply();
      expect(supply).to.equal(5);
      balance = await CONTRACT.balanceOf(ACCOUNTS[1].address);
      expect(balance).to.equal(5);
      contractBalance = await CONTRACT.provider.getBalance(CONTRACT.address);
      expect(ethers.utils.formatEther(contractBalance)).to.be.equal('2.5');
    });

    it('one user - multiple mint', async () => {
      await CONTRACT.connect(ACCOUNTS[1]).mint(ACCOUNTS[1].address, 1, { value: PAYABLE_AMOUNT });
      await CONTRACT.connect(ACCOUNTS[1]).mint(ACCOUNTS[1].address, 1, { value: PAYABLE_AMOUNT });
      await CONTRACT.connect(ACCOUNTS[1]).mint(ACCOUNTS[1].address, 1, { value: PAYABLE_AMOUNT });

      const supply = await CONTRACT.totalSupply();
      expect(supply).to.equal(3);
      let balance = await CONTRACT.balanceOf(ACCOUNTS[1].address);
      expect(balance).to.equal(3);
    });

    it('multiple users - multiple mint', async () => {
      await CONTRACT.connect(ACCOUNTS[1]).mint(ACCOUNTS[1].address, 1, { value: PAYABLE_AMOUNT });
      await CONTRACT.connect(ACCOUNTS[2]).mint(ACCOUNTS[2].address, 1, { value: PAYABLE_AMOUNT });
      await CONTRACT.connect(ACCOUNTS[3]).mint(ACCOUNTS[3].address, 1, { value: PAYABLE_AMOUNT });
      const supply = await CONTRACT.totalSupply();
      expect(supply).to.equal(3);
    });

    it('one mint - owner no cost', async () => {
      let supply = await CONTRACT.totalSupply();
      expect(supply).to.equal(0);
      let balance = await CONTRACT.balanceOf(ACCOUNTS[1].address);
      expect(balance).to.equal(0);
      let contractBalance = await CONTRACT.provider.getBalance(CONTRACT.address);
      expect(balance).to.equal(0);

      await CONTRACT.connect(ACCOUNTS[0]).mint(ACCOUNTS[0].address, 1, { value: PAYABLE_AMOUNT });

      supply = await CONTRACT.totalSupply();
      expect(supply).to.equal(1);
      balance = await CONTRACT.balanceOf(ACCOUNTS[0].address);
      expect(balance).to.equal(1);
      contractBalance = await CONTRACT.provider.getBalance(CONTRACT.address);
      expect(ethers.utils.formatEther(contractBalance)).to.be.equal('0.5');
    });

    it('five mints - owner no cost', async () => {
      let supply = await CONTRACT.totalSupply();
      expect(supply).to.equal(0);
      let balance = await CONTRACT.balanceOf(ACCOUNTS[1].address);
      expect(balance).to.equal(0);
      let contractBalance = await CONTRACT.provider.getBalance(CONTRACT.address);
      expect(balance).to.equal(0);

      await CONTRACT.connect(ACCOUNTS[0]).mint(ACCOUNTS[0].address, 5, { value: PAYABLE_AMOUNT });

      supply = await CONTRACT.totalSupply();
      expect(supply).to.equal(5);
      balance = await CONTRACT.balanceOf(ACCOUNTS[0].address);
      expect(balance).to.equal(5);
      contractBalance = await CONTRACT.provider.getBalance(CONTRACT.address);
      expect(ethers.utils.formatEther(contractBalance)).to.be.equal('0.5');
    });
  });
});
