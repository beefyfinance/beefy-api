import BigNumber from 'bignumber.js';
import { MultiCall } from 'eth-multicall';
import { multicallAddress, web3Factory } from './web3';
import ICurvePool from '../abis/ICurvePool.json';
import ICurvePoolV2 from '../abis/ICurvePoolV2.json';
import { getContract } from './contractHelper';
import { ChainId } from '../../packages/address-book/address-book';

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

const tokens: Partial<Record<keyof typeof ChainId, CurveToken[]>> = {
  ethereum: [
    {
      oracleId: 'eUSD',
      decimals: '1e18',
      index0: 0,
      index1: 2,
      pool: '0xAEda92e6A3B1028edc139A4ae56Ec881f3064D4F',
      useUnderlying: true,
      secondToken: 'USDC',
      secondTokenDecimals: '1e6',
      abi: ICurvePool,
    },
    {
      oracleId: 'msETH',
      decimals: '1e18',
      index0: 1,
      index1: 0,
      pool: '0xc897b98272AA23714464Ea2A0Bd5180f1B8C0025',
      secondToken: 'ETH',
      secondTokenDecimals: '1e18',
      abi: ICurvePool,
    },
    {
      oracleId: 'cvxCRV',
      decimals: '1e18',
      index0: 1,
      index1: 0,
      pool: '0x971add32Ea87f10bD192671630be3BE8A11b8623',
      secondToken: 'CRV',
      secondTokenDecimals: '1e18',
      abi: ICurvePool,
    },
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
    {
      oracleId: 'cvxFXS',
      decimals: '1e18',
      index0: 1,
      index1: 0,
      pool: '0xd658A338613198204DCa1143Ac3F01A722b5d94A',
      secondToken: 'FXS',
      secondTokenDecimals: '1e18',
      abi: ICurvePoolV2,
    },
    {
      oracleId: 'CTR',
      decimals: '1e18',
      index0: 1,
      index1: 0,
      pool: '0xf2f12B364F614925aB8E2C8BFc606edB9282Ba09',
      secondToken: 'ETH',
      secondTokenDecimals: '1e18',
      abi: ICurvePoolV2,
    },
    {
      oracleId: 'CNC',
      decimals: '1e18',
      index0: 1,
      index1: 0,
      pool: '0x838af967537350D2C44ABB8c010E49E32673ab94',
      secondToken: 'ETH',
      secondTokenDecimals: '1e18',
      abi: ICurvePoolV2,
    },
    {
      oracleId: 'GEAR',
      decimals: '1e18',
      index0: 0,
      index1: 1,
      pool: '0x0E9B5B092caD6F1c5E6bc7f89Ffe1abb5c95F1C2',
      secondToken: 'ETH',
      secondTokenDecimals: '1e18',
      abi: ICurvePoolV2,
    },
    {
      oracleId: 'CLEV',
      decimals: '1e18',
      index0: 1,
      index1: 0,
      pool: '0x342D1C4Aa76EA6F5E5871b7f11A019a0eB713A4f',
      secondToken: 'ETH',
      secondTokenDecimals: '1e18',
      abi: ICurvePoolV2,
    },
  ],
  moonbeam: [
    {
      oracleId: 'stDOT',
      decimals: '1e10',
      index0: 1,
      index1: 0,
      pool: '0xc6e37086D09ec2048F151D11CdB9F9BbbdB7d685',
      secondToken: 'xcDOT',
      secondTokenDecimals: '1e10',
      abi: ICurvePool,
    },
  ],
};

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
