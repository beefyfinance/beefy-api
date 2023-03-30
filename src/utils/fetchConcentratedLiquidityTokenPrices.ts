import { MultiCall } from 'eth-multicall';
import { multicallAddress, web3Factory } from './web3';
import IKyberElasticPool from '../abis/IKyberElasticPool.json';
import IUniV3Pool from '../abis/IUniV3Pool.json';
import { getContract } from './contractHelper';
import { ChainId } from '../../packages/address-book/types/chainid';

type ConcentratedLiquidityToken = {
  type: string;
  oracleId: string;
  decimals: string;
  pool: string;
  secondToken: string;
  secondTokenDecimals: string;
};

const tokens: Partial<Record<keyof typeof ChainId, ConcentratedLiquidityToken[]>> = {
  ethereum: [
    {
      type: 'Kyber',
      oracleId: 'KNC',
      decimals: '1e18',
      pool: '0xB5e643250FF59311071C5008f722488543DD7b3C',
      secondToken: 'ETH',
      secondTokenDecimals: '1e18',
    },
  ],
  polygon: [
    {
      type: 'UniV3',
      oracleId: 'BAL',
      decimals: '1e18',
      pool: '0x4fe1269a585B141F11C3E144158f9f8823c7C0e7',
      secondToken: 'ETH',
      secondTokenDecimals: '1e18',
    },
  ],
};

async function getConcentratedLiquidityPrices(
  tokenPrices: Record<string, number>,
  chainTokens: ConcentratedLiquidityToken[],
  chainId: ChainId
): Promise<number[]> {
  const web3 = web3Factory(chainId);
  const multicall = new MultiCall(web3, multicallAddress(chainId));

  const concentratedLiquidityPriceCalls = chainTokens.map(token => {
    const tokenContract =
      token.type == 'Kyber'
        ? getContract(IKyberElasticPool, token.pool)
        : getContract(IUniV3Pool, token.pool);
    return {
      price:
        token.type == 'Kyber'
          ? tokenContract.methods.getPoolState()
          : tokenContract.methods.slot0(),
    };
  });

  let res;
  try {
    res = await multicall.all([concentratedLiquidityPriceCalls]);
  } catch (e) {
    console.error('getConcentratedLiquidityPrices', e);
    return chainTokens.map(() => 0);
  }

  const tokenPrice = res[0].map(v => Number(v.price[1]));
  return tokenPrice.map((v, i) => tokenPrices[chainTokens[i].secondToken] / Math.pow(1.0001, v));
}

export async function fetchConcentratedLiquidityTokenPrices(
  tokenPrices
): Promise<Record<string, number>> {
  const pricesByChain: Record<string, number>[] = await Promise.all(
    Object.entries(tokens).map(async ([chainId, chainTokens]) => {
      const prices = await getConcentratedLiquidityPrices(
        tokenPrices,
        chainTokens,
        ChainId[chainId]
      );
      return Object.fromEntries(chainTokens.map((token, i) => [token.oracleId, prices[i] || 0]));
    })
  );

  return Object.assign({}, ...pricesByChain);
}
