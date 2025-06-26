import { BERACHAIN_CHAIN_ID as chainId } from '../../../constants';
import beraswapPools from '../../../data/berachain/beraswapPools.json';
import { getSolidlyGaugeApys } from '../common/getSolidlyGaugeApys';
import { getRewardPoolApys } from '../common/getRewardPoolApys';

const getBeraswapApys = async () => {
  const data = await getSolidlyGaugeApys({
    chainId: chainId,
    pools: beraswapPools,
    reward: '0xac03CABA51e17c86c921E1f6CBFBdC91F8BB2E6b',
    oracle: 'tokens',
    oracleId: 'iBGT',
    decimals: '1e18',
    infrared: true,
    //log: true,
  });

  const single = await getRewardPoolApys({
    pools: [
      {
        name: 'infrared-ibgt',
        address: '0xac03CABA51e17c86c921E1f6CBFBdC91F8BB2E6b',
        rewardPool: '0x75F3Be06b02E235f6d0E7EF2D462b29739168301',
        decimals: '1e18',
        oracleId: 'iBGT',
        oracle: 'tokens',
        chainId: chainId,
        extras: [
          {
            rewardPool: '0x75F3Be06b02E235f6d0E7EF2D462b29739168301',
            rewardToken: '0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce',
            oracleId: 'HONEY',
            infrared: true,
          },
        ],
      },
    ],
    reward: '0x6969696969696969696969696969696969696969',
    infrared: true,
    oracleId: 'WBERA',
    oracle: 'tokens',
    decimals: '1e18',
    chainId: chainId,
    // log: true,
  });

  // Combine the APY data
  const combinedApys = {
    apys: { ...data.apys, ...single.apys },
    apyBreakdowns: { ...data.apyBreakdowns, ...single.apyBreakdowns },
  };

  return combinedApys;
};

module.exports = getBeraswapApys;
