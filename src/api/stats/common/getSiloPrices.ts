import BigNumber from 'bignumber.js';
import { fetchContract } from '../../rpc/client';
import SiloTokenAbi from '../../../abis/arbitrum/SiloToken';
import SiloAbi from '../../../abis/arbitrum/Silo';
import SiloV2Abi from '../../../abis/SiloV2';

export const getSiloPrices = async (chainId, pools, tokenPrices) => {
  const [amountCalls, totalSupplyCalls] = pools.reduce(
    (acc, pool) => {
      const siloTokenContract = fetchContract(pool.address, SiloTokenAbi, chainId);
      if (pool.v2) {
        const siloContract = fetchContract(pool.silo, SiloV2Abi, chainId);
        acc[0].push(siloContract.read.totalAssets());
      } else {
        const siloContract = fetchContract(pool.silo, SiloAbi, chainId);
        acc[0].push(siloContract.read.assetStorage([pool.underlying]));
      }
      acc[1].push(siloTokenContract.read.totalSupply());
      return acc;
    },
    [[], []]
  );

  const [amountResults, totalSupplyResults] = await Promise.all([
    Promise.all(amountCalls),
    Promise.all(totalSupplyCalls),
  ]);

  let prices = {};
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const token = pool.underlying;
    const collateralDecimals = new BigNumber(pool.decimals);
    const totalSupplyDecimals = pool.v2 ? collateralDecimals.shiftedBy(3) : pool.decimals; // + SiloMathLib._DECIMALS_OFFSET on v2
    const balance = pool.v2
      ? new BigNumber(amountResults[i]).div(collateralDecimals)
      : pool.collateral
      ? new BigNumber(amountResults[i]['collateralOnlyDeposits']).div(collateralDecimals)
      : new BigNumber(amountResults[i]['totalDeposits']).div(collateralDecimals);
    const totalSupply = new BigNumber(totalSupplyResults[i]).div(totalSupplyDecimals);

    const priceUnderlying = getTokenPrice(tokenPrices, pool.oracleId);
    const price = balance.times(priceUnderlying).div(totalSupply).toNumber();

    prices[pool.name] = {
      price,
      tokens: [token],
      balances: [balance.toString(10)],
      totalSupply: totalSupply.toString(10),
    };
  }
  return prices;
};

const getTokenPrice = (tokenPrices, oracleId) => {
  if (!oracleId) return 1;
  let tokenPrice = 1;
  const tokenSymbol = oracleId;
  if (tokenPrices.hasOwnProperty(tokenSymbol)) {
    tokenPrice = tokenPrices[tokenSymbol];
  } else {
    console.error(`Silo Unknown token '${tokenSymbol}'. Consider adding it to .json file`);
  }
  return tokenPrice;
};

module.exports = getSiloPrices;
