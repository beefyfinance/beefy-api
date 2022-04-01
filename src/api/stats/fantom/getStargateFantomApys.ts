import { fantomWeb3 as web3 } from '../../../utils/web3';
import { spookyClient } from '../../../apollo/client';
import getApyBreakdown from '../common/getApyBreakdown';
import { MasterChefApysParams } from '../common/getMasterChefApys';
import { getStargateFarmApys } from '../common/stargate/getStargateApyData';

const getStargateFantomApys = async () => {
  const masterchefParams: MasterChefApysParams = {
    web3: web3,
    chainId: 250,
    masterchef: '0x224D8Fd7aB6AD4c6eb4611Ce56EF35Dec2277F03',
    tokenPerBlock: 'stargatePerBlock',
    hasMultiplier: false,
    pools: [],
    singlePools: [
      {
        name: 'stargate-fantom-usdc',
        poolId: 0,
        chainId: 250,
        address: '0x12edeA9cd262006cC3C4E77c90d2CD2DD4b1eb97',
        oracle: 'tokens',
        oracleId: 'USDC',
        decimals: '1e6',
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

module.exports = getStargateFantomApys;
