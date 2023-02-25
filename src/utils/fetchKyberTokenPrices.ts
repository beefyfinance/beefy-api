import { MultiCall } from 'eth-multicall';
import { multicallAddress, web3Factory } from './web3';
import IKyberElasticPool from '../abis/IKyberElasticPool.json';
import { getContract } from './contractHelper';
import { ChainId } from '../../packages/address-book/types/chainid';

type KyberToken = {
  oracleId: string;
  decimals: string;
  pool: string;
  secondToken: string;
  secondTokenDecimals: string;
};

const tokens: Partial<Record<keyof typeof ChainId, KyberToken[]>> = {
  ethereum: [
    {
      oracleId: 'KNC',
      decimals: '1e18',
      pool: '0xB5e643250FF59311071C5008f722488543DD7b3C',
      secondToken: 'ETH',
      secondTokenDecimals: '1e18',
    },
  ],
};

async function getKyberPrices(
  tokenPrices: Record<string, number>,
  chainTokens: KyberToken[],
  chainId: ChainId
): Promise<number[]> {
  const web3 = web3Factory(chainId);
  const multicall = new MultiCall(web3, multicallAddress(chainId));

  const kyberPriceCalls = chainTokens.map(token => {
    const tokenContract = getContract(IKyberElasticPool, token.pool);
    return {
      price: tokenContract.methods.getPoolState(),
    };
  });

  let res;
  try {
    res = await multicall.all([kyberPriceCalls]);
  } catch (e) {
    console.error('getKyberPrices', e);
    return chainTokens.map(() => 0);
  }

  const tokenPrice = res[0].map(v => Number(v.price[1]));
  return tokenPrice.map((v, i) => tokenPrices[chainTokens[i].secondToken] / Math.pow(1.0001, v));
}

export async function fetchKyberTokenPrices(tokenPrices): Promise<Record<string, number>> {
  const pricesByChain: Record<string, number>[] = await Promise.all(
    Object.entries(tokens).map(async ([chainId, chainTokens]) => {
      const prices = await getKyberPrices(tokenPrices, chainTokens, ChainId[chainId]);
      return Object.fromEntries(chainTokens.map((token, i) => [token.oracleId, prices[i] || 0]));
    })
  );

  return Object.assign({}, ...pricesByChain);
}
