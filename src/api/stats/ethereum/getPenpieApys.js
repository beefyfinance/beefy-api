import { parseAbi } from 'viem';
import { fetchContract } from '../../rpc/client';
import BigNumber from 'bignumber.js';
import getApyBreakdown from '../common/getApyBreakdown';
import { getPendleApys } from '../common/getPendleBaseApys';
import pools from '../../../data/ethereum/pendlePools.json';
import { ETH_CHAIN_ID as chainId } from '../../../constants';

export const getPenpieApys = async () => {
  let { tradingApys, pendleApys, syRewardsApys } = await getPendleApys(chainId, pools);
  const farmApys = await applyPenpieBoost(pools, pendleApys, syRewardsApys);
  return getApyBreakdown(pools, tradingApys, farmApys);
};

async function applyPenpieBoost(pools, pendleApys, syRewardsApys) {
  const penpieStaking = '0x6E799758CEE75DAe3d84e09D40dc416eCf713652';
  const penpieFee = 0.22;
  const abi = parseAbi([
    'function balanceOf(address) view returns (uint256)',
    'function activeBalance(address) view returns (uint256)',
  ]);
  const balancesCalls = [],
    activeBalancesCalls = [];
  pools.forEach(pool => {
    const lp = fetchContract(pool.address, abi, chainId);
    balancesCalls.push(lp.read.balanceOf([penpieStaking]).then(v => new BigNumber(v)));
    activeBalancesCalls.push(lp.read.activeBalance([penpieStaking]).then(v => new BigNumber(v)));
  });
  const [balances, activeBalances] = await Promise.all([
    Promise.all(balancesCalls),
    Promise.all(activeBalancesCalls),
  ]);

  return pendleApys.map((apy, i) => {
    const boost = balances[i].isZero() ? 2.5 : activeBalances[i].div(balances[i]).times(2.5);
    return apy
      .times(1 - penpieFee)
      .plus(syRewardsApys[i])
      .times(boost);
  });
}
