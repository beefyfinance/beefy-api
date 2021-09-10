const BigNumber = require('bignumber.js');
const { MultiCall } = require('eth-multicall');
const { fantomWeb3: web3, multicallAddress } = require('../../../utils/web3');

const MasterChef = require('../../../abis/fantom/SteakHouse.json');
const ERC20 = require('../../../abis/ERC20.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/fantom/stakesteakLpPools.json');
const { BASE_HPY, FANTOM_CHAIN_ID } = require('../../../constants');
const { getTradingFeeApr } = require('../../../utils/getTradingFeeApr');
const getFarmWithTradingFeesApy = require('../../../utils/getFarmWithTradingFeesApy');
const { spiritClient } = require('../../../apollo/client');
const { compound } = require('../../../utils/compound');

const {
  addressBook: {
    fantom: {
      tokens: { STEAK },
    },
  },
} = require('../../../../packages/address-book/address-book');

const masterchef = '0x5bC37CAAA3b490b65F5A50E2553f4312126A8b7e';
const rewardToken = STEAK;
const oracle = 'tokens';
const secondsPerYear = 31536000;

const spiritLiquidityProviderFee = 0.0025;
const beefyPerformanceFee = 0.045;
const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;

const getStakeSteakLpApys = async () => {
  let apys = {};
  let apyBreakdowns = {};

  const rewardTokenPrice = await fetchPrice({ oracle, id: rewardToken.symbol });
  const { rewardPerSecond, totalAllocPoint } = await getMasterChefData();
  const { balances, allocPoints } = await getPoolsData(pools);

  const pairAddresses = pools.map(pool => pool.address);
  const tradingAprs = await getTradingFeeApr(
    spiritClient,
    pairAddresses,
    spiritLiquidityProviderFee
  );

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(lpPrice).dividedBy(pool.decimals);

    const yearlyRewards = rewardPerSecond
      .times(allocPoints[i])
      .dividedBy(totalAllocPoint)
      .times(secondsPerYear)
      .times(0.9);
    const yearlyRewardsInUsd = yearlyRewards
      .times(rewardTokenPrice)
      .dividedBy(10 ** rewardToken.decimals);

    const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    const vaultApr = simpleApy.times(shareAfterBeefyPerformanceFee);
    const vaultApy = compound(simpleApy, BASE_HPY, 1, shareAfterBeefyPerformanceFee);

    const tradingApr = tradingAprs[pool.address.toLowerCase()] ?? new BigNumber(0);
    const totalApy = getFarmWithTradingFeesApy(
      simpleApy,
      tradingApr,
      BASE_HPY,
      1,
      shareAfterBeefyPerformanceFee
    );

    // Create reference for legacy /apy
    const legacyApyValue = { [pool.name]: totalApy };
    // Add token to spirit APYs object
    apys = { ...apys, ...legacyApyValue };

    // Create reference for breakdown /apy
    const componentValues = {
      [pool.name]: {
        vaultApr: vaultApr.toNumber(),
        compoundingsPerYear: BASE_HPY,
        beefyPerformanceFee: beefyPerformanceFee,
        vaultApy: vaultApy,
        lpFee: spiritLiquidityProviderFee,
        tradingApr: tradingApr.toNumber(),
        totalApy: totalApy,
      },
    };
    // Add token to spirit APYs object
    apyBreakdowns = { ...apyBreakdowns, ...componentValues };
  }

  // Return both objects for later parsing
  return {
    apys,
    apyBreakdowns,
  };
};

const getMasterChefData = async () => {
  const masterchefContract = new web3.eth.Contract(MasterChef, masterchef);
  const rewardPerSecond = new BigNumber(
    await masterchefContract.methods.RewardsPerSecond(0).call()
  );
  const totalAllocPoint = new BigNumber(
    await masterchefContract.methods.totalAllocPoints(0).call()
  );
  return { rewardPerSecond, totalAllocPoint };
};

const getPoolsData = async pools => {
  const masterchefContract = new web3.eth.Contract(MasterChef, masterchef);
  const multicall = new MultiCall(web3, multicallAddress(FANTOM_CHAIN_ID));
  const balanceCalls = [];
  const poolInfos = [];

  for (let i = 0; i < pools.length; i++) {
    const tokenContract = new web3.eth.Contract(ERC20, pools[i].address);
    balanceCalls.push({
      balance: tokenContract.methods.balanceOf(masterchef),
    });
    poolInfos.push(await masterchefContract.methods.getPoolInfo(pools[i].poolId).call());
  }

  const res = await multicall.all([balanceCalls]);

  const balances = res[0].map(v => new BigNumber(v.balance));
  const allocPoints = poolInfos.map(v => new BigNumber(v['AllocPoints'][0]));

  return { balances, allocPoints };
};

module.exports = getStakeSteakLpApys;
