import { AVAX_CHAIN_ID as chainId } from '../../../constants';
import { getMasterChefApys } from '../common/getMasterChefApys';
import { addressBook } from '../../../../packages/address-book/address-book';
import { getCurveFactoryApy } from '../common/curve/getCurveApyData';

const mai = addressBook.avax.platforms.mai;

const getMaiCurveApys = async () => {
  const pool = '0xb0D2EB3C2cA3c6916FAb8DCbf9d9c165649231AE';
  const tradingAprs = await getCurveFactoryApy(
    pool,
    'https://api.curve.fi/api/getFactoryAPYs-avalanche'
  );
  return await getMasterChefApys({
    chainId: chainId,
    masterchef: '0x0f680790d022BcDf317BF3E97190AcA33A0621b2',
    tokenPerBlock: 'rewardPerSecond',
    hasMultiplier: false,
    pools: [
      {
        name: 'mai-avax-mai-crv',
        poolId: 0,
        address: pool,
        oracle: 'lps',
        oracleId: 'curve-avax-mai',
        decimals: '1e18',
      },
    ],
    oracleId: 'avaxQI',
    oracle: 'tokens',
    decimals: '1e18',
    secondsPerBlock: 1,
    tradingAprs: tradingAprs,
    liquidityProviderFee: 0.0002,
    // log: true,
  });
};

module.exports = getMaiCurveApys;
