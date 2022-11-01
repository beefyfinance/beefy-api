const gql = require('graphql-tag');

const pairDayDataQuery = (pairs, startTimestamp, endTimestamp) => {
  let pairsString = `[`;
  pairs.map(pair => {
    return (pairsString += `"${pair}"`);
  });
  pairsString += ']';
  const queryString = `
    query days {
      pairDayDatas(first: 1000, orderBy: date, orderDirection: asc, where: { pairAddress_in: ${pairsString}, date_gt: ${startTimestamp}, date_lt: ${endTimestamp} }) {
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

const pairDayDataSushiQuery = (pairs, startTimestamp, endTimestamp) => {
  let pairsString = `[`;
  pairs.map(pair => {
    return (pairsString += `"${pair}"`);
  });
  pairsString += ']';
  const queryString = `
    query days {
      pairs(where: { id_in: ${pairsString}}) {
        dayData(first: 1000, orderBy: date, orderDirection: asc, where: { date_gt: ${startTimestamp}, date_lt: ${endTimestamp} }) {
          id
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

const pairDayDataSushiTridentQuery = (pairs, startTimestamp, endTimestamp) => {
  let pairsString = `[`;
  pairs.map(pair => {
    return (pairsString += `"${pair}"`);
  });
  pairsString += ']';
  const queryString = `
    query days {
      pairDaySnapshots( first: 1000, orderBy: date, orderDirection: asc, where: { pair_in: ${pairsString} date_gt: ${startTimestamp}, date_lt: ${endTimestamp}}) {
          id
          volumeToken0
          volumeToken1
          volumeUSD
          liquidityUSD
        }
      }
`;
  return gql(queryString);
};

const poolsDataQuery = (pairs, block) => {
  let pairsString = `[`;
  pairs.map(pair => {
    return (pairsString += `"${pair}"`);
  });
  pairsString += ']';
  const queryString = `
    query days {
      pools(first: 1000, block: { number: ${block} }, where: { address_in: ${pairsString} }) {
        address
        totalSwapFee
        totalLiquidity
      }
    }
`;
  return gql(queryString);
};

const dayDataQuery = timestamp => {
  const dayId = Math.floor(timestamp / 86400000) - 1;
  const queryString = `
    query days {
      uniswapDayData(id: "${dayId}") {
        dailyVolumeUSD
      }
    }
`;
  return gql(queryString);
};

const joeDayDataQuery = timestamp => {
  const dayId = Math.floor(timestamp / 86400000) - 1;
  const queryString = `
    query days {
      dayData(id: "${dayId}") {
        volumeUSD
      }
    }
`;
  return gql(queryString);
};

const joeDayDataRangeQuery = (startTimestamp, endTimestamp) => {
  const queryString = `
  query volumeUSD {
    dayDatas(where: { date_gt: ${startTimestamp}, date_lt: ${endTimestamp} }) {
      volumeUSD
    }
  }
`;
  return gql(queryString);
};

const protocolDayDataRangeQuery = (startTimestamp, endTimestamp) => {
  const queryString = `
  query volume {
    uniswapDayDatas(where: { date_gt: ${startTimestamp}, date_lt: ${endTimestamp} }) {
      dailyVolumeUSD
    }
  }
`;
  return gql(queryString);
};

const balancerDataQuery = block => {
  const queryString = `
    query balancer {
      balancers(block: { number: ${block} }) {
        totalSwapFee
      }
    }
`;
  return gql(queryString);
};

const uniswapPositionQuery = (strategy, block) => {
  const queryString = `
    query positionData {
      positions(where: {owner: "${strategy}", _change_block: {number_gte: ${block}}}) {
        id
        collectedFeesToken0
        collectedFeesToken1
      }
    }
`;
  return gql(queryString);
};

const hopQuery = (address, startTimestamp, endTimestamp) => {
  const queryString = `
  query hop {
    tokenSwaps(first: 1000, orderBy: tokensSold, orderDirection: desc, where: { tokenEntity_: { address:"${address}" } , timestamp_gt: ${startTimestamp}, timestamp_lt: ${endTimestamp} }) {
      tokensSold
    }
  }
`;
  return gql(queryString);
};

module.exports = {
  pairDayDataQuery,
  pairDayDataSushiQuery,
  pairDayDataSushiTridentQuery,
  poolsDataQuery,
  dayDataQuery,
  joeDayDataQuery,
  joeDayDataRangeQuery,
  balancerDataQuery,
  protocolDayDataRangeQuery,
  uniswapPositionQuery,
  hopQuery,
};
