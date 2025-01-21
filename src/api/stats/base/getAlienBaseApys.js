import { BASE_CHAIN_ID as chainId } from '../../../constants';
import { getMultiRewardMasterChefApys } from '../common/getMultiRewardMasterChefApys';
import BigNumber from 'bignumber.js';

const lpPools = require('../../../data/base/alienBaseLpPools.json');
const v3Pools = require('../../../data/base/alienBaseBunniPools.json');
const pools = [...lpPools, ...v3Pools];

const getAlienBaseApys = async () =>
  await getMultiRewardMasterChefApys({
    chainId: chainId,
    masterchef: '0x52eaeCAC2402633d98b95213d0b473E069D86590',
    secondsPerBlock: 1,
    pools,
    oracleId: 'ALB',
    oracle: 'tokens',
    decimals: '1e18',
    liquidityProviderFee: 0.0016,
    tradingAprs: await getTradingAprs(v3Pools),
    // log: true,
  });

async function getTradingAprs(pools) {
  let aprs = {};
  try {
    const response = await fetch(
      'https://nri7mhlmac.execute-api.eu-central-1.amazonaws.com/farmsData/aprData'
    ).then(res => res.json());
    pools.forEach(p => {
      const poolData = response.body.find(r => r.pool.toLowerCase() === p.address.toLowerCase());
      aprs[p.address.toLowerCase()] = new BigNumber(poolData.apyBase).div(100);
    });
  } catch (e) {
    console.error('AlienBase trading aprs error ', e.message);
  }
  return aprs;
}

module.exports = getAlienBaseApys;
