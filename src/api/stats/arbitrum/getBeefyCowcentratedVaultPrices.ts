import BigNumber from 'bignumber.js';
import { ChainId } from '../../../../packages/address-book/address-book';
import { fetchContract } from '../../rpc/client';

const sources = [
  {
    address: '0x487CeE58D6868f4662b716E4e1aB9DB728512789' as `0x${string}`,
    tokens: [
      '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    ],
    tokenOracleIds: ['WETH', 'USDT'],
    decimals: [18, 6],
    oracleId: 'uniswap-cow-eth-usdt',
  },
  {
    address: '0xD91127e48Ca528F0A07A1686552454267B60b429' as `0x${string}`,
    tokens: [
      '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
    ],
    tokenOracleIds: ['USDC', 'arbUSDCe'],
    decimals: [6, 6],
    oracleId: 'uniswap-cow-usdc-usdc.e',
  },
  {
    address: '0x67b48DBE49cA50C85c09C4e193d4bfCdE4171BB9' as `0x${string}`,
    tokens: [
      '0x35751007a407ca6FEFfE80b3cB397736D2cf4dbe',
      '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    ],
    tokenOracleIds: ['weETH', 'WETH'],
    decimals: [18, 18],
    oracleId: 'uniswap-cow-weeth-eth',
  },
];

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

export const getBeefyCowcentratedVaultPrices = async tokenPrices => {
  const contracts = sources.map(source => fetchContract(source.address, abi, ChainId.arbitrum));

  const [balances, totalSupplies] = await Promise.all([
    Promise.all(
      contracts.map(contract =>
        contract.read.balances().then(res => res.map(v => new BigNumber(v.toString())))
      )
    ),
    Promise.all(
      contracts.map(contract => contract.read.totalSupply().then(v => new BigNumber(v.toString())))
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

    prices[source.oracleId] = {
      price,
      tokens: source.tokens,
      balances: balances[i].map((v, i) => v.shiftedBy(-source.decimals[i]).toString(10)),
      totalSupply: totalSupplies[i].shiftedBy(-18).toString(10),
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
