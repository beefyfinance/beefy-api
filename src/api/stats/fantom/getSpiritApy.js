import getApyBreakdown from '../common/getApyBreakdown';
import { getTradingFeeApr } from '../../../utils/getTradingFeeApr';
import fetchPrice from '../../../utils/fetchPrice';
import { MultiCall } from 'eth-multicall';
import { multicallAddress } from '../../../utils/web3';
import IRewardPool from '../../../abis/IRewardPool.json';
import BigNumber from 'bignumber.js';
import ERC20 from '../../../abis/ERC20.json';

const getMasterChefApys = require('./getFantomMasterChefApys');

const MasterChefAbi = require('../../../abis/fantom/SpiritChef.json');
const spiritPools = require('../../../data/fantom/spiritPools.json');
const { spiritClient } = require('../../../apollo/client');
const { fantomWeb3: web3 } = require('../../../utils/web3');
const { getRewardPoolApys } = require('../common/getRewardPoolApys');
const { FANTOM_CHAIN_ID: chainId, SPIRIT_LPF } = require('../../../constants');
const pools = require('../../../data/fantom/spiritGauges.json');

const getSpiritApys = async () => {
  const single = getMasterChefApys({
    masterchef: '0x9083EA3756BDE6Ee6f27a6e996806FBD37F6F093',
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'spiritPerBlock',
    hasMultiplier: true,
    singlePools: [
      {
        name: 'spirit-spirit',
        poolId: 0,
        address: '0x5Cc61A78F164885776AA610fb0FE1257df78E59B',
        oracle: 'tokens',
        oracleId: 'SPIRIT',
        decimals: '1e18',
      },
    ],
    oracle: 'tokens',
    oracleId: 'SPIRIT',
    decimals: '1e18',
    // log: true,
  });

  const spirit = getMasterChefApys({
    masterchef: '0x9083EA3756BDE6Ee6f27a6e996806FBD37F6F093',
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'spiritPerBlock',
    hasMultiplier: true,
    pools: spiritPools.filter(pool => !!pool.poolId),
    oracleId: 'SPIRIT',
    oracle: 'tokens',
    decimals: '1e18',
    // log: true,
    tradingFeeInfoClient: spiritClient,
    liquidityProviderFee: SPIRIT_LPF,
  });

  const gaugeAPYs = getGaugeAPYs();

  let apys = {};
  let apyBreakdowns = {};

  let promises = [spirit, single, gaugeAPYs];
  const results = await Promise.allSettled(promises);

  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getSpiritApys error', result.reason);
      continue;
    }

    // Set default APY values
    let mappedApyValues = result.value;
    let mappedApyBreakdownValues = {};

    // Loop through key values and move default breakdown format
    // To require totalApy key
    for (const [key, value] of Object.entries(result.value)) {
      mappedApyBreakdownValues[key] = {
        totalApy: value,
      };
    }

    // Break out to apy and breakdowns if possible
    let hasApyBreakdowns = 'apyBreakdowns' in result.value;
    if (hasApyBreakdowns) {
      mappedApyValues = result.value.apys;
      mappedApyBreakdownValues = result.value.apyBreakdowns;
    }

    apys = { ...apys, ...mappedApyValues };

    apyBreakdowns = { ...apyBreakdowns, ...mappedApyBreakdownValues };
  }

  return {
    apys,
    apyBreakdowns,
  };
};

const getGaugeAPYs = async () => {
  return getGaugeApys({
    web3: web3,
    chainId: chainId,
    pools: [...pools],
    oracleId: 'SPIRIT',
    oracle: 'tokens',
    decimals: '1e18',
    tradingFeeInfoClient: spiritClient,
    liquidityProviderFee: SPIRIT_LPF,
    //log: true,
  });
};

const getGaugeApys = async params => {
  const tradingAprs = await getTradingAprs(params);
  const farmApys = await getFarmApys(params);
  return getApyBreakdown(params.pools, tradingAprs, farmApys, SPIRIT_LPF);
};

const getTradingAprs = async params => {
  const client = params.tradingFeeInfoClient;
  const fee = params.liquidityProviderFee;
  const pairAddresses = params.pools.map(pool => pool.address.toLowerCase());
  const aprs = await getTradingFeeApr(client, pairAddresses, fee);
  return { ...aprs };
};

const getFarmApys = async params => {
  const apys = [];
  const rewardTokenPrice = await fetchPrice({ oracle: params.oracle, id: params.oracleId });

  const { balances, rewardRates } = await getPoolsData(params);

  for (let i = 0; i < params.pools.length; i++) {
    const pool = params.pools[i];

    const oracle = pool.oracle ?? 'lps';
    const id = pool.oracleId ?? pool.name;
    const stakedPrice = await fetchPrice({ oracle, id });
    const totalStakedInUsd = balances[i].times(stakedPrice).dividedBy(pool.decimals ?? '1e18');

    const secondsPerYear = 31536000;
    const yearlyRewards = rewardRates[i].dividedBy(2.5).times(secondsPerYear);
    const yearlyRewardsInUsd = yearlyRewards.times(rewardTokenPrice).dividedBy(params.decimals);

    const apy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    apys.push(apy);

    if (params.log) {
      console.log(
        pool.name,
        apy.toNumber(),
        totalStakedInUsd.valueOf(),
        yearlyRewardsInUsd.valueOf()
      );
    }
  }
  return apys;
};

const getPoolsData = async params => {
  const web3 = params.web3;
  const multicall = new MultiCall(web3, multicallAddress(params.chainId));
  const balanceCalls = [];
  const rewardRateCalls = [];
  params.pools.forEach(pool => {
    const rewardPool = new web3.eth.Contract(IRewardPool, pool.rewardPool);
    balanceCalls.push({
      balance: rewardPool.methods.totalSupply(),
    });
    rewardRateCalls.push({
      rewardRate: rewardPool.methods.rewardRate(),
    });
  });

  const res = await multicall.all([balanceCalls, rewardRateCalls]);

  const balances = res[0].map(v => new BigNumber(v.balance));
  const rewardRates = res[1].map(v => new BigNumber(v.rewardRate));
  return { balances, rewardRates };
};

module.exports = getSpiritApys;
