import { getRewardPoolApys } from '../../common/getRewardPoolApys';
import pools from '../../../../data/degens/bisonLpPools.json';
import { APE_LPF } from '../../../../constants';
import { apeClient } from '../../../../apollo/client';

const { BSC_CHAIN_ID: chainId } = require('../../../../constants');
const { bscWeb3: web3 } = require('../../../../utils/web3');

export const getBisonApys = async () =>
  await getRewardPoolApys({
    web3: web3,
    chainId: chainId,
    pools: [
      ...pools,
      ...[
        {
          name: 'bison-bison',
          address: '0x19A6Da6e382b85F827088092a3DBe864d9cCba73',
          rewardPool: '0x5963Df2e4E65435d1C75b2339de8Ee1Cb5656633',
          oracle: 'tokens',
          oracleId: 'BISON',
          decimals: '1e18',
        },
      ],
    ],
    tokenPerBlock: 'rewardPerBlock',
    perBlock: 'true',
    oracleId: 'BISON',
    oracle: 'tokens',
    decimals: '1e18',
    tradingFeeInfoClient: apeClient,
    liquidityProviderFee: APE_LPF,
    // log: true,
  });
