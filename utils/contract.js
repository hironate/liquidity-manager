const { ethers } = require('hardhat');
const { readContract, readABI } = require('./io');

const getContract = async (contractName) => {
  const contractInfo = readContract(contractName);
  const abi = readABI(contractName);

  return await ethers.getContractAt(abi, contractInfo.address);
};

module.exports = {
  getContract,
};
