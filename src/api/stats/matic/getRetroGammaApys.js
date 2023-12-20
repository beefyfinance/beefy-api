const BigNumber = require('bignumber.js');
const { POLYGON_CHAIN_ID: chainId } = require('../../../constants');
const pools = require('../../../data/matic/retroGammaPools.json');
import { getApyBreakdown } from '../common/getApyBreakdown';

const merklApi = 'https://api.angle.money/v1/merkl?chainId=137';

const getRetroGammaApys = async () => {
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

  return await getApyBreakdown(pools, BigNumber(0), aprs, 0);
};

module.exports = getRetroGammaApys;
