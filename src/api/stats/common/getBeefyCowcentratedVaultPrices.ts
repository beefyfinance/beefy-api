import BigNumber from 'bignumber.js';
import { fetchContract } from '../../rpc/client';
import { ChainId } from '../../../../packages/address-book/address-book';
import ERC20Abi from '../../../abis/ERC20Abi';

const abi = [
  {
    inputs: [],
    name: 'balances',
    outputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const v3PoolAbi = [
  {
    inputs: [],
    name: 'liquidity',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

type CowVault = {
  address: `0x${string}`;
  lpAddress: `0x${string}`;
  tokens: [string, string];
  tokenOracleIds: [string, string];
  decimals: [number, number];
  oracleId: string;
};

export const getBeefyCowcentratedVaultPrices = async (
  chainId: ChainId,
  sources: CowVault[],
  tokenPrices: Record<string, number>
) => {
  const contracts = sources.map(source => fetchContract(source.address, abi, chainId));
  const poolContracts = sources.map(source => fetchContract(source.lpAddress, v3PoolAbi, chainId));
  const token0Contracts = sources.map(source => fetchContract(source.tokens[0], ERC20Abi, chainId));
  const token1Contracts = sources.map(source => fetchContract(source.tokens[1], ERC20Abi, chainId));

  const [balances, totalSupplies, liquidities, token0UnderlyingBalances, token1UnderlyingBalances] =
    await Promise.all([
      Promise.all(
        contracts.map(contract =>
          contract.read.balances().then(res => res.map(v => new BigNumber(v.toString())))
        )
      ),
      Promise.all(
        contracts.map(contract =>
          contract.read.totalSupply().then(v => new BigNumber(v.toString()))
        )
      ),
      Promise.all(
        poolContracts.map(contract =>
          contract.read.liquidity().then(v => new BigNumber(v.toString()))
        )
      ),
      Promise.all(
        token0Contracts.map((contract, index) =>
          contract.read.balanceOf([sources[index].lpAddress]).then(v => new BigNumber(v.toString()))
        )
      ),
      Promise.all(
        token1Contracts.map((contract, index) =>
          contract.read.balanceOf([sources[index].lpAddress]).then(v => new BigNumber(v.toString()))
        )
      ),
    ]);
  const prices = {};

  sources.forEach((source, i) => {
    const token1UsdAmount = balances[i][0]
      .shiftedBy(-source.decimals[0])
      .times(getTokenPrice(tokenPrices, source.tokenOracleIds[0]));
    const token2UsdAmount = balances[i][1]
      .shiftedBy(-source.decimals[1])
      .times(getTokenPrice(tokenPrices, source.tokenOracleIds[1]));
    const price = token1UsdAmount
      .plus(token2UsdAmount)
      .div(totalSupplies[i].shiftedBy(-18))
      .toNumber();

    const underlyingToken0UsdAmount = token0UnderlyingBalances[i]
      .shiftedBy(-source.decimals[0])
      .times(getTokenPrice(tokenPrices, source.tokenOracleIds[0]));
    const underlyingToken1UsdAmount = token1UnderlyingBalances[i]
      .shiftedBy(-source.decimals[1])
      .times(getTokenPrice(tokenPrices, source.tokenOracleIds[1]));
    const underlyingPrice = underlyingToken0UsdAmount
      .plus(underlyingToken1UsdAmount)
      .div(liquidities[i].shiftedBy(-18))
      .toNumber();

    prices[source.oracleId] = {
      price,
      tokens: source.tokens,
      balances: balances[i].map((v, i) => v.shiftedBy(-source.decimals[i]).toString(10)),
      totalSupply: totalSupplies[i].shiftedBy(-18).toString(10),
      underlyingLiquidity: liquidities[i].shiftedBy(-18).toString(10),
      underlyingBalances: [
        token0UnderlyingBalances[i].shiftedBy(-source.decimals[0]).toString(10),
        token1UnderlyingBalances[i].shiftedBy(-source.decimals[1]).toString(10),
      ],
      underlyingPrice: underlyingPrice,
    };
  });

  return prices;
};

const getTokenPrice = (tokenPrices, token) => {
  if (!tokenPrices.hasOwnProperty(token)) {
    console.error(
      `BeefyCowcentratedVault Unknown token '${token}'. Consider adding it to .json file`
    );
    return 1;
  }
  return tokenPrices[token];
};
