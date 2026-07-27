import { sonic } from '../../../../packages/address-book/src/address-book/sonic/index.ts';
import { beSonicAbi } from '../../../abis/sonic/beSonicAbi.ts';
import { DAILY_HPY, SONIC_CHAIN_ID } from '../../../constants.ts';
import { fromWeiString } from '../../../utils/big-number.ts';
import { getLoggerFor } from '../../../utils/logger/index.ts';
import { SECONDS_PER_YEAR } from '../../../utils/time.ts';
import { fetchContract } from '../../rpc/client.ts';
import { getApyBreakdown } from '../common/getApyBreakdownNew.ts';

const logger = getLoggerFor({ module: 'apy', chain: SONIC_CHAIN_ID });

export async function getBeSonicApy() {
  const token = sonic.tokens.beS;
  const contract = fetchContract(token.address, beSonicAbi, token.chainId);
  const [lastHarvest, totalAssets, totalLocked, lockDuration] = await Promise.all([
    contract.read.lastHarvest(),
    contract.read.totalAssets(),
    contract.read.totalLocked(),
    contract.read.lockDuration(),
  ]);
  const rewardsPerLockDuration = fromWeiString(totalLocked.toString(), token.decimals);
  const yearlyRewards = rewardsPerLockDuration.multipliedBy(SECONDS_PER_YEAR).dividedBy(lockDuration.toString());
  const totalStaked = fromWeiString(totalAssets.toString(), token.decimals);
  const lockApr = yearlyRewards.dividedBy(totalStaked); // both in wS so no need to convert to USD first

  const noPenaltySeconds = 60 * 60; // tail apr off if not harvested for [lock+1hr...(lock*2)+1hr] pro rata
  const secondsSinceHarvest = Math.trunc(Date.now() / 1000) - Number(lastHarvest);
  const lockDurationSeconds = Number(lockDuration);
  const secondsHarvestOverdue = Math.min(
    Math.max(0, secondsSinceHarvest - lockDurationSeconds - noPenaltySeconds),
    lockDurationSeconds
  );
  const penalty = secondsHarvestOverdue / lockDurationSeconds;
  if (secondsSinceHarvest > lockDurationSeconds) {
    logger.warn(
      {
        vault: 'beefy-besonic',
        overdueSeconds: secondsSinceHarvest - lockDurationSeconds,
        penalty,
      },
      'harvest overdue, apr penalty applied'
    );
  }
  const apr = lockApr.multipliedBy(1 - penalty);

  return getApyBreakdown({
    vaultId: 'beefy-besonic',
    beefyFee: 0, // fees (beefy/dao + liquidity) are charged before being locked
    vault: apr,
    compoundingsPerYear: DAILY_HPY,
  });
}
