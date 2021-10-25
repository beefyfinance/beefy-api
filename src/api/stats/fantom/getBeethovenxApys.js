import { BEET_LPF } from '../../../constants';

const { getMasterChefApys } = require('../common/getMasterChefApys');
const MasterChefAbi = require('../../../abis/fantom/BeethovenxChef.json');
const { fantomWeb3 } = require('../../../utils/web3');
const pools = require('../../../data/fantom/beethovenxPools.json');
import { beetClient } from '../../../apollo/client';

const getBeethovenxApys = async () =>
  await getMasterChefApys({
    web3: fantomWeb3,
    chainId: 250,
    masterchef: '0x8166994d9ebBe5829EC86Bd81258149B87faCfd3',
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'beetsPerBlock',
    hasMultiplier: false,
    allocPointIndex: '0',
    pools: pools,
    oracleId: 'BEETS',
    oracle: 'tokens',
    decimals: '1e18',
    tradingFeeInfoClient: beetClient,
    liquidityProviderFee: 0.0025,
    burn: 0.128,
    // log: true,
  });

module.exports = getBeethovenxApys;
