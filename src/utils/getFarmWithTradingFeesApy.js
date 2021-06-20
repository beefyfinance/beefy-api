// This function calculates the total APY of a LP farm, which includes the farm APY, along with the revenue from trading fees that is received from providing liquidity to a liquidity pool.
// Here is the derivation of the formula, credit to roastyb.
/*
Lets assume a daily compounding frequency.

The formula for compounding interest is:

(1) Total = D * (1 + APR/365)^365
Where D is the initial deposit.

Subtracting the initial deposit to get only the gains:

Gains = D * (1 + APR/365)^365 - D

Dividing out D to get the percentage rate with respect to the initial principal (Gains/A = APY)
(2) APY = (1 + APR/365)^365 - 1

Normally D doesn't generate interest, but in our case, since our D generates revenue from trading fees,
and we are reinvesting rewards which in turn increases our share of the trading fees, we can also model D with the compounding interest formula in equation (1)

(3) Total = D * (1 + APRTrading/365)^365 * (1 + APRVault/365)^365

Manipulating equation (2) to get (4) then using to replace in (3)

(4) APY + 1 = (1 + APR/365)^365

(5) Total = D * (1 + APYTrading) * (1 + APYVault)

Replacing with (4) in (1)

(6) Total = D * (1 + FinalAPY)

Finally, setting (5) and (6) equal to each other and solving for FinalAPY

D * (1 + FinalAPY) = D * (1 + APYTrading) * (1 + APYVault)
(1 + FinalAPY) = (1 + APYTrading) * (1 + APYVault)
FinalAPY = (1 + APYTrading) * (1 + APYVault) - 1
*/

const { compound } = require('./compound');

const getFarmWithTradingFeesApy = (
  farmApr,
  tradingApr,
  compoundingsPerYear,
  t,
  shareAfterBeefyPerformanceFee
) => {
  const farmApy = farmApr
    ? compound(farmApr, compoundingsPerYear, t, shareAfterBeefyPerformanceFee)
    : 0;
  const tradingApy = tradingApr ? compound(tradingApr, compoundingsPerYear, t, 1) : 0; // no fee on trading
  const finalAPY = (1 + farmApy) * (1 + tradingApy) - 1;
  return finalAPY;
};

module.exports = getFarmWithTradingFeesApy;
