import BigNumber from 'bignumber.js';
import { getEDecimals } from './getEDecimals';
import { OPTIMISM_CHAIN_ID } from '../constants';
import { addressBook } from '../../packages/address-book/address-book';
import { fetchContract } from '../api/rpc/client';
import BeefyVaultV6Abi from '../abis/BeefyVault';

const {
  optimism: {
    tokens: { ETH, rfaWETH, USDC, rfaUSDC, DAI, rfaDAI, WBTC, rfaWBTC, USDT, rfaUSDT },
  },
} = addressBook;

const tokens = {
  optimism: [
    [ETH, rfaWETH],
    [USDC, rfaUSDC],
    [DAI, rfaDAI],
    [WBTC, rfaWBTC],
    [USDT, rfaUSDT],
  ],
};

const getVaultPrices = async (tokenPrices, tokens, chainId) => {
  const [balanceCalls, totalSupplyCalls, decimals] = tokens.reduce(
    (acc, token) => {
      const tokenContract = fetchContract(token[1].address, BeefyVaultV6Abi, chainId);
      acc[0].push(tokenContract.read.balance());
      acc[1].push(tokenContract.read.totalSupply());
      acc[2].push(getEDecimals(token[0].decimals));
      return acc;
    },
    [[], [], []]
  );

  let res;
  try {
    res = await Promise.all([Promise.all(balanceCalls), Promise.all(totalSupplyCalls)]);
  } catch (e) {
    console.error('getVaultPrices', e);
    return tokens.map(() => 0);
  }
  const balanceOfPool = res[0].map(v => new BigNumber(v.toString()));
  const totalSupply = res[1].map(v => new BigNumber(v.toString()));

  return balanceOfPool.map((v, i) =>
    v
      .times('1e18')
      .times(tokenPrices[tokens[i][0].oracleId])
      .dividedBy(totalSupply[i])
      .dividedBy(decimals[i])
      .toNumber()
  );
};

const fetchVaultPrices = async tokenPrices =>
  Promise.all([getVaultPrices(tokenPrices, tokens.optimism, OPTIMISM_CHAIN_ID)]).then(data =>
    data
      .flat()
      .reduce((acc, cur, i) => ((acc[Object.values(tokens).flat()[i][1].oracleId] = cur), acc), {})
  );

export { fetchVaultPrices };
