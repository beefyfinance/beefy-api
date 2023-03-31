import BigNumber from 'bignumber.js';
import { MultiCall } from 'eth-multicall';
import { multicallAddress, web3Factory } from './web3';
import ICurvePool from '../abis/ICurvePool.json';
import ICurvePoolV2 from '../abis/ICurvePoolV2.json';
import { getContract } from './contractHelper';
import { addressBookByChainId, ChainId } from '../../packages/address-book/address-book';

const tokens: Partial<Record<keyof typeof ChainId, CurveToken[]>> = {
  fantom: toCurveTokens(ChainId.fantom, require('../data/fantom/curvePools.json')),
  avax: toCurveTokens(ChainId.avax, require('../data/avax/curvePools.json')),
  optimism: toCurveTokens(ChainId.optimism, require('../data/optimism/curvePools.json')),
  arbitrum: toCurveTokens(ChainId.arbitrum, require('../data/arbitrum/curvePools.json')),
  moonbeam: toCurveTokens(ChainId.moonbeam, require('../data/moonbeam/curvePools.json')),
  kava: toCurveTokens(ChainId.kava, require('../data/kava/curvePools.json')),
  polygon: toCurveTokens(ChainId.polygon, [
    ...require('../data/matic/curvePools.json'),
    ...require('../data/matic/jarvisPools.json'),
  ]),
  ethereum: [
    ...toCurveTokens(ChainId.ethereum, require('../data/ethereum/convexPools.json')),
    {
      oracleId: 'cvxFPIS',
      decimals: '1e18',
      index0: 1,
      index1: 0,
      pool: '0xfBB481A443382416357fA81F16dB5A725DC6ceC8',
      secondToken: 'FPIS',
      secondTokenDecimals: '1e18',
      abi: ICurvePool,
    },
  ],
};

type CurveToken = {
  oracleId: string;
  decimals: string;
  index0: number;
  index1: number;
  pool: string;
  useUnderlying?: boolean;
  secondToken: string;
  secondTokenDecimals: string;
  abi: any;
};

function toCurveTokens(chainId, pools) {
  return pools
    .filter(p => p.getDy !== undefined)
    .map(p => {
      const abi = p.getDy[0] === 'v2' ? ICurvePoolV2 : ICurvePool;
      const index0 = p.getDy[1];
      const index1 = p.getDy[2];
      const oracleId = p.tokens[index0].oracleId;
      const decimals = p.tokens[index0].decimals;
      const useUnderlying = p.getDy[3] !== undefined;
      const secondToken = useUnderlying ? p.getDy[3] : p.tokens[index1].oracleId;
      const secondTokenDecimals = useUnderlying
        ? `1e${addressBookByChainId[chainId].tokens[p.getDy[3]].decimals}`
        : p.tokens[index1].decimals;
      return {
        pool: p.pool,
        abi,
        oracleId,
        decimals,
        index0,
        index1,
        useUnderlying,
        secondToken,
        secondTokenDecimals,
      };
    });
}

async function getCurveTokenPrices(
  tokenPrices: Record<string, number>,
  chainTokens: CurveToken[],
  chainId: ChainId
): Promise<number[]> {
  const web3 = web3Factory(chainId);
  const multicall = new MultiCall(web3, multicallAddress(chainId));

  const curvePriceCalls = chainTokens.map(token => {
    const pool = getContract(token.abi, token.pool);
    const getDy = token.useUnderlying ? pool.methods.get_dy_underlying : pool.methods.get_dy;
    return {
      price: getDy(token.index0, token.index1, new BigNumber(token.decimals).toString(10)),
    };
  });

  let res;
  try {
    res = await multicall.all([curvePriceCalls]);
  } catch (e) {
    console.error('getCurveTokenPrices', e);
    return chainTokens.map(() => 0);
  }

  const tokenPrice = res[0].map(v => new BigNumber(v.price));
  return tokenPrice.map((v, i) =>
    v
      .times(tokenPrices[chainTokens[i].secondToken])
      .dividedBy(chainTokens[i].secondTokenDecimals)
      .toNumber()
  );
}

export async function fetchCurveTokenPrices(tokenPrices): Promise<Record<string, number>> {
  const pricesByChain: Record<string, number>[] = await Promise.all(
    Object.entries(tokens).map(async ([chainId, chainTokens]) => {
      const prices = await getCurveTokenPrices(tokenPrices, chainTokens, ChainId[chainId]);
      return Object.fromEntries(chainTokens.map((token, i) => [token.oracleId, prices[i] || 0]));
    })
  );

  return Object.assign({}, ...pricesByChain);
}
