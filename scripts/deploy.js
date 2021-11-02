const hre = require("hardhat");

async function main() {
  const Avaxocado = await hre.ethers.getContractFactory("AvaxocadoNft");
  const avaxocado = await Avaxocado.deploy('Avaxocado', 'ACD', 'ipfs://QmdE9dLUPWnV1oRsbPZms7ztETQeqdjaUaHXinfbwm52dH/');

  await avaxocado.deployed();

  console.log("Greeter deployed to:", avaxocado.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
