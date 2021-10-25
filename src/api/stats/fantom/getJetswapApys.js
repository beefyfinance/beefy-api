import { getMasterChefApys } from '../common/getMasterChefApys';
import { fantomWeb3 as web3 } from '../../../utils/web3';
import { FANTOM_CHAIN_ID as chainId } from '../../../constants';
import pools from '../../../data/fantom/jetswapLpPools.json';
import { jetswapFantomClient } from '../../../apollo/client';

const getJetswapApys = async () =>
  await getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: '0x9180583C1ab03587b545629dd60D2be0bf1DF4f2',
    tokenPerBlock: 'cakePerSecond',
    secondsPerBlock: 1,
    hasMultiplier: false,
    pools: pools,
    singlePools: [
      {
        name: 'jetswap-fantom-fwings',
        poolId: 0,
        address: '0x3D8f1ACCEe8e263F837138829B6C4517473d0688',
        oracle: 'tokens',
        oracleId: 'fWINGS',
        decimals: '1e18',
      },
    ],
    oracleId: 'fWINGS',
    oracle: 'tokens',
    decimals: '1e18',
    tradingFeeInfoClient: jetswapFantomClient,
    liquidityProviderFee: 0.001,
    // log: true,
  });

module.exports = getJetswapApys;
