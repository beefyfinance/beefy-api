import { getMerklAprs } from '../common/getMerklAprs';
import { getApyBreakdown } from '../common/getApyBreakdown';
import { ChainId } from '../../../../packages/address-book/src/types/chainid';

const BigNumber = require('bignumber.js');
const retroPools = require('../../../data/matic/retroGammaPools.json');
const quickPools = require('../../../data/matic/quickGammaLpPools.json');

const gammaApi = 'https://wire2.gamma.xyz/quickswap/polygon/hypervisors/allData';
const pools = [...retroPools, ...quickPools];

const getGammaApys = async () => {
  const merklAprs = await getMerklAprs(ChainId.polygon, pools);

  let tradingAprs = {};
  try {
    const response = await fetch(gammaApi).then(res => res.json());

    pools.forEach(p => {
      if (response[p.address.toLowerCase()]) {
        tradingAprs[p.address.toLowerCase()] = new BigNumber(
          response[p.address.toLowerCase()].returns.daily.feeApr
        );
      } else {
        tradingAprs[p.address.toLowerCase()] = new BigNumber(0);
      }
    });
  } catch (e) {
    console.log('Polygon Gamma Api Error', e);
  }

  return getApyBreakdown(pools, tradingAprs, merklAprs, 0);
};

module.exports = getGammaApys;
