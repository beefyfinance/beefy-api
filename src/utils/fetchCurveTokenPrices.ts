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
  minter: string;
  secondToken: string;
  secondTokenDecimals: string;
  abi: any;
};

const tokens: Partial<Record<keyof typeof ChainId, CurveToken[]>> = {
  ethereum: [
    {
      oracleId: 'CNC',
      decimals: '1e18',
      index0: 1,
      index1: 0,
      minter: '0x838af967537350D2C44ABB8c010E49E32673ab94',
      secondToken: 'ETH',
      secondTokenDecimals: '1e18',
      abi: ICurvePoolV2,
    },
    {
      oracleId: 'GEAR',
      decimals: '1e18',
      index0: 0,
      index1: 1,
      minter: '0x0E9B5B092caD6F1c5E6bc7f89Ffe1abb5c95F1C2',
      secondToken: 'ETH',
      secondTokenDecimals: '1e18',
      abi: ICurvePoolV2,
    },
    {
      oracleId: 'CLEV',
      decimals: '1e18',
      index0: 1,
      index1: 0,
      minter: '0x342D1C4Aa76EA6F5E5871b7f11A019a0eB713A4f',
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
      minter: '0xc6e37086D09ec2048F151D11CdB9F9BbbdB7d685',
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
    const tokenContract = getContract(token.abi, token.minter);
    return {
      price: tokenContract.methods.get_dy(
        token.index0,
        token.index1,
        new BigNumber(token.decimals).toString(10)
      ),
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
