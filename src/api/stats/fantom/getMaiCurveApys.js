const { fantomWeb3: web3 } = require('../../../utils/web3');
import { getMasterChefApys } from '../common/getMasterChefApys';
import { getCurveFactoryApy } from '../common/curve/getCurveApyData';

const getMaiCurveApys = async () => {
  const pool = '0xA58F16498c288c357e28EE899873fF2b55D7C437';
  const tradingAprs = await getCurveFactoryApy(
    pool,
    'https://api.curve.fi/api/getFactoryAPYs-fantom'
  );
  return await getMasterChefApys({
    web3: web3,
    chainId: 250,
    masterchef: '0xDbfeE091d6bEF662BF3c79C3f08Eff3a0cC94BDE',
    tokenPerBlock: 'rewardPerSecond',
    hasMultiplier: false,
    pools: [
      {
        name: 'mai-curve-ftm-mai',
        chainId: 250,
        poolId: 0,
        address: pool,
        oracle: 'lps',
        oracleId: 'curve-ftm-mai',
        decimals: '1e18',
      },
    ],
    oracleId: 'QI',
    oracle: 'tokens',
    decimals: '1e18',
    secondsPerBlock: 1,
    tradingAprs: tradingAprs,
    liquidityProviderFee: 0.0002,
    // log: true,
  });
};

module.exports = getMaiCurveApys;
