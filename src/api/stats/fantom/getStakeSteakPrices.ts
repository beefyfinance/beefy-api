import pools from '../../../data/fantom/stakesteakLpPools.json';
import { fantomWeb3 as web3 } from '../../../utils/web3';
import { getContractWithProvider } from '../../../utils/contractHelper';
import ERC20 from '../../../abis/ERC20.json';
import BigNumber from 'bignumber.js';
import Web3 from 'web3';

type PoolType = typeof pools[number];

type LpBreakdown = {
  price: number;
  tokens: string[];
  balances: string[];
  totalSupply: string;
};

export async function getStakeSteakPrices(
  tokenPrices: Record<string, number>
): Promise<Record<string, LpBreakdown>> {
  const prices = await Promise.all(pools.map(pool => getPoolPrice(web3, pool, tokenPrices)));

  return prices.reduce((acc, price) => {
    return {
      ...acc,
      ...price,
    };
  }, {});
}

async function getPoolPrice(
  web3: Web3,
  pool: PoolType,
  tokenPrices: Record<string, number>
): Promise<Record<string, LpBreakdown>> {
  try {
    return await getPoolData(web3, pool, tokenPrices);
  } catch (err) {
    console.log('error on pool ' + pool.name);
    throw err;
  }
}

async function getPoolData(
  web3: Web3,
  pool: PoolType,
  tokenPrices: Record<string, number>
): Promise<Record<string, LpBreakdown>> {
  const tokenPairContract = getContractWithProvider(ERC20, pool.address, web3);
  const token0Contract = getContractWithProvider(ERC20, pool.lp0.address, web3);
  const token1Contract = getContractWithProvider(ERC20, pool.lp1.address, web3);
  const lp0Price = getTokenPrice(tokenPrices, pool.lp0.oracleId);
  const lp1Price = getTokenPrice(tokenPrices, pool.lp1.oracleId);

  const token0Bal =
    pool.lp0.address === '0x0000000000000000000000000000000000000000'
      ? web3.eth.getBalance(pool.address)
      : token0Contract.methods.balanceOf(pool.address).call();

  const token1Bal =
    pool.lp1.address === '0x0000000000000000000000000000000000000000'
      ? web3.eth.getBalance(pool.address)
      : token1Contract.methods.balanceOf(pool.address).call();

  const [totalSupplyWei, reserve0, reserve1] = await Promise.all([
    tokenPairContract.methods.totalSupply().call(),
    token0Bal,
    token1Bal,
  ]);

  const lp0Bal = new BigNumber(reserve0).dividedBy(pool.lp0.decimals);
  const lp1Bal = new BigNumber(reserve1).dividedBy(pool.lp1.decimals);
  const lp0BalInUsd = lp0Bal.times(lp0Price);
  const lp1BalInUsd = lp1Bal.times(lp1Price);
  const totalBalInUsd = lp0BalInUsd.plus(lp1BalInUsd);
  const totalSupply = new BigNumber(totalSupplyWei).dividedBy(pool.decimals);
  const poolPrice = totalBalInUsd.dividedBy(totalSupply);

  return {
    [pool.name]: {
      price: poolPrice.toNumber(),
      tokens: [pool.lp0.address, pool.lp1.address],
      balances: [lp0Bal.toString(10), lp1Bal.toString(10)],
      totalSupply: totalSupply.toString(10),
    },
  };
}

function getTokenPrice(tokenPrices: Record<string, number>, oracleId: string): number {
  if (!oracleId) {
    throw new Error('Oracle ID is not defined');
  }

  if (!(oracleId in tokenPrices)) {
    throw new Error(`Oracle ID '${oracleId}' is not defined in tokenPrices`);
  }

  return tokenPrices[oracleId];
}
