const BigNumber = require('bignumber.js');
const { polygonWeb3: web3, web3Factory } = require('../../../utils/web3');

const SushiMiniChefV2 = require('../../../abis/matic/SushiMiniChefV2.json');
const SushiComplexRewarderTime = require('../../../abis/matic/SushiComplexRewarderTime.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/matic/sushiLpPools.json');
const { compound } = require('../../../utils/compound');
const { POLYGON_CHAIN_ID } = require('../../../constants');

const { exchange_matic, minichefv2_matic, blockClient_matic } = require('../../../apollo/client');
const {
  getUnixTime,
  startOfHour,
  startOfMinute,
  startOfSecond,
  subHours,
  subDays,
} = require('date-fns');
const {
  blockQuery,
  pairSubsetQuery,
  pairTimeTravelQuery,
  miniChefPoolQuery,
} = require('../../../apollo/queries');

const ERC20 = require('../../../abis/ERC20.json');
const { lpTokenPrice } = require('../../../utils/lpTokens');

const minichef = '0x0769fd68dFb93167989C6f7254cd0D766Fb2841F';
const oracleId = 'SUSHI';
const oracle = 'tokens';
const DECIMALS = '1e18';

// matic
const complexRewarderTime = '0xa3378Ca78633B3b9b2255EAa26748770211163AE';
const oracleIdMatic = 'WMATIC';

const getSushiLpApys = async () => {
  let apys = {};
  const tradingAprs = await getTradingFeeAprSushi();

  for (const pool of pools) {
    const tradingApr = new BigNumber(tradingAprs[pool.poolId]);
    const apy = await getPoolApy(minichef, pool, tradingApr);
    apys = { ...apys, ...apy };
  }

  return apys;
};

const getPoolApy = async (minichef, pool, tradingApr) => {
  const [yearlyRewardsInUsd, yearlyMaticRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(minichef, pool),
    getYearlyMaticRewardsInUsd(complexRewarderTime, pool),
    getTotalLpStakedInUsd(minichef, pool),
  ]);

  const totalRewardsInUSD = yearlyRewardsInUsd.plus(yearlyMaticRewardsInUsd);
  const simpleApr = totalRewardsInUSD.dividedBy(totalStakedInUsd);

  const apy =
    (1 + compound(Number(simpleApr), process.env.BASE_HPY, 1, 0.955)) *
      (1 + compound(Number(tradingApr), process.env.BASE_HPY, 1, 0.955)) -
    1;

  return { [pool.name]: apy };
};

const getYearlyRewardsInUsd = async (minichef, pool) => {
  const minichefContract = new web3.eth.Contract(SushiMiniChefV2, minichef);

  const rewards = new BigNumber(await minichefContract.methods.sushiPerSecond().call());

  let { allocPoint } = await minichefContract.methods.poolInfo(pool.poolId).call();
  allocPoint = new BigNumber(allocPoint);

  const totalAllocPoint = new BigNumber(await minichefContract.methods.totalAllocPoint().call());
  const poolBlockRewards = rewards.times(allocPoint).dividedBy(totalAllocPoint);

  const secondsPerBlock = 1;
  const secondsPerYear = 31536000;
  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

const getYearlyMaticRewardsInUsd = async (complexRewarderTime, pool) => {
  const complexRewarderTimeContract = new web3.eth.Contract(
    SushiComplexRewarderTime,
    complexRewarderTime
  );

  const rewards = new BigNumber(await complexRewarderTimeContract.methods.rewardPerSecond().call());

  let { allocPoint } = await complexRewarderTimeContract.methods.poolInfo(pool.poolId).call();
  allocPoint = new BigNumber(allocPoint);

  // totalAllocPoint is non public
  // https://github.com/sushiswap/sushiswap/blob/37026f3749f9dcdae89891f168d63667845576a7/contracts/mocks/ComplexRewarderTime.sol#L44
  // hardcoding to the same value SushiSwap hardcoded to
  // https://github.com/sushiswap/sushiswap-interface/blob/6300093e17756038a5b5089282d7bbe6dce87759/src/hooks/minichefv2/useFarms.ts#L77
  const hardcodedTotalAllocPoint = 1000;

  const totalAllocPoint = new BigNumber(hardcodedTotalAllocPoint);
  const poolBlockRewards = rewards.times(allocPoint).dividedBy(totalAllocPoint);

  const secondsPerBlock = 1;
  const secondsPerYear = 31536000;
  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const tokenPrice = await fetchPrice({ oracle, id: oracleIdMatic });
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

const getTotalLpStakedInUsd = async (targetAddr, pool) => {
  const web3 = web3Factory(POLYGON_CHAIN_ID);

  const tokenPairContract = new web3.eth.Contract(ERC20, pool.address);
  const totalStaked = new BigNumber(await tokenPairContract.methods.balanceOf(targetAddr).call());
  const tokenPrice = await lpTokenPrice(pool);
  const totalStakedInUsd = totalStaked.times(tokenPrice).dividedBy('1e18');
  return totalStakedInUsd;
};

const getTradingFeeAprSushi = async () => {
  // adapted from: https://github.com/sushiswap/sushiswap-interface/blob/bb6969dac2b06b2fcaed6d10493a4ccd3595e08f/src/hooks/minichefv2/useFarms.ts#L27
  const minichefQueryResult = await minichefv2_matic.query({
    query: miniChefPoolQuery,
  });

  const miniChefPools = minichefQueryResult.data.pools;
  const pairAddresses = miniChefPools
    .map(pool => {
      return pool.pair;
    })
    .sort();
  const pairsQuery = await exchange_matic.query({
    query: pairSubsetQuery,
    variables: { pairAddresses },
  });
  const oneDayBlock = await getOneDayBlock();
  const pairs24AgoQuery = await Promise.all(
    pairAddresses.map(address => {
      return exchange_matic.query({
        query: pairTimeTravelQuery,
        variables: { id: address, block: oneDayBlock },
      });
    })
  );
  const pairs24Ago = pairs24AgoQuery.map(query => {
    return {
      ...query?.data?.pair,
    };
  });

  const pairs = pairsQuery?.data.pairs;

  const farms = miniChefPools.filter(pool => pairs.find(pair => pair.id === pool.pair));

  let feeAprs = {};

  for (const pool of farms) {
    const pair = pairs.find(pair => pair.id === pool.pair);
    const pair24Ago = pairs24Ago.find(pair => pair.id === pool.pair);
    let feeApr = 0;
    if (pair && pair24Ago) {
      const oneDayVolume = pair.volumeUSD - pair24Ago.volumeUSD;
      const oneYearApr = (oneDayVolume * 0.003 * 365) / pair.reserveUSD;
      feeApr = { [pool.id]: oneYearApr };
    }
    feeAprs = { ...feeAprs, ...feeApr };
  }

  return feeAprs;
};

const getOneDayBlock = async () => {
  const date = startOfMinute(subDays(Date.now(), 1));
  const start = Math.floor(Number(date) / 1000);
  const end = Math.floor(Number(date) / 1000) + 600;

  const blocksData = await blockClient_matic.query({
    query: blockQuery,
    variables: {
      start,
      end,
    },
    context: {
      clientName: 'blocklytics',
    },
    fetchPolicy: 'network-only',
  });

  return { number: Number(blocksData?.data?.blocks[0].number) };
};

module.exports = getSushiLpApys;
