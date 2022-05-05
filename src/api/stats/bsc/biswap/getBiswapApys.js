import { getMasterChefApys } from '../../common/getMasterChefApys';
import { bscWeb3 as web3 } from '../../../../utils/web3';
import { BSC_CHAIN_ID as chainId, BISWAP_LPF } from '../../../../constants';
import pools from '../../../../data/biswapLpPools.json';
import { biswapClient } from '../../../../apollo/client';

const getBiswapApys = async () =>
  await getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: '0xDbc1A13490deeF9c3C12b44FE77b503c1B061739',
    tokenPerBlock: 'BSWPerBlock',
    hasMultiplier: false,
    pools: pools,
    singlePools: [
      {
        name: 'biswap-bsw',
        poolId: 0,
        address: '0x965F527D9159dCe6288a2219DB51fc6Eef120dD1',
        oracle: 'tokens',
        oracleId: 'BSW',
        decimals: '1e18',
      },
    ],
    oracleId: 'BSW',
    oracle: 'tokens',
    decimals: '1e18',
    tradingFeeInfoClient: biswapClient,
    liquidityProviderFee: BISWAP_LPF,
    burn: 0.143,
    // log: true,
  });

module.exports = getBiswapApys;
