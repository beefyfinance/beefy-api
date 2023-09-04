import IUniV3PoolAbi from '../abis/IUniV3Pool';
import IKyberElasticPoolAbi from '../abis/IKyberElasticPool';
import { ChainId } from '../../packages/address-book/types/chainid';
import { fetchContract } from '../api/rpc/client';

type ConcentratedLiquidityToken = {
  type: string;
  oracleId: string;
  decimalDelta: number;
  pool: `0x${string}`;
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
    {
      type: 'UniV3',
      oracleId: 'AXL',
      decimalDelta: 1,
      pool: '0x5B0d2536F0c970B8d9CBF3959460fb97Ce808Ade',
      firstToken: 'USDC',
      secondToken: 'AXL',
    },
    {
      type: 'UniV3',
      oracleId: 'GHO',
      decimalDelta: 1e12,
      pool: '0x54EEbc36527FE2E5624051E3c895810d7b68bcFc',
      firstToken: 'USDC',
      secondToken: 'GHO',
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
    {
      type: 'UniV3',
      oracleId: 'RETRO',
      decimalDelta: 1,
      pool: '0x35394eED0Be676ec6470fE6531daD809265310ff',
      firstToken: 'RETRO',
      secondToken: 'ETH',
    },
    {
      type: 'UniV3',
      oracleId: 'oRETRO',
      decimalDelta: 1,
      pool: '0x387FBcE5E2933Bd3a7243D0be2aAC8fD9Ab3D55d',
      firstToken: 'RETRO',
      secondToken: 'oRETRO',
    },
    {
      type: 'UniV3',
      oracleId: 'CASH',
      decimalDelta: 1,
      pool: '0x63ca6ED3D390C725b7FEb617BAdcab78a61038E8',
      firstToken: 'CASH',
      secondToken: 'MATIC',
    },
  ],
};

async function getConcentratedLiquidityPrices(
  tokenPrices: Record<string, number>,
  chainTokens: ConcentratedLiquidityToken[],
  chainId: ChainId
): Promise<number[]> {
  const concentratedLiquidityPriceCalls = chainTokens.map(token => {
    if (token.type == 'Kyber') {
      const tokenContract = fetchContract(token.pool, IKyberElasticPoolAbi, chainId);
      return tokenContract.read.getPoolState();
    } else {
      const tokenContract = fetchContract(token.pool, IUniV3PoolAbi, chainId);
      return tokenContract.read.slot0();
    }
  });

  try {
    const res = await Promise.all(concentratedLiquidityPriceCalls);
    const tokenPrice = res.map(v => Number(v[1]));
    const prices = {};
    tokenPrice.forEach((v, i) => {
      const first = chainTokens[i].firstToken;
      const second = chainTokens[i].secondToken;
      prices[chainTokens[i].oracleId] =
        first == chainTokens[i].oracleId
          ? (tokenPrices[second] || prices[second]) /
            (chainTokens[i].decimalDelta * Math.pow(1.0001, v))
          : (tokenPrices[first] || prices[first]) *
            (chainTokens[i].decimalDelta * Math.pow(1.0001, v));
    });
    return Object.values(prices);
  } catch (e) {
    console.error('getConcentratedLiquidityPrices', e);
    return chainTokens.map(() => 0);
  }
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
