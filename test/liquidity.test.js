const { expect } = require('chai');
const { ethers } = require('hardhat');

const DAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const DAI_WHALE = '0x7c8ca1a587b2c4c40fc650db8196ee66dc9c46f4';
const USDC_WHALE = '0x1b7baa734c00298b9429b518d621753bb0f6eff2';

describe('LiquidityManager', () => {
  let liquidityManager;
  let accounts;
  let dai;
  let usdc;

  before(async () => {
    accounts = await ethers.getSigners(1);

    const LiquidityManager = await ethers.getContractFactory(
      'LiquidityManager',
    );
    liquidityManager = await LiquidityManager.deploy();
    await liquidityManager.deployed();

    dai = await ethers.getContractAt('IERC20', DAI);
    usdc = await ethers.getContractAt('IERC20', USDC);

    // Unlock DAI and USDC whales
    await network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [DAI_WHALE],
    });
    await network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [USDC_WHALE],
    });

    const daiWhale = await ethers.getSigner(DAI_WHALE);
    const usdcWhale = await ethers.getSigner(USDC_WHALE);

    // Send DAI and USDC to accounts[0]
    const daiAmount = 1000n * 10n ** 18n;
    const usdcAmount = 1000n * 10n ** 6n;

    expect(await dai.balanceOf(daiWhale.address)).to.gte(daiAmount);
    expect(await usdc.balanceOf(usdcWhale.address)).to.gte(usdcAmount);

    await dai.connect(daiWhale).transfer(accounts[0].address, daiAmount);
    await usdc.connect(usdcWhale).transfer(accounts[0].address, usdcAmount);
  });

  it('mintNewPosition', async () => {
    const daiAmount = 100n * 10n ** 18n;
    const usdcAmount = 100n * 10n ** 6n;

    await dai
      .connect(accounts[0])
      .transfer(liquidityManager.address, daiAmount);
    await usdc
      .connect(accounts[0])
      .transfer(liquidityManager.address, usdcAmount);

    await liquidityManager.mintNewPosition();

    console.log(
      'DAI balance after add liquidity',
      await dai.balanceOf(accounts[0].address),
    );
    console.log(
      'USDC balance after add liquidity',
      await usdc.balanceOf(accounts[0].address),
    );
  });

  it.skip('increaseLiquidityCurrentRange', async () => {
    const daiAmount = 20n * 10n ** 18n;
    const usdcAmount = 20n * 10n ** 6n;

    await dai.connect(accounts[0]).approve(liquidityManager.address, daiAmount);
    await usdc
      .connect(accounts[0])
      .approve(liquidityManager.address, usdcAmount);

    await liquidityManager.increaseLiquidityCurrentRange(daiAmount, usdcAmount);
  });

  it('decreaseLiquidity', async () => {
    const tokenId = await liquidityManager.tokenId();
    const liquidity = await liquidityManager.getLiquidity(tokenId);

    await liquidityManager.decreaseLiquidity(liquidity, tokenId);

    console.log('--- decrease liquidity ---');
    console.log(`liquidity ${liquidity}`);
    console.log(`dai ${await dai.balanceOf(liquidityManager.address)}`);
    console.log(`usdc ${await usdc.balanceOf(liquidityManager.address)}`);
  });

  it('collectAllFees', async () => {
    const tokenId = await liquidityManager.tokenId();
    await liquidityManager.collectAllFees(tokenId);

    console.log('--- collect fees ---');
    console.log(`dai ${await dai.balanceOf(liquidityManager.address)}`);
    console.log(`usdc ${await usdc.balanceOf(liquidityManager.address)}`);
  });
});
