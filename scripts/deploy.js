const hre = require("hardhat");

async function main() {
  const Avaxtrade = await hre.ethers.getContractFactory("AvaxTrade");
  const avaxtrade = await Avaxtrade.deploy();

  await avaxtrade.deployed();

  console.log("Greeter deployed to:", avaxtrade.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
