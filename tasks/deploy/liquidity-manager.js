const { task } = require('hardhat/config');
const { CONTRACT_NAMES } = require('../../utils/constants');
const { writeContract, readContract, writeABI } = require('../../utils/io');

task(
  'deploy:liquidity-manager',
  'Deploy Liquidity Manager',
  async (_, { ethers }) => {
    const accounts = await ethers.getSigners();
    const signer = accounts[0];

    const productContractAddress = '0x8211310A6d22b2098193A68A006FA6b0784df9E3';

    const liquidityManagerFactory = await ethers.getContractFactory(
      CONTRACT_NAMES.LiquidityManager,
    );

    const liquidityManager = await liquidityManagerFactory.deploy();

    await liquidityManager.deployed();

    writeContract(
      CONTRACT_NAMES.LiquidityManager,
      liquidityManager.address,
      signer.address,
    );
  },
);

task(
  'verify:liquidity-manager',
  'Verifying Liquidity Manager contract',
  async (_, { run }) => {
    console.log('Verifying Liquidity Manager contract...');
    const liquidityManager = readContract(CONTRACT_NAMES.LiquidityManager);
    try {
      await run('verify:verify', {
        address: liquidityManager.address,
        constructorArguments: [],
      });
    } catch (error) {
      console.error(error);
    }

    console.log('Verifying Liquidity Manager contract completed.');
  },
);

task(
  'abi:liquidity-manager',
  'Exporting Liquidity Manager contract ABI',
  () => {
    writeABI(
      'LiquidityManager.sol/LiquidityManager.json',
      CONTRACT_NAMES.LiquidityManager,
    );
  },
);
