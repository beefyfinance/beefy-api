const BigNumber = require('bignumber.js');
const { MultiCall } = require('eth-multicall');
const { polygonWeb3: web3, multicallAddress } = require('../../../utils/web3');

const SushiMiniChefV2 = require('../../../abis/matic/SushiMiniChefV2.json');
const SushiComplexRewarderTime = require('../../../abis/matic/SushiComplexRewarderTime.json');
const ERC20 = require('../../../abis/ERC20.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/matic/sushiLpPools.json');
const getFarmWithTradingFeesApy = require('../../../utils/getFarmWithTradingFeesApy');
const { POLYGON_CHAIN_ID } = require('../../../constants');
const { BASE_HPY } = require('../../../constants');

const { exchange_matic, minichefv2_matic, blockClient_matic } = require('../../../apollo/client');
const { startOfMinute, subDays } = require('date-fns');
const {
  blockQuery,
  pairSubsetQuery,
  pairTimeTravelQuery,
  miniChefPoolQuery,
} = require('../../../apollo/queries');

const minichef = '0x0769fd68dFb93167989C6f7254cd0D766Fb2841F';
const oracleId = 'SUSHI';
const oracle = 'tokens';
const DECIMALS = '1e18';
const secondsPerBlock = 1;
const secondsPerYear = 31536000;

// matic
const complexRewarderTime = '0xa3378Ca78633B3b9b2255EAa26748770211163AE';
const oracleIdMatic = 'WMATIC';

const getSushiLpApys = async () => {
  let apys = {};
  const tradingAprs = await getTradingFeeAprSushi();
  const farmApys = await getFarmApys(pools);

  pools.forEach((pool, i) => {
    const simpleApy = farmApys[i];
    const tradingApr = new BigNumber(tradingAprs[pool.poolId]);
    const apy = getFarmWithTradingFeesApy(simpleApy, tradingApr, BASE_HPY, 1, 0.955);
    apys = { ...apys, ...{ [pool.name]: apy } };
  });

  return apys;
};

const getFarmApys = async pools => {
  const apys = [];
  const minichefContract = new web3.eth.Contract(SushiMiniChefV2, minichef);
  const sushiPerSecond = new BigNumber(await minichefContract.methods.sushiPerSecond().call());
  const totalAllocPoint = new BigNumber(await minichefContract.methods.totalAllocPoint().call());

  const rewardContract = new web3.eth.Contract(SushiComplexRewarderTime, complexRewarderTime);
  const rewardPerSecond = new BigNumber(await rewardContract.methods.rewardPerSecond().call());
  // totalAllocPoint is non public
  // https://github.com/sushiswap/sushiswap/blob/37026f3749f9dcdae89891f168d63667845576a7/contracts/mocks/ComplexRewarderTime.sol#L44
  // hardcoding to the same value SushiSwap hardcoded to
  // https://github.com/sushiswap/sushiswap-interface/blob/6300093e17756038a5b5089282d7bbe6dce87759/src/hooks/minichefv2/useFarms.ts#L77
  const hardcodedTotalAllocPoint = 1000;

  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  const maticPrice = await fetchPrice({ oracle, id: oracleIdMatic });
  const { balances, allocPoints, rewardAllocPoints } = await getPoolsData(pools);
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(lpPrice).dividedBy('1e18');

    const poolBlockRewards = sushiPerSecond.times(allocPoints[i]).dividedBy(totalAllocPoint);
    const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
    const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

    const allocPoint = rewardAllocPoints[i];
    const maticRewards = rewardPerSecond.times(allocPoint).dividedBy(hardcodedTotalAllocPoint);
    const yearlyMaticRewards = maticRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
    const maticRewardsInUsd = yearlyMaticRewards.times(maticPrice).dividedBy(DECIMALS);

    const apy = yearlyRewardsInUsd.plus(maticRewardsInUsd).dividedBy(totalStakedInUsd);
    apys.push(apy);
  }
  return apys;
};

const getPoolsData = async pools => {
  const minichefContract = new web3.eth.Contract(SushiMiniChefV2, minichef);
  const rewardContract = new web3.eth.Contract(SushiComplexRewarderTime, complexRewarderTime);

  const balanceCalls = [];
  const allocPointCalls = [];
  const rewardAllocPointCalls = [];
  pools.forEach(pool => {
    const tokenContract = new web3.eth.Contract(ERC20, pool.address);
    balanceCalls.push({
      balance: tokenContract.methods.balanceOf(minichef),
    });
    allocPointCalls.push({
      allocPoint: minichefContract.methods.poolInfo(pool.poolId),
    });
    rewardAllocPointCalls.push({
      allocPoint: rewardContract.methods.poolInfo(pool.poolId),
    });
  });

  const multicall = new MultiCall(web3, multicallAddress(POLYGON_CHAIN_ID));
  const res = await multicall.all([balanceCalls, allocPointCalls, rewardAllocPointCalls]);

  const balances = res[0].map(v => new BigNumber(v.balance));
  const allocPoints = res[1].map(v => v.allocPoint['2']);
  const rewardAllocPoints = res[2].map(v => v.allocPoint['2']);
  return { balances, allocPoints, rewardAllocPoints };
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
