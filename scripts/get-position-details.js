const axios = require('axios');

// Constants ---------------------------------------------------------------
const x96 = Math.pow(2, 96);
const x128 = Math.pow(2, 128);
// Constants End -----------------------------------------------------------

// Main function -----------------------------------------------------------
async function getPosition(positionTokenId) {
  const graphqlEndpoint =
    'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3';

  console.time('Uniswap Position Query');

  // The call to the subgraph
  let positionRes = await axios.post(graphqlEndpoint, {
    query: positionQuery.replace('%1', positionTokenId),
  });

  // Setting up some variables to keep things shorter & clearer
  let position = positionRes.data.data.position;
  let positionLiquidity = position.liquidity;

  deposited0 = position.depositedToken0;
  deposited1 = position.depositedToken1;
  withdrawnToken0 = position.withdrawnToken0;
  withdrawnToken1 = position.withdrawnToken1;

  let pool = position.pool;
  let decimalDifference =
    parseInt(position.token1.decimals, 10) -
    parseInt(position.token0.decimals, 10);
  let [symbol_0, symbol_1] = [position.token0.symbol, position.token1.symbol];

  // Prices (not decimal adjusted)
  let priceCurrent = sqrtPriceToPrice(pool.sqrtPrice);
  let priceUpper = parseFloat(position.tickUpper.price0);
  let priceLower = parseFloat(position.tickLower.price0);

  // Square roots of the prices (not decimal adjusted)
  let priceCurrentSqrt = parseFloat(pool.sqrtPrice) / Math.pow(2, 96);
  let priceUpperSqrt = Math.sqrt(parseFloat(position.tickUpper.price0));
  let priceLowerSqrt = Math.sqrt(parseFloat(position.tickLower.price0));

  // Prices (decimal adjusted)
  let priceCurrentAdjusted = sqrtPriceToPriceAdjusted(
    pool.sqrtPrice,
    decimalDifference,
  );
  let priceUpperAdjusted =
    parseFloat(position.tickUpper.price0) / Math.pow(10, decimalDifference);
  let priceLowerAdjusted =
    parseFloat(position.tickLower.price0) / Math.pow(10, decimalDifference);

  // Prices (decimal adjusted and reversed)
  let priceCurrentAdjustedReversed = 1 / priceCurrentAdjusted;
  let priceLowerAdjustedReversed = 1 / priceUpperAdjusted;
  let priceUpperAdjustedReversed = 1 / priceLowerAdjusted;

  // The amount calculations using positionLiquidity & current, upper and lower priceSqrt
  let amount_0, amount_1;
  if (priceCurrent <= priceLower) {
    amount_0 = positionLiquidity * (1 / priceLowerSqrt - 1 / priceUpperSqrt);
    amount_1 = 0;
  } else if (priceCurrent < priceUpper) {
    amount_0 = positionLiquidity * (1 / priceCurrentSqrt - 1 / priceUpperSqrt);
    amount_1 = positionLiquidity * (priceCurrentSqrt - priceLowerSqrt);
  } else {
    amount_1 = positionLiquidity * (priceUpperSqrt - priceLowerSqrt);
    amount_0 = 0;
  }

  // Decimal adjustment for the amounts
  let current_amount_0_Adjusted =
    amount_0 / Math.pow(10, position.token0.decimals);
  let current_amount_1_Adjusted =
    amount_1 / Math.pow(10, position.token1.decimals);

  // Tokens if we have hodl
  const hodlStratagy =
    parseFloat(deposited1) * parseFloat(priceCurrentAdjustedReversed) +
    parseFloat(deposited0); // In terms of token1

  // Tokens if We have invested in LP
  const lpStratagy =
    parseFloat(current_amount_0_Adjusted) +
    parseFloat(withdrawnToken0) +
    (parseFloat(current_amount_1_Adjusted) + parseFloat(withdrawnToken1)) *
      priceCurrentAdjustedReversed;

  let impermanentLoss;
  if (hodlStratagy > lpStratagy) {
    impermanentLoss = `${-relDiff(hodlStratagy, lpStratagy)}`;
  } else {
    impermanentLoss = `${relDiff(hodlStratagy, lpStratagy)}`;
  }

  // Logs of the the results
  console.table([
    ['Pair', `${symbol_0}/${symbol_1}`],
    ['Upper Price', priceUpperAdjusted.toPrecision(5)],
    ['Current Price', priceCurrentAdjusted.toPrecision(5)],
    ['Lower Price', priceLowerAdjusted.toPrecision(5)],
    [`Deposited Amount ${symbol_0}`, deposited0],
    [`Withdraw Amount ${symbol_0}`, withdrawnToken0],
    [`Current Amount ${symbol_0}`, current_amount_0_Adjusted.toPrecision(5)],
    [`Deposited Amount ${symbol_1}`, deposited1],
    [`Withdraw Amount ${symbol_1}`, withdrawnToken1],
    [`Current Amount ${symbol_1}`, current_amount_1_Adjusted.toPrecision(5)],

    [`Decimals ${symbol_0}`, position.token0.decimals],
    [`Decimals ${symbol_1}`, position.token1.decimals],
    ['------------------', '------------------'],
    ['Upper Price Reversed', priceUpperAdjustedReversed.toPrecision(5)],
    ['Current Price Reversed', priceCurrentAdjustedReversed.toPrecision(5)],
    ['Lower Price Reversed', priceLowerAdjustedReversed.toPrecision(5)],

    ['------------------', '------------------'],
    ['Hodl Stratagy', hodlStratagy],
    ['LP Stratagy', lpStratagy],
    ['Impermanent Loss', impermanentLoss],
  ]);
  console.timeEnd('Uniswap Position Query');

  return { impermanentLoss, positionLiquidity };
}
// Main Function End --------------------------------------------------------

// Helper Functions ---------------------------------------------------------

function relDiff(a, b) {
  return a < b ? '-' + ((b - a) * 100) / a : ((a - b) * 100) / b;
}

function sqrtPriceToPriceAdjusted(sqrtPriceX96Prop, decimalDifference) {
  let sqrtPrice = parseFloat(sqrtPriceX96Prop) / x96;
  let divideBy = Math.pow(10, decimalDifference);
  let price = Math.pow(sqrtPrice, 2) / divideBy;

  return price;
}

function sqrtPriceToPrice(sqrtPriceX96Prop) {
  let sqrtPrice = parseFloat(sqrtPriceX96Prop) / x96;
  let price = Math.pow(sqrtPrice, 2);
  return price;
}
// Helper Functions End ----------------------------------------------------

// Subgraph query for the position
const positionQuery = `
    query tokenPosition {
        position(id: "%1"){
            id
            token0{
                symbol
                derivedETH
                id
                decimals
            }
            token1{
                symbol
                derivedETH
                id
                decimals
            }
            pool{
                id
                liquidity
                sqrtPrice
            }
            liquidity
            depositedToken0
            depositedToken1
            tickLower {
                price0
                price1
            }
            tickUpper {
                price0
                price1
            }
            withdrawnToken0
            withdrawnToken1
            transaction{
                timestamp
                blockNumber
            }
        }
    }
`;

module.exports = {
  getPosition,
};
