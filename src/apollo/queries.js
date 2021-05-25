const gql = require('graphql-tag');

const pairDayDataQuery = (pairs, startTimestamp) => {
  let pairsString = `[`;
  pairs.map(pair => {
    return (pairsString += `"${pair}"`);
  });
  pairsString += ']';
  const queryString = `
    query days {
      pairDayDatas(first: 1000, orderBy: date, orderDirection: asc, where: { pairAddress_in: ${pairsString}, date_gt: ${startTimestamp} }) {
        id
        pairAddress 
        date
        dailyVolumeToken0
        dailyVolumeToken1
        dailyVolumeUSD
        totalSupply
        reserveUSD
      }
    } 
`;
  return gql(queryString);
};

const pairDayDataSushiQuery = (pairs, startTimestamp) => {
  let pairsString = `[`;
  pairs.map(pair => {
    return (pairsString += `"${pair}"`);
  });
  pairsString += ']';
  const queryString = `
    query days {
      pairs(where: { id_in: ${pairsString}}) {
        dayData(first: 1000, orderBy: date, orderDirection: asc, where: { date_gt: ${startTimestamp} }) {
          id
          pair
          date
          volumeToken0
          volumeToken1
          volumeUSD
          totalSupply
          reserveUSD
        }
      }
    } 
`;
  return gql(queryString);
};

module.exports = {
  pairDayDataQuery,
  pairDayDataSushiQuery,
};
