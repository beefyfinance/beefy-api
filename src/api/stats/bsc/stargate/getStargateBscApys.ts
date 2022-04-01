import { bscWeb3 as web3 } from '../../../../utils/web3';
import { spookyClient } from '../../../../apollo/client';
import getApyBreakdown from '../../common/getApyBreakdown';
import { MasterChefApysParams } from '../../common/getMasterChefApys';
import { getStargateFarmApys } from '../../common/stargate/getStargateApyData';

const getStargateBscApys = async () => {
  const masterchefParams: MasterChefApysParams = {
    web3: web3,
    chainId: 56,
    masterchef: '0x3052A0F6ab15b4AE1df39962d5DdEFacA86DaB47',
    tokenPerBlock: 'stargatePerBlock',
    hasMultiplier: false,
    pools: [],
    singlePools: [
      {
        name: 'stargate-bsc-busd',
        poolId: 1,
        address: '0x98a5737749490856b401DB5Dc27F522fC314A4e1',
        chainId: 56,
        oracle: 'tokens',
        oracleId: 'BUSD',
        decimals: '1e18',
      },
      {
        name: 'stargate-bsc-usdt',
        poolId: 0,
        address: '0x9aA83081AA06AF7208Dcc7A4cB72C94d057D2cda',
        chainId: 56,
        oracle: 'tokens',
        oracleId: 'USDT',
        decimals: '1e18',
      },
    ],
    oracleId: 'STG',
    oracle: 'tokens',
    decimals: '1e18',
    allocPointIndex: '1',
    tradingFeeInfoClient: spookyClient,
    liquidityProviderFee: 0.003,
  };
  masterchefParams.pools = [
    ...(masterchefParams.pools ?? []),
    ...(masterchefParams.singlePools ?? []),
  ];

  const farmApys = await getStargateFarmApys(masterchefParams);

  const liquidityProviderFee = masterchefParams.liquidityProviderFee ?? 0.003;

  return getApyBreakdown(masterchefParams.pools, {}, farmApys, liquidityProviderFee);
};

module.exports = getStargateBscApys;
