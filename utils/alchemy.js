const { Network, Alchemy, NftExcludeFilters } = require('alchemy-sdk');
const { ethers } = require('ethers');

const API_KEYS = {
  ETHEREUM: process.env.MAINNET_ALCHEMY_API,
  GOERLI: process.env.GOERLI_ALCHEMY_API,
};

const ALCHEMY_NETWORKS = {
  ETHEREUM: Network.ETH_MAINNET,
  GOERLI: Network.ETH_GOERLI,
};

const createAlchemyClient = ({ network }) => {
  try {
    const settings = {
      apiKey: API_KEYS[network],
      network: ALCHEMY_NETWORKS[network],
    };
    return new Alchemy(settings);
  } catch (error) {
    throw new Error(error);
  }
};

const getProvider = async ({ network }) => {
  const alchemy = createAlchemyClient({
    network,
  });

  return alchemy.config.getProvider();
};

const getContract = ({ contractAddress, abis, provider }) => {
  return new ethers.Contract(contractAddress, abis, provider);
};

const getWalletSigner = async ({ network, privateKey }) => {
  const alchemy = createAlchemyClient({
    network,
  });

  const ethersProvider = await alchemy.config.getProvider();

  return new ethers.Wallet(privateKey, ethersProvider);
};

module.exports = {
  createAlchemyClient,
  getContract,
  getWalletSigner,
  getProvider,
};
