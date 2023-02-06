import BigNumber from 'bignumber.js';
import { MultiCall } from 'eth-multicall';
import { web3Factory, multicallAddress } from './web3';
import ICurvePool from '../abis/ICurvePool.json';
import ICurvePoolV2 from '../abis/ICurvePoolV2.json';

import { ETH_CHAIN_ID, MOONBEAM_CHAIN_ID } from '../constants';
import { getContract } from './contractHelper';

const tokens = {
  ethereum: [
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

const getCurveTokenPrices = async (tokenPrices, tokens, chainId) => {
  const web3 = web3Factory(chainId);
  const multicall = new MultiCall(web3, multicallAddress(chainId));

  const curvePriceCalls = [];

  tokens.forEach(async token => {
    const tokenContract = getContract(token.abi, token.minter);
    curvePriceCalls.push({
      price: tokenContract.methods.get_dy(
        token.index0,
        token.index1,
        new BigNumber(token.decimals)
      ),
    });
  });

  let res;
  try {
    res = await multicall.all([curvePriceCalls]);
  } catch (e) {
    console.error('getCurveTokenPrices', e);
    return tokens.map(() => 0);
  }

  const tokenPrice = res[0].map(v => new BigNumber(v.price));
  return tokenPrice.map((v, i) =>
    v.times(tokenPrices[tokens[i].secondToken]).dividedBy(tokens[i].secondTokenDecimals).toNumber()
  );
};

const fetchCurveTokenPrices = async tokenPrices =>
  Promise.all([
    getCurveTokenPrices(tokenPrices, tokens.ethereum, ETH_CHAIN_ID),
    getCurveTokenPrices(tokenPrices, tokens.moonbeam, MOONBEAM_CHAIN_ID),
  ]).then(data =>
    data
      .flat()
      .reduce((acc, cur, i) => ((acc[Object.values(tokens).flat()[i].oracleId] = cur), acc), {})
  );

export { fetchCurveTokenPrices };
