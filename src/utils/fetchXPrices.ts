import BigNumber from 'bignumber.js';
import {
  FANTOM_CHAIN_ID,
  FUSE_CHAIN_ID,
  POLYGON_CHAIN_ID,
  MOONBEAM_CHAIN_ID,
  AURORA_CHAIN_ID,
} from '../constants';
import { addressBook } from '../../packages/address-book/address-book';
import ERC20Abi from '../abis/ERC20Abi';
import { fetchContract } from '../api/rpc/client';
import Token from '../../packages/address-book/types/token';

const {
  fantom: {
    tokens: { BOO, xBOO, SCREAM, xSCREAM, CREDIT, xCREDIT },
  },
  polygon: {
    tokens: { newQUICK, newdQUICK },
  },
  fuse: {
    tokens: { VOLT, xVOLT },
  },
  moonbeam: {
    tokens: { STELLA, xSTELLA },
  },
  aurora: {
    tokens: { TRI, xTRI },
  },
} = addressBook;

const tokens = {
  fantom: [
    [BOO, xBOO],
    [SCREAM, xSCREAM],
    [CREDIT, xCREDIT],
  ],
  polygon: [[newQUICK, newdQUICK]],
  fuse: [[VOLT, xVOLT]],
  moonbeam: [[STELLA, xSTELLA]],
  aurora: [[TRI, xTRI]],
};

const getXPrices = async (tokenPrices, tokens: Token[][], chainId) => {
  const stakedInXPoolCalls = tokens.map(token => {
    const contract = fetchContract(token[0].address, ERC20Abi, chainId);
    return contract.read.balanceOf([token[1].address as `0x${string}`]);
  });
  const totalXSupplyCalls = tokens.map(token => {
    const contract = fetchContract(token[1].address, ERC20Abi, chainId);
    return contract.read.totalSupply();
  });

  try {
    const [xPoolResults, totalXSupplyResults] = await Promise.all([
      Promise.all(stakedInXPoolCalls),
      Promise.all(totalXSupplyCalls),
    ]);

    const stakedInXPool = xPoolResults.map(v => new BigNumber(v.toString()));
    const totalXSupply = totalXSupplyResults.map(v => new BigNumber(v.toString()));

    return stakedInXPool.map((v, i) =>
      v.times(tokenPrices[tokens[i][0].symbol]).dividedBy(totalXSupply[i]).toNumber()
    );
  } catch (e) {
    console.error('getXPrices', e);
    return tokens.map(() => 0);
  }
};

export async function fetchXPrices(
  tokenPrices: Record<string, number>
): Promise<Record<string, number>> {
  return Promise.all([
    getXPrices(tokenPrices, tokens.fantom, FANTOM_CHAIN_ID),
    getXPrices(tokenPrices, tokens.polygon, POLYGON_CHAIN_ID),
    getXPrices(tokenPrices, tokens.fuse, FUSE_CHAIN_ID),
    getXPrices(tokenPrices, tokens.moonbeam, MOONBEAM_CHAIN_ID),
    getXPrices(tokenPrices, tokens.aurora, AURORA_CHAIN_ID),
  ]).then(data =>
    data
      .flat()
      .reduce((acc, cur, i) => ((acc[Object.values(tokens).flat()[i][1].symbol] = cur), acc), {})
  );
}
