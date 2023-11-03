import { getRewardPoolApys } from '../common/getRewardPoolApys';

const { BSC_CHAIN_ID: chainId } = require('../../../constants');
const pools = require('../../../data/bsc/pancakeIchiPools.json');

export const getPancakeIchiApys = async () => {
  // Todo: Get trading APRs
  /* const tradingAprs = await fetch("https://vault-api.pancake.run/api/v1/56/vault/feeAvg").then(res => res);
  console.log(tradingAprs);
*/
  return getRewardPoolApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'Cake',
    oracle: 'tokens',
    decimals: '1e18',
    cake: true,
    // log: true,
  });
};
