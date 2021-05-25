const { startOfMinute, subDays } = require('date-fns');
const { pairDayDataQuery, pairDayDataSushiQuery } = require('../apollo/queries');
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

const getTradingFeeAprSushi = async (client, pairAddresses, liquidityProviderFee) => {
  const date = startOfMinute(subDays(Date.now(), 1));
  const start = Math.floor(Number(date) / 1000);

  let queryResponse = await client.query({
    query: pairDayDataSushiQuery(pairAddresses, start),
  });

  const pairDayDatas = queryResponse.data.pairs.map(pair => pair.dayData[0]);

  const pairAddressToAprMap = {};
  for (const pairDayData of pairDayDatas) {
    const { id } = pairDayData;
    const pairAddress = id.split('-')[0].toLowerCase();
    pairAddressToAprMap[pairAddress] = new BigNumber(pairDayData.volumeUSD)
      .times(liquidityProviderFee)
      .times(365)
      .dividedBy(pairDayData.reserveUSD);
  }

  return pairAddressToAprMap;
};

module.exports = {
  getTradingFeeApr,
  getTradingFeeAprSushi,
};
