# Liquidity Manager

## Run Tests

```shell
npx hardhat test
```

## Contract

- Location - `/contracts/LiquidityManager.sol`
- `LiquidityManager` contract is responsible to decrease position (close) and collect fees/tokens
- Position owner must need to provide approval or set `LiquidityManager` as operator, so `LiquidityManager` can manage users position on behalf of user automaticaly.
- `decreaseLiquidity` and `collectAllFees` are two function responsible for closing position. Other functionality in this contract is out of scope for this POC and for testing purpose. This function can only be called by contract owner.

## Worker

- Location - `scripts/worker.js`
- There are multiple ways we want to track position in realtime.
- Hitting graph endpoints at certain intervals or Listening to various smart contract event's where position might get updated.
- I am taking second approach, listening to USDC Pool's Swap Event. (Just for demo purpose)
- This script is just for POC, In real life, Pool Address and position can be fetched from database, which we want to track.
- Script checks position details on receipt of `Swap Event` and checks given position.
- If position has `Impermanent` then we call our `LiquidityManager` contract's function to close user's position.

## Scripts

- `close-position.js` : responsible for closing position
- `get-position-details.js` : responsible for getting position details of given position tokenId
- `swap-listener.js`: responsible for listening to Swap event of given smart contract

## Deploying Contract

```shell
npx hardhat deploy:liquidity-manager --network polygonMumbai|polygon
```

### Verifying Contract

```shell
npx hardhat verify:liquidity-manager --network polygonMumbai|polygon
```

### Exporting Contract ABIs

```shell
npx hardhat abi:liquidity-manager --network polygonMumbai|polygon
```

### Running Work

```shell
node scripts/worker
```
