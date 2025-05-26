import BigNumber from 'bignumber.js';
import { fetchContract } from '../../rpc/client';
import SiloTokenAbi from '../../../abis/arbitrum/SiloToken';
import SiloAbi from '../../../abis/arbitrum/Silo';
import SiloV2Abi from '../../../abis/SiloV2';

export const getSiloPrices = async (chainId, pools, tokenPrices) => {
  const [amountCalls, totalSupplyCalls, decimalsCalls] = pools.reduce(
    (acc, pool) => {
      const siloTokenContract = fetchContract(pool.address, SiloTokenAbi, chainId);
      if (pool.v2 || pool.vault) {
        const siloContract = fetchContract(pool.silo, SiloV2Abi, chainId);
        acc[0].push(siloContract.read.totalAssets());
      } else {
        const siloContract = fetchContract(pool.silo, SiloAbi, chainId);
        acc[0].push(siloContract.read.assetStorage([pool.underlying]));
      }
      acc[1].push(siloTokenContract.read.totalSupply());
      acc[2].push(siloTokenContract.read.decimals());
      return acc;
    },
    [[], [], []]
  );

  const [amountResults, totalSupplyResults, decimalsResults] = await Promise.all([
    Promise.all(amountCalls),
    Promise.all(totalSupplyCalls),
    Promise.all(decimalsCalls),
  ]);

  let prices = {};
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const token = pool.underlying;
    const totalSupplyDecimals = new BigNumber(decimalsResults[i]).toNumber(); // [as X, not Xe18] Needed as V2 uses SiloMathLib._DECIMALS_OFFSET extra decimals for LP tokens
    const balance =
      pool.v2 || pool.vault
        ? new BigNumber(amountResults[i]).div(pool.decimals)
        : pool.collateral
        ? new BigNumber(amountResults[i]['collateralOnlyDeposits']).div(pool.decimals)
        : new BigNumber(amountResults[i]['totalDeposits']).div(pool.decimals);
    const totalSupply = new BigNumber(totalSupplyResults[i]).shiftedBy(-totalSupplyDecimals);

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
