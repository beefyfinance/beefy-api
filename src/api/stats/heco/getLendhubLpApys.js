const BigNumber = require('bignumber.js');
const { MultiCall } = require('eth-multicall');
const { hecoWeb3: web3, multicallAddress } = require('../../../utils/web3');

const MasterChef = require('../../../abis/heco/LendhubChef.json');
const ERC20 = require('../../../abis/ERC20.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/heco/lendhubLpPools.json');
const { BASE_HPY, HECO_CHAIN_ID } = require('../../../constants');
const { compound } = require('../../../utils/compound');
//const { getTradingFeeApr } = require('../../../utils/getTradingFeeApr');
//const getFarmWithTradingFeesApy = require('../../../utils/getFarmWithTradingFeesApy');
//const { mdexClient } = require('../../../apollo/client');

const masterchef = '0x00A5BF6ab1166bce027D9d4b0E829f92781ab1A7';
const oracleId = 'LHB';
const oracle = 'tokens';
const DECIMALS = '1e18';
const secondsPerBlock = 3;
const secondsPerYear = 31536000;

//const mdexLiquidityProviderFee = 0.002;

const getLendhubLpApys = async () => {
  let apys = {};

  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  const { rewardPerSecond, totalAllocPoint } = await getMasterChefData();
  const { balances, allocPoints } = await getPoolsData(pools);

  // const pairAddresses = pools.map(pool => pool.address);
  //const tradingAprs = await getTradingFeeApr(
  //  spookyClient,
  //  pairAddresses,
  //  spookyLiquidityProviderFee
  // );

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(lpPrice).dividedBy('1e18');

    const poolBlockRewards = rewardPerSecond.times(allocPoints[i]).dividedBy(totalAllocPoint);
    const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
    const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

    const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    // const tradingApr = tradingAprs[pool.address.toLowerCase()] ?? new BigNumber(0);
    // const apy = getFarmWithTradingFeesApy(simpleApy, tradingApr, BASE_HPY, 1, 0.955);
    const apy = compound(simpleApy, BASE_HPY, 1, 0.955);
    // console.log(pool.name, simpleApy.valueOf(), tradingApr.valueOf(), apy, totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
    const item = { [pool.name]: apy };

    apys = { ...apys, ...item };
  }

  return apys;
};

const getMasterChefData = async () => {
  const masterchefContract = new web3.eth.Contract(MasterChef, masterchef);
  const rewardPerSecond = new BigNumber(await masterchefContract.methods.lhbPerBlock().call());
  const totalAllocPoint = new BigNumber(await masterchefContract.methods.totalAllocPoint().call());
  return { rewardPerSecond, totalAllocPoint };
};

const getPoolsData = async pools => {
  const masterchefContract = new web3.eth.Contract(MasterChef, masterchef);
  const multicall = new MultiCall(web3, multicallAddress(HECO_CHAIN_ID));
  const balanceCalls = [];
  const allocPointCalls = [];
  pools.forEach(pool => {
    const tokenContract = new web3.eth.Contract(ERC20, pool.address);
    balanceCalls.push({
      balance: tokenContract.methods.balanceOf(masterchef),
    });
    allocPointCalls.push({
      allocPoint: masterchefContract.methods.poolInfo(pool.poolId),
    });
  });

  const res = await multicall.all([balanceCalls, allocPointCalls]);

  const balances = res[0].map(v => new BigNumber(v.balance));
  const allocPoints = res[1].map(v => v.allocPoint['1']);
  return { balances, allocPoints };
};

module.exports = getLendhubLpApys;
