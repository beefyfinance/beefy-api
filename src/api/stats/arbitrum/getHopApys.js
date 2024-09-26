import { getHopCommonApys } from '../common/hop/getHopCommonApys';
import { addressBook } from '../../../../packages/address-book/src/address-book';
import { getEDecimals } from '../../../utils/getEDecimals';

import hopPools from '../../../data/arbitrum/hopPools.json';
import rplPools from '../../../data/arbitrum/hopRplPools.json';
import { hopArbClient } from '../../../apollo/client';
import { HOP_LPF } from '../../../constants';
import { ARBITRUM_CHAIN_ID as chainId } from '../../../constants';
const {
  arbitrum: {
    tokens: { HOP, RPL },
  },
} = addressBook;

export const getHopApys = async () => {
  const apysHop = await getHopCommonApys({
    pools: hopPools,
    oracleId: 'HOP',
    oracle: 'tokens',
    tokenAddress: HOP.address,
    decimals: getEDecimals(HOP.decimals),
    chainId,
    isRewardInXToken: false,
    client: hopArbClient,
    liquidityProviderFee: HOP_LPF,
    // log: true,
  });

  const apysRpl = await getHopCommonApys({
    pools: rplPools,
    oracleId: 'RPL',
    oracle: 'tokens',
    tokenAddress: RPL.address,
    decimals: getEDecimals(RPL.decimals),
    chainId,
    isRewardInXToken: false,
    client: hopArbClient,
    liquidityProviderFee: HOP_LPF,
    // log: true,
  });

  const apys = { ...apysHop.apys, ...apysRpl.apys };
  const apyBreakdowns = {
    ...apysHop.apyBreakdowns,
    ...apysRpl.apyBreakdowns,
  };

  return { apys: apys, apyBreakdowns: apyBreakdowns };
};

module.exports = { getHopApys };
