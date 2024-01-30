const BigNumber = require('bignumber.js');
const { POLYGON_CHAIN_ID: chainId } = require('../../../constants');
const retroPools = require('../../../data/matic/retroGammaPools.json');
const quickPools = require('../../../data/matic/quickGammaLpPools.json');
import { getApyBreakdown } from '../common/getApyBreakdown';

const pools = [...retroPools, ...quickPools];

const merklApi = 'https://api.angle.money/v1/merkl?chainId=137';
const gammaApi = 'https://wire2.gamma.xyz/quickswap/polygon/hypervisors/allData';

const getGammaApys = async () => {
  let poolAprs = {};
  try {
    poolAprs = await fetch(merklApi).then(res => res.json());
  } catch (e) {
    console.error(`Failed to fetch Merkl APRs: ${chainId}`);
  }

  let aprs = [];
  for (let i = 0; i < pools.length; ++i) {
    let apr = BigNumber(0);
    let merklPools = poolAprs[chainId].pools;
    if (Object.keys(merklPools).length !== 0) {
      for (const [key, value] of Object.entries(merklPools)) {
        if (key.toLowerCase() === pools[i].pool.toLowerCase()) {
          for (const [k, v] of Object.entries(value.alm)) {
            if (k.toLowerCase() === pools[i].address.toLowerCase()) {
              apr = BigNumber(v.almAPR).dividedBy(100);
            }
          }
        }
      }
    }

    aprs.push(apr);
  }

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

  return await getApyBreakdown(pools, tradingAprs, aprs, 0);
};

module.exports = getGammaApys;
