import BigNumber from 'bignumber.js';
import { FANTOM_CHAIN_ID } from '../constants';
import { addressBook } from '../../packages/address-book/address-book';
import Token from '../../packages/address-book/types/token';
import YearnTokenVaultAbi from '../abis/YearnTokenVault';
import { fetchContract } from '../api/rpc/client';

const {
  fantom: {
    tokens: { WFTM, yvWFTM },
  },
} = addressBook;

const tokens = {
  fantom: [[WFTM, yvWFTM]],
};

const getyVaultPrices = async (tokenPrices, tokens: Token[][], chainId) => {
  const pricePerShareCalls = tokens.map(token => {
    const contract = fetchContract(token[1].address, YearnTokenVaultAbi, chainId);
    return contract.read.pricePerShare();
  });

  try {
    const res = await Promise.all(pricePerShareCalls);
    const pricePerShare = res.map(v => new BigNumber(v.toString()));
    return pricePerShare.map((v, i) =>
      v.times(tokenPrices[tokens[i][0].symbol]).dividedBy('1e18').toNumber()
    );
  } catch (e) {
    console.error('getyVaultPrices', e);
    return tokens.map(() => 0);
  }
};

const fetchyVaultPrices = async tokenPrices =>
  Promise.all([getyVaultPrices(tokenPrices, tokens.fantom, FANTOM_CHAIN_ID)]).then(data =>
    data
      .flat()
      .reduce((acc, cur, i) => ((acc[Object.values(tokens).flat()[i][1].symbol] = cur), acc), {})
  );

export { fetchyVaultPrices };
