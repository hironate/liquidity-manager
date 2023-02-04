const { createAlchemyClient } = require('../utils/alchemy');
const {
  abi: uniswapV3PoolAbi,
} = require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json');
const { getPosition } = require('./get-position-details');
const { closePosition } = require('./close-position');

const swapListener = async () => {
  // Whenever swap happens we want to check our position, and check for impermanent loss.

  const positionTokenId = 1;

  const uniswapV3PoolContract = '0x1F98431c8aD98523631AE4a59f267346ea31F984';

  const filter = {
    address: '0x11b815efb8f581194ae79006d24e0d814b7697f6', // USDC Pool
    topics: [
      '0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67', // SWAP Event for USDC Pool
    ],
  };

  const alchemy = createAlchemyClient({
    network: 'ETHEREUM',
  });

  alchemy.ws.on(filter, async (log, event) => {
    const { impermanentLoss, positionLiquidity } = await getPosition(
      positionTokenId,
    );
    console.log(impermanentLoss);
    if (impermanentLoss <= -50) {
      console.log('***** Position has accured impermanent loss. *****');
      await closePosition(positionLiquidity, positionTokenId);
    }
  });
};

module.exports = {
  swapListener,
};
