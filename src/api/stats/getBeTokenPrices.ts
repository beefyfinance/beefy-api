import { fetchContract } from '../rpc/client';
import { sonic } from '../../../packages/address-book/src/address-book/sonic';
import { beSonicAbi } from '../../abis/sonic/beSonicAbi';
import { bigintRange } from '../../utils/array';
import BigNumber from 'bignumber.js';
import { BIG_ONE, BIG_UNIT_18, BIG_ZERO } from '../../utils/big-number';
import { sonicStakingAbi } from '../../abis/sonic/sonicStakingAbi';

export async function getBeTokenPrices(tokenPrices: Record<string, number>): Promise<Record<string, number>> {
  return {
    beJOE: tokenPrices['JOE'],
    beQI: tokenPrices['QI'],
    beCAKE: tokenPrices['Cake'],
    beVelo: tokenPrices['BeVELO'],
    beS: await getBeSonicRedeemablePrice(tokenPrices['WS']),
  };
}

/** assumes redeemable at PPFS (i.e. no validator is slashed and not yet withdrawn from)  */
async function getBeSonicRedeemablePrice(sonicPrice: number): Promise<number> {
  const token = sonic.tokens.beS;
  const contract = fetchContract(token.address, beSonicAbi, token.chainId);
  const pricePerFullShare = await contract.read.getPricePerFullShare();
  return new BigNumber(pricePerFullShare.toString(10)).times(sonicPrice).shiftedBy(-18).toNumber();
}

/** calculates PPFS from recoverable assets/totalSupply */
async function getBeSonicPriceWhileWithdrawingSlashed(sonicPrice: number): Promise<number> {
  const token = sonic.tokens.beS;
  const beContract = fetchContract(token.address, beSonicAbi, token.chainId);
  const [validatorsLength, totalSupply, pricePerFullShare, lockedProfit] = await Promise.all([
    beContract.read.validatorsLength(),
    beContract.read.totalSupply(),
    beContract.read.getPricePerFullShare(),
    beContract.read.lockedProfit(),
  ]);
  const validators = await Promise.all(
    bigintRange(validatorsLength).map(i => beContract.read.validatorByIndex([i]))
  );

  const stakingContract = fetchContract(
    '0xFC00FACE00000000000000000000000000000000',
    sonicStakingAbi,
    token.chainId
  );

  const validatorsWithStatus = await Promise.all(
    validators.map(async v => {
      const [isSlashed, refundRatio] = await Promise.all([
        stakingContract.read.isSlashed([v.id]),
        stakingContract.read.slashingRefundRatio([v.id]),
      ]);

      return {
        ...v,
        isSlashed,
        refundRatio,
        assets: v.delegations + v.slashedDelegations,
      };
    })
  );

  // Use PPFS*wS price only if there are no slashed validators
  const slashedValidators = validatorsWithStatus.filter(v => v.assets > 0n && v.isSlashed);
  if (slashedValidators.length === 0) {
    return new BigNumber(pricePerFullShare.toString(10)).times(sonicPrice).shiftedBy(-18).toNumber();
  }

  const totalAssets = validatorsWithStatus
    .reduce((acc, v) => {
      if (v.assets === 0n) {
        return acc;
      }

      const amount = new BigNumber(v.assets.toString(10));
      const penalty = getPenalty(amount, v.isSlashed, new BigNumber(v.refundRatio.toString(10)));
      return acc.plus(amount).minus(penalty);
    }, BIG_ZERO)
    .minus(lockedProfit.toString(10));

  // Math.mulDiv(x, y, denominator, 0)
  const x = BIG_UNIT_18;
  const y = totalAssets.plus(BIG_ONE);
  const denominator = new BigNumber(totalSupply.toString(10)).plus(BIG_ONE);
  const newPricePerFullShare = x.multipliedBy(y).dividedToIntegerBy(denominator);
  return newPricePerFullShare.times(sonicPrice).shiftedBy(-18).toNumber();
}

function getPenalty(amount: BigNumber, isCheater: boolean, refundRatio: BigNumber): BigNumber {
  // if (!isCheater || refundRatio >= Decimal.unit())
  if (!isCheater || refundRatio.gte(BIG_UNIT_18)) {
    return BIG_ZERO;
  }

  // penalty = (amount * (Decimal.unit() - refundRatio)) / Decimal.unit() + 1;
  const penalty = amount
    .multipliedBy(BIG_UNIT_18.minus(refundRatio))
    .dividedToIntegerBy(BIG_UNIT_18)
    .plus(BIG_ONE);

  if (penalty.gt(amount)) {
    return BIG_ZERO;
  }

  return penalty;
}
