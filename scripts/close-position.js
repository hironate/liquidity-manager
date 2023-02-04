require('dotenv').config();
const { getWalletSigner, getContract } = require('../utils/alchemy');
const liquidityManagerAbis = require('../publish/abis/LiquidityManager.json');

const closePosition = async (liquidity, positionId) => {
  try {
    console.log('***** ----- Closing Position ----- *****');

    const contractAddress = '0x3f4Db94d6236C3e9C92caAe850413b01C684aC91'; // Mumbai Testnet Address

    const signer = await getWalletSigner({
      network: 'ETHEREUM',
      privateKey: process.env.PRIVATE_KEY,
    });

    const liquidityManager = getContract({
      contractAddress,
      abis: liquidityManagerAbis,
      provider: signer,
    });

    await liquidityManager.decreaseLiquidity(liquidity, positionId);
    await liquidityManager.collectAllFees(positionId);

    console.log('***** ----- Position closed ----- *****');
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  closePosition,
};
