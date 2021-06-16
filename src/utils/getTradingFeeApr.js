const { startOfMinute, subDays } = require('date-fns');
const { pairDayDataQuery, pairDayDataSushiQuery } = require('../apollo/queries');
const BigNumber = require('bignumber.js');

const getTradingFeeApr = async (client, pairAddresses, liquidityProviderFee) => {
  const [start, end] = getStartAndEndDate();

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
  const [start, end] = getStartAndEndDate();

  let queryResponse = await client.query({
    query: pairDayDataSushiQuery(addressesToLowercase(pairAddresses), start, end),
  });

  const pairDayDatas = queryResponse.data.pairs.map(pair => pair.dayData[0]);

  const pairAddressToAprMap = {};
  for (const pairDayData of pairDayDatas) {
    const pairAddress = pairDayData.id.split('-')[0].toLowerCase();
    pairAddressToAprMap[pairAddress] = new BigNumber(pairDayData.volumeUSD)
      .times(liquidityProviderFee)
      .times(365)
      .dividedBy(pairDayData.reserveUSD);
  }

  return pairAddressToAprMap;
};

const getUTCSeconds = (date /*: Date*/) => Math.floor(Number(date) / 1000);

const getStartAndEndDate = () => {
  // Use data between (now - 2) days and (now - 1) day, since current day data is still being produced
  const endDate = startOfMinute(subDays(Date.now(), 1));
  const startDate = startOfMinute(subDays(Date.now(), 2));
  const [start, end] = [startDate, endDate].map(getUTCSeconds);
  return [start, end];
};

const addressesToLowercase = (pairAddresses /*: string[]*/) =>
  pairAddresses.map(address => address.toLowerCase());

module.exports = {
  getTradingFeeApr,
  getTradingFeeAprSushi,
};
