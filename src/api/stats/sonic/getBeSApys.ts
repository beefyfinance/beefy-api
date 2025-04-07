import BigNumber from 'bignumber.js';
import BeS from '../../../abis/sonic/BeS';
import { SONIC_CHAIN_ID } from '../../../constants';
import { fetchContract } from '../../rpc/client';
import { getApyBreakdown } from '../common/getApyBreakdownNew';

export const getBeSApys = async () => {
  const contract = fetchContract('0x871A101Dcf22fE4fE37be7B654098c801CBA1c88', BeS, SONIC_CHAIN_ID);
  const [lastHarvest, lockedProfit, lockDuration, totalSupply, pricePerFullShare] = await Promise.all([
    contract.read.lastHarvest(),
    contract.read.lockedProfit(),
    contract.read.lockDuration(),
    contract.read.totalSupply(),
    contract.read.getPricePerFullShare(),
  ]);

  const remainingTime = lastHarvest + lockDuration - BigInt(Math.floor(Date.now() / 1000));
  if (remainingTime <= 0) {
    // should we project rewards for the next lock duration? value'd be be innacurate uf it isn't harvested soon
    return;
  }
  const rewardRate = new BigNumber(lockedProfit.toString(10))
    .div(new BigNumber(remainingTime.toString(10)))
    .multipliedBy(24 * 60 * 60);

  const ppfs = new BigNumber(pricePerFullShare.toString(10)).shiftedBy(-18);
  const apr = rewardRate.times(365).div(new BigNumber(totalSupply.toString(10)).times(ppfs));

  return getApyBreakdown([
    {
      vaultId: 'beefy-beS',
      beefyFee: 0.0,
      vault: apr,
      compoundingsPerYear: 365,
    },
  ]);
};
