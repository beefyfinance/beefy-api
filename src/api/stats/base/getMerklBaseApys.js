import { getMerklAprs } from '../common/getMerklAprs';
import { getApyBreakdown } from '../common/getApyBreakdown';
import { ChainId } from '../../../../packages/address-book/src/types/chainid';

const BigNumber = require('bignumber.js');
const sushiPools = require('../../../data/base/sushiGammaPools.json');

const gammaApi = 'https://wire2.gamma.xyz/sushi/base/hypervisors/allData';

const pools = [...sushiPools];
const getBaseMerklGammaApys = async () => {
  const merklAprs = await getMerklAprs(ChainId.base, pools);

  let tradingAprs = {};
  try {
    const response = await fetch(gammaApi).then(res => res.json());

    pools.forEach(p => {
      tradingAprs[p.address.toLowerCase()] = new BigNumber(
        response[p.address.toLowerCase()].returns.daily.feeApr
      );
    });
  } catch (e) {
    console.log('Gamma Base Api Error', e);
  }

  return await getApyBreakdown(pools, tradingAprs, merklAprs, 0);
};

module.exports = getBaseMerklGammaApys;
