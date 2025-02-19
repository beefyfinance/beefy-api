import { fetchContract } from '../../rpc/client';
import { fetchPrice } from '../../../utils/fetchPrice';
import { getApyBreakdown } from './getApyBreakdownNew';
import { BASE_CHAIN_ID, OPTIMISM_CHAIN_ID } from '../../../constants';
import { parseAbi } from 'viem';
import BigNumber from 'bignumber.js';

const helpers = {
  [OPTIMISM_CHAIN_ID]: '0x2a8Db8028B379b75CC1662D04279367b88Dc3692',
  [BASE_CHAIN_ID]: '0xBFcE247f6aA04Fc5141d25BB65C86F9463DD13d7',
};

const abi = parseAbi([
  'function rewardRate(address[] lps) external view returns (uint[] rates)',
  'function totalSupply() external view returns (uint)',
]);

export const getMellowVeloApys = async (chainId, pools) => {
  const token = chainId === BASE_CHAIN_ID ? 'AERO' : 'VELO';
  const price = await fetchPrice({ oracle: 'tokens', id: token });

  const totalSupply = pools.map(p => fetchContract(p.address, abi, chainId).read.totalSupply());
  const [rewardRates, supplies] = await Promise.all([
    fetchContract(helpers[chainId], abi, chainId).read.rewardRate([pools.map(p => p.address)]),
    Promise.all(totalSupply),
  ]);

  const apys = [];
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = new BigNumber(supplies[i]).times(lpPrice);
    const apy = new BigNumber(rewardRates[i]).times(31536000).times(price).div(totalStakedInUsd);
    apys.push(apy);
    // console.log(pool.name, 'apy', apy.toString(10));
  }

  return getApyBreakdown(pools.map((p, i) => ({ vaultId: p.name, vault: apys[i] })));
};
