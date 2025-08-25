import ISolidlyPair from '../abis/ISolidlyPair';
import { ChainId } from '../../packages/address-book/src/types/chainid';
import { fetchContract } from '../api/rpc/client';
import BigNumber from 'bignumber.js';

type StablePoolLiquidityToken = {
  oracleId: string;
  pool: `0x${string}`;
  firstTokenDecimals: string;
  secondToken: string;
  secondTokenDecimals: number;
  secondTokenAddress: `0x${string}`;
};

const tokens: Partial<Record<keyof typeof ChainId, StablePoolLiquidityToken[]>> = {
  base: [
    {
      oracleId: 'bMAI',
      pool: '0xf6Aec4F97623E691a9426a69BaF5501509fCa05D',
      firstTokenDecimals: '1e18',
      secondToken: 'USDbC',
      secondTokenDecimals: 1e6,
      secondTokenAddress: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
    },
    {
      oracleId: 'bUSDC+',
      pool: '0xE96c788E66a97Cf455f46C5b27786191fD3bC50B',
      firstTokenDecimals: '1e6',
      secondToken: 'baseUSD+',
      secondTokenDecimals: 1e6,
      secondTokenAddress: '0xB79DD08EA68A908A97220C76d19A6aA9cBDE4376',
    },
    {
      oracleId: 'jEUR',
      pool: '0xC75799e0646470128a42D07335aB3BFa9E8Ee7C2',
      firstTokenDecimals: '1e18',
      secondToken: 'EURC',
      secondTokenDecimals: 1e6,
      secondTokenAddress: '0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42',
    },
    {
      oracleId: 'oUSDT',
      pool: '0xc84f7c63742EA1894EE04e5F49fbaE8C3a4a734d',
      firstTokenDecimals: '1e6',
      secondToken: 'USDC',
      secondTokenDecimals: 1e6,
      secondTokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    },
  ],
  linea: [
    {
      oracleId: 'lMAI',
      pool: '0xE9E146f5bceBD71Fb8C526EA036dE6bbFB1B0Ad7',
      firstTokenDecimals: '1e18',
      secondToken: 'USDC',
      secondTokenDecimals: 1e6,
      secondTokenAddress: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
    },
    {
      oracleId: 'asUSD',
      pool: '0x7b930713103A964c12E8b808c83F57E40d9ad495',
      firstTokenDecimals: '1e18',
      secondToken: 'USDC',
      secondTokenDecimals: 1e6,
      secondTokenAddress: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
    },
  ],
  arbitrum: [
    {
      oracleId: 'USDx',
      pool: '0x340F0c6E09bb2C13df14bb4B334CC8Dba0bb4881',
      firstTokenDecimals: '1e18',
      secondToken: 'USDC',
      secondTokenDecimals: 1e6,
      secondTokenAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    },
  ],
  scroll: [
    {
      oracleId: 'loreUSD',
      pool: '0x4775dFFd8762eE4C8DE49f4FD6D02A1f0d8f1698',
      firstTokenDecimals: '1e18',
      secondToken: 'USDC',
      secondTokenDecimals: 1e6,
      secondTokenAddress: '0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4',
    },
  ],
  bsc: [
    {
      oracleId: 'liveTHE',
      pool: '0x3765476BfFE43Cf4c0656bF3A7529c54ae247056',
      firstTokenDecimals: '1e18',
      secondToken: 'THE',
      secondTokenDecimals: 1e18,
      secondTokenAddress: '0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11',
    },
    {
      oracleId: 'mCAKE',
      firstTokenDecimals: '1e18',
      pool: '0x7569Ae71A1832fa5F403471a01289222b1Daacb5',
      secondToken: 'Cake',
      secondTokenDecimals: 1e18,
      secondTokenAddress: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
    },
    {
      oracleId: 'mBTC',
      firstTokenDecimals: '1e8',
      pool: '0x01e4a13b64A35EC29C490374C0aC6a585FF7cE79',
      secondToken: 'BTCB',
      secondTokenDecimals: 1e18,
      secondTokenAddress: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
    },
  ],
};

async function getStablePoolPrices(
  tokenPrices: Record<string, number>,
  chainTokens: StablePoolLiquidityToken[],
  chainId: ChainId
): Promise<number[]> {
  const stablePoolLiquidityPriceCalls = chainTokens.map(token => {
    const tokenContract = fetchContract(token.pool, ISolidlyPair, chainId);

    const amountIn = token.secondTokenDecimals;
    const tokenIn = token.secondTokenAddress;
    return tokenContract.read.getAmountOut([BigInt(amountIn), tokenIn]);
  });

  try {
    const res = await Promise.all(stablePoolLiquidityPriceCalls);
    const tokenPrice = res.map(v => Number(v));
    const prices = {};
    tokenPrice.forEach((v, i) => {
      const second = chainTokens[i].secondToken;
      const amount = new BigNumber(v).dividedBy(new BigNumber(chainTokens[i].firstTokenDecimals)).toNumber();
      prices[chainTokens[i].oracleId] = tokenPrices[second] / amount;
    });
    return Object.values(prices);
  } catch (e) {
    console.error('getSolidlyStableTokenPrices', e);
    return chainTokens.map(() => 0);
  }
}

export async function fetchSolidlyStableTokenPrices(tokenPrices): Promise<Record<string, number>> {
  const pricesByChain: Record<string, number>[] = await Promise.all(
    Object.entries(tokens).map(async ([chainId, chainTokens]) => {
      const prices = await getStablePoolPrices(tokenPrices, chainTokens, ChainId[chainId]);
      return Object.fromEntries(chainTokens.map((token, i) => [token.oracleId, prices[i] || 0]));
    })
  );

  return Object.assign({}, ...pricesByChain);
}
