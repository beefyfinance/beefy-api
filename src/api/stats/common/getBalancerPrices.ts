import BigNumber from 'bignumber.js';
import { MultiCall, ShapeWithLabel } from 'eth-multicall';
import { multicallAddress } from '../../../utils/web3';
import { MultiAssetPool } from '../../../types/LpPool';
import IBalancerVault from '../../../abis/IBalancerVault.json';
import ERC20 from '../../../abis/ERC20.json';
import { getContract } from '../../../utils/contractHelper';
import { default as Web3 } from 'web3';
import { ChainId } from '../../../../packages/address-book/address-book';
import { TokenPrices } from '../../../types/TokenPrice';

const getBalancerPrices = async (
  web3: Web3,
  chainId: ChainId,
  pools: MultiAssetPool[],
  tokenPrices: TokenPrices
) => {
  let prices: Awaited<ReturnType<typeof getPoolPrice>> = {};
  const { tokenAddresses, balances, totalSupplys } = await getPoolsData(web3, chainId, pools);
  for (let i = 0; i < pools.length; i++) {
    let price = await getPoolPrice(
      pools[i],
      tokenAddresses[i],
      balances[i],
      totalSupplys[i],
      tokenPrices
    );
    prices = { ...prices, ...price };
  }

  return prices;
};

const getPoolsData = async (web3: Web3, chainId: ChainId, pools: MultiAssetPool[]) => {
  const multicall = new MultiCall(web3, multicallAddress(chainId));
  const totalSupplyCalls: ShapeWithLabel[] = [];
  const balanceCalls: ShapeWithLabel[] = [];
  pools.forEach(pool => {
    const balancerVault = getContract(IBalancerVault, pool.vault);
    const weightedPool = getContract(ERC20, pool.address);
    balanceCalls.push({
      balance: balancerVault.methods.getPoolTokens(pool.vaultPoolId),
    });
    totalSupplyCalls.push({
      totalSupply: weightedPool.methods.totalSupply(),
    });
  });

  const res = (await multicall.all([balanceCalls, totalSupplyCalls])) as [
    { balance: { '0': string[]; '1': string[] } }[],
    { totalSupply: string }[]
  ];

  const tokenAddresses = res[0].map(v => v.balance['0']);
  const balances = res[0].map(v => v.balance['1']);
  const totalSupplys = res[1].map(v => new BigNumber(v.totalSupply));
  return { tokenAddresses, balances, totalSupplys };
};

const getPoolPrice = async (
  pool: MultiAssetPool,
  tokenAddresses: string[],
  balance: string[],
  totalSupply: BigNumber,
  tokenPrices: TokenPrices
) => {
  let tokenPrice;
  let tokenBalInUsd = new BigNumber(0);
  let totalStakedinUsd = new BigNumber(0);
  let shiftedBalances: string[] = [];
  for (let i = 0; i < pool.tokens.length; i++) {
    tokenPrice = getTokenPrice(tokenPrices, pool.tokens[i].oracleId);
    tokenBalInUsd = new BigNumber(balance[i]).times(tokenPrice).dividedBy(pool.tokens[i].decimals);
    totalStakedinUsd = totalStakedinUsd.plus(tokenBalInUsd);
    shiftedBalances.push(new BigNumber(balance[i]).dividedBy(pool.tokens[i].decimals).toString(10));
  }
  const price = totalStakedinUsd.times(pool.decimals).dividedBy(totalSupply).toNumber();

  return {
    [pool.name]: {
      price,
      tokens: tokenAddresses,
      balances: shiftedBalances,
      totalSupply: totalSupply.dividedBy(pool.decimals).toString(10),
    },
  };
};

const getTokenPrice = (tokenPrices: TokenPrices, oracleId: string) => {
  if (!oracleId) return 1;
  let tokenPrice = 1;
  const tokenSymbol = oracleId;
  if (tokenPrices.hasOwnProperty(tokenSymbol)) {
    tokenPrice = tokenPrices[tokenSymbol];
  } else {
    console.error(`Unknown token '${tokenSymbol}'. Consider adding it to .json file`);
  }
  return tokenPrice;
};

export default getBalancerPrices;
