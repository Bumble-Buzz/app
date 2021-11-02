const { expect } = require('chai');
require('chai').use(require('chai-as-promised')).should();
const { ethers } = require("hardhat");

const NAME = 'Avaxocado';
const SYMBOL = 'ACD';
const BASE_URI = '';
let ACCOUNTS = [];
let CONTRACT;
describe("AvaxocadoNft - state variables", () => {
  before(async () => {
    ACCOUNTS = await ethers.getSigners();
  });

  beforeEach(async () => {
    const contractFactory = await ethers.getContractFactory("AvaxocadoNft");
    CONTRACT = await contractFactory.deploy(NAME, SYMBOL, BASE_URI);
    await CONTRACT.deployed();
    await CONTRACT.setMaxMintAmount(5);
  });

  describe('base uri', async () => {
    it('check owner', async () => {
      await CONTRACT.connect(ACCOUNTS[1]).setBaseUri('some base uri')
        .should.be.rejectedWith('Ownable: caller is not the owner');
    });
  });

  describe('base extension', async () => {
    it('check owner', async () => {
      await CONTRACT.connect(ACCOUNTS[1]).setBaseExtension('some base extension')
        .should.be.rejectedWith('Ownable: caller is not the owner');
    });
  });

  describe('minting cost', async () => {
    it('get and set', async () => {
      let cost = await CONTRACT.getCost();
      let expectedCost = ethers.utils.parseEther("0.5");
      expect(cost).to.equal(expectedCost);
      await CONTRACT.setCost(ethers.utils.parseEther("0.10"));
      cost = await CONTRACT.getCost();
      expectedCost = ethers.utils.parseEther("0.10");
      expect(cost).to.equal(expectedCost);
    });

    it('check owner', async () => {
      await CONTRACT.connect(ACCOUNTS[1]).setCost(ethers.utils.parseEther("0.10"))
        .should.be.rejectedWith('Ownable: caller is not the owner');
    });
  });

  describe('max supply', async () => {
    it('get and set', async () => {
      let maxSupply = await CONTRACT.getMaxSupply();
      expect(maxSupply).to.equal(10000);
      await CONTRACT.setMaxSupply(20000);
      maxSupply = await CONTRACT.getMaxSupply();
      expect(maxSupply).to.equal(20000);
    });

    it('check owner', async () => {
      await CONTRACT.connect(ACCOUNTS[1]).setMaxSupply(20000)
          .should.be.rejectedWith('Ownable: caller is not the owner');
    });
  });

  describe('min mint amount', async () => {
    it('get and set', async () => {
      let maxMintAmount = await CONTRACT.getMinMintAmount();
      expect(maxMintAmount).to.equal(1);
      await CONTRACT.setMinMintAmount(5);
      maxMintAmount = await CONTRACT.getMinMintAmount();
      expect(maxMintAmount).to.equal(5);
    });

    it('check owner', async () => {
      await CONTRACT.connect(ACCOUNTS[1]).setMinMintAmount(5)
          .should.be.rejectedWith('Ownable: caller is not the owner');
    });
  });

  describe('max mint amount', async () => {
    it('get and set', async () => {
      let minMintAmount = await CONTRACT.getMaxMintAmount();
      expect(minMintAmount).to.equal(5);
      await CONTRACT.setMaxMintAmount(10);
      minMintAmount = await CONTRACT.getMaxMintAmount();
      expect(minMintAmount).to.equal(10);
    });

    it('check owner', async () => {
      await CONTRACT.connect(ACCOUNTS[1]).setMaxMintAmount(10)
          .should.be.rejectedWith('Ownable: caller is not the owner');
    });
  });
  
  describe('pause contract', async () => {
    it('get and set', async () => {
      let paused = await CONTRACT.isContractPaused();
      expect(paused).to.be.equal(false);
      await CONTRACT.setContractPauseState(true);
      paused = await CONTRACT.isContractPaused();
      expect(paused).to.be.equal(true);
    });

    it('check owner', async () => {
      await CONTRACT.connect(ACCOUNTS[1]).setContractPauseState(true)
          .should.be.rejectedWith('Ownable: caller is not the owner');
    });
  });
  
  describe('reveal contract', async () => {
    it('get and set', async () => {
      let revealed = await CONTRACT.isContractRevealed();
      expect(revealed).to.be.equal(false);
      await CONTRACT.setContractRevealState(true);
      revealed = await CONTRACT.isContractRevealed();
      expect(revealed).to.be.equal(true);
    });

    it('check owner', async () => {
      await CONTRACT.connect(ACCOUNTS[1]).setContractPauseState(true)
          .should.be.rejectedWith('Ownable: caller is not the owner');
    });
  });
});
