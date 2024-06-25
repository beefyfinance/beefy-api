import { parseAbi } from 'viem';
import { fetchContract } from '../../rpc/client';
import BigNumber from 'bignumber.js';
import getApyBreakdown from '../common/getApyBreakdown';
import { getPendleApys } from '../common/getPendleBaseApys';
import pools from '../../../data/arbitrum/pendlePools.json';
import { ARBITRUM_CHAIN_ID as chainId } from '../../../constants';

export const getPenpieApys = async () => {
  let { tradingApys, pendleApys, syRewardsApys, arbApys } = await getPendleApys(chainId, pools);
  const farmApys = await applyPenpieBoost(pools, pendleApys, syRewardsApys, arbApys);
  return getApyBreakdown(pools, tradingApys, farmApys);
};

async function applyPenpieBoost(pools, pendleApys, syRewardsApys, arbApys) {
  const penpieStaking = '0x6DB96BBEB081d2a85E0954C252f2c1dC108b3f81';
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
      .plus(arbApys[i])
      .times(boost);
  });
}
