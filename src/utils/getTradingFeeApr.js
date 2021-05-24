const { startOfMinute, subDays } = require('date-fns');
const { pairDayDataQuery } = require('../apollo/queries');
const BigNumber = require('bignumber.js');

const getTradingFeeApr = async (client, pairAddresses, liquidityProviderFee) => {
  const date = startOfMinute(subDays(Date.now(), 1));
  const start = Math.floor(Number(date) / 1000);

  let {
    data: { pairDayDatas },
  } = await client.query({
    query: pairDayDataQuery(pairAddresses, start),
  });

  const pairAddressToAprMap = {};
  for (const pairDayData of pairDayDatas) {
    pairAddressToAprMap[pairDayData.pairAddress.toString().toLowerCase()] = new BigNumber(
      pairDayData.dailyVolumeUSD
    )
      .times(liquidityProviderFee)
      .times(365)
      .dividedBy(pairDayData.reserveUSD);
  }

  return pairAddressToAprMap;
};

module.exports = {
  getTradingFeeApr,
};
