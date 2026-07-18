import { BERACHAIN_CHAIN_ID as chainId } from '../../../constants.ts';
import { getRewardPoolApys } from '../common/getRewardPoolApys.js';

const getBeraswapApys = async () =>
  getRewardPoolApys({
    pools: [
      {
        name: 'infrared-ibgt',
        address: '0xac03CABA51e17c86c921E1f6CBFBdC91F8BB2E6b',
        rewardPool: '0x75F3Be06b02E235f6d0E7EF2D462b29739168301',
        decimals: '1e18',
        oracleId: 'iBGT',
        oracle: 'tokens',
        chainId: chainId,
      },
    ],
    reward: '0x4f3C10D2bC480638048Fa67a7D00237a33670C1B',
    infrared: true,
    oracleId: 'iBGT',
    oracle: 'tokens',
    decimals: '1e18',
    chainId: chainId,
    // log: true,
  });

export default getBeraswapApys;
