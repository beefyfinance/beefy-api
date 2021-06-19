const { startOfMinute, subDays } = require('date-fns');
const { pairDayDataQuery, pairDayDataSushiQuery } = require('../apollo/queries');
const BigNumber = require('bignumber.js');

const getTradingFeeApr = async (client, pairAddresses, liquidityProviderFee) => {
  const [start, end] = getStartAndEndDate(1, 2);

  let {
    data: { pairDayDatas },
  } = await client.query({
    query: pairDayDataQuery(addressesToLowercase(pairAddresses), start, end),
  });

  const pairAddressToAprMap = {};
  for (const pairDayData of pairDayDatas) {
    const pairAddress = pairDayData.id.split('-')[0].toLowerCase();
    pairAddressToAprMap[pairAddress] = new BigNumber(pairDayData.dailyVolumeUSD)
      .times(liquidityProviderFee)
      .times(365)
      .dividedBy(pairDayData.reserveUSD);
  }

  return pairAddressToAprMap;
};

const getTradingFeeAprSushi = async (client, pairAddresses, liquidityProviderFee) => {
  const [start0, end0] = getStartAndEndDate(3, 4);
  const [start1, end1] = getStartAndEndDate(6, 7);

  let queryResponse0 = await client.query({
    query: pairDayDataSushiQuery(addressesToLowercase(pairAddresses), start0, end0),
  });

  let queryResponse1 = await client.query({
    query: pairDayDataSushiQuery(addressesToLowercase(pairAddresses), start1, end1),
  });

  const pairDayDatas0 = queryResponse0.data.pairs.map(pair => pair.dayData[0]);
  const pairDayDatas1 = queryResponse1.data.pairs.map(pair => pair.dayData[0]);

  const pairAddressToAprMap = {};
  for (const pairDayData of zip([pairDayDatas0, pairDayDatas1])) {
    if (pairDayData && pairDayData[0] && pairDayData[1]) {
      const pairAddress = pairDayData[0].id.split('-')[0].toLowerCase();
      const avgVol = new BigNumber(pairDayData[0].volumeUSD)
        .plus(pairDayData[1].volumeUSD)
        .dividedBy(2);
      const avgReserve = new BigNumber(pairDayData[0].reserveUSD)
        .plus(pairDayData[1].reserveUSD)
        .dividedBy(2);
      pairAddressToAprMap[pairAddress] = new BigNumber(avgVol)
        .times(liquidityProviderFee)
        .times(365)
        .dividedBy(avgReserve);
    }
  }

  return pairAddressToAprMap;
};

const getUTCSeconds = (date /*: Date*/) => Math.floor(Number(date) / 1000);

const getStartAndEndDate = (daysAgo0, daysAgo1) => {
  // Use data between (now - 2) days and (now - 1) day, since current day data is still being produced
  const endDate = startOfMinute(subDays(Date.now(), daysAgo0));
  const startDate = startOfMinute(subDays(Date.now(), daysAgo1));
  const [start, end] = [startDate, endDate].map(getUTCSeconds);
  return [start, end];
};

const addressesToLowercase = (pairAddresses /*: string[]*/) =>
  pairAddresses.map(address => address.toLowerCase());

const zip = arrays => {
  return arrays[0].map((_, i) => {
    return arrays.map(array => {
      return array[i];
    });
  });
};

module.exports = {
  getTradingFeeApr,
  getTradingFeeAprSushi,
};
