import BigNumber from 'bignumber.js';
import { fetchContract } from '../../rpc/client';

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

export const getBeefyCowcentratedVaultPrices = async (chainId, sources, tokenPrices) => {
  const contracts = sources.map(source => fetchContract(source.address, abi, chainId));

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
