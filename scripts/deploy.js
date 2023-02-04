const { ethers, upgrades } = require('hardhat');

async function deployContract(contractName, args, isProxy = false) {
  let contract;
  let contractFactory;

  contractFactory = await ethers.getContractFactory(contractName);
  if (isProxy) {
    contract = await upgrades.deployProxy(contractFactory, args, {
      initializer: 'initialize',
    });
  } else {
    contract = await contractFactory.deploy(args);
    await contract.deployed();
  }
  return contract;
}

module.exports = {
  deployContract,
};
