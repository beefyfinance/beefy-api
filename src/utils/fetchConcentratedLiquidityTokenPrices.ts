import { MultiCall } from 'eth-multicall';
import { multicallAddress, web3Factory } from './web3';
import IKyberElasticPool from '../abis/IKyberElasticPool.json';
import IUniV3Pool from '../abis/IUniV3Pool.json';
import { getContract } from './contractHelper';
import { ChainId } from '../../packages/address-book/types/chainid';

type ConcentratedLiquidityToken = {
  type: string;
  oracleId: string;
  decimalDelta: number;
  pool: string;
  firstToken: string;
  secondToken: string;
};

const tokens: Partial<Record<keyof typeof ChainId, ConcentratedLiquidityToken[]>> = {
  ethereum: [
    {
      type: 'Kyber',
      oracleId: 'KNC',
      decimalDelta: 1,
      pool: '0xB5e643250FF59311071C5008f722488543DD7b3C',
      firstToken: 'KNC',
      secondToken: 'ETH',
    },
    {
      type: 'UniV3',
      oracleId: 'R',
      decimalDelta: 1e12,
      pool: '0x190ed02adaf1ef8039fcd3f006b42553467d5045',
      firstToken: 'USDC',
      secondToken: 'R',
    },
  ],
  polygon: [
    {
      type: 'UniV3',
      oracleId: 'BAL',
      decimalDelta: 1,
      pool: '0x4fe1269a585B141F11C3E144158f9f8823c7C0e7',
      firstToken: 'BAL',
      secondToken: 'ETH',
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
  return tokenPrice.map((v, i) =>
    chainTokens[i].firstToken == chainTokens[i].oracleId
      ? tokenPrices[chainTokens[i].secondToken] /
        (chainTokens[i].decimalDelta * Math.pow(1.0001, v))
      : tokenPrices[chainTokens[i].firstToken] * (chainTokens[i].decimalDelta * Math.pow(1.0001, v))
  );
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
