require('@nomicfoundation/hardhat-toolbox');
require('@openzeppelin/hardhat-upgrades');
require('dotenv').config();

require('./tasks/deploy/liquidity-manager');

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) {
  console.error('Please add PRIVATE_KEY to .env');
  process.exit(1);
}

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
if (!ETHERSCAN_API_KEY) {
  console.error('Please add ETHERSCAN_API_KEY to .env');
  process.exit(1);
}

const DEPLOY_NETWORK = process.env.DEPLOY_NETWORK;
if (!DEPLOY_NETWORK) {
  console.error('Please add DEPLOY_NETWORK to .env');
  process.exit(1);
}

const SUPPORTED_NETWORKS = [
  'hardhat',
  'mumbai-local',
  'mumbai-qa',
  'mumbai-staging',
  'mainnet',
];
if (!SUPPORTED_NETWORKS.includes(DEPLOY_NETWORK)) {
  console.error('Unsupported network', SUPPORTED_NETWORKS);
  process.exit(1);
}

module.exports = {
  defaultNetwork: 'hardhat',
  solidity: {
    compilers: [
      {
        version: '0.7.6',
        settings: {
          evmVersion: 'istanbul',
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {
      forking: {
        url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.MAINNET_ALCHEMY_API}`,
      },
    },
    polygonMumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: [`${PRIVATE_KEY}`],
      chainId: 80001,
      gas: 'auto',
      blockGasLimit: 100000000429720,
    },
    polygon: {
      url: `https://polygon-mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: [`${PRIVATE_KEY}`],
      chainId: 137,
      gas: 'auto',
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
