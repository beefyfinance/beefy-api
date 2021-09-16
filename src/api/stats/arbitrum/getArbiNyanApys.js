const { arbitrumWeb3: web3 } = require('../../../utils/web3');
import { ARBITRUM_CHAIN_ID as chainId } from '../../../constants';
import { getRewardPoolApys } from '../common/getRewardPoolApys';

const pools = require('../../../data/arbitrum/arbiNyanLpPools.json');
const { SUSHI_LPF } = require('../../../constants');
import { sushiArbitrumClient } from '../../../apollo/client';

const getArbiNyanApys = async () =>
  await getRewardPoolApys({
    web3: web3,
    chainId: chainId,
    pools: pools,
    oracleId: 'NYAN',
    oracle: 'tokens',
    decimals: '1e18',
    tradingFeeInfoClient: sushiArbitrumClient,
    liquidityProviderFee: SUSHI_LPF,
    // log: true,
  });

module.exports = { getArbiNyanApys };
