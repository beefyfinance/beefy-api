const BigNumber = require('bignumber.js');
const uniPools = require('../../../data/arbitrum/uniswapGammaPools.json');
const sushiPools = require('../../../data/arbitrum/sushiGammaPools.json');
const { ARBITRUM_CHAIN_ID: chainId } = require('../../../constants');
import { getApyBreakdown } from '../common/getApyBreakdown';

const merklApi = 'https://api.angle.money/v1/merkl?chainId=42161';
const gammaApi = 'https://wire2.gamma.xyz/arbitrum/hypervisors/allData';
const sushiGammaApi = 'https://wire2.gamma.xyz/sushi/arbitrum/hypervisors/allData';

const pools = [...uniPools, ...sushiPools];
const getMerklGammaApys = async () => {
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
    const sushiReponse = await fetch(sushiGammaApi).then(res => res.json());

    // Combine the two responses
    Object.assign(response, sushiReponse);

    pools.forEach(p => {
      tradingAprs[p.address.toLowerCase()] = new BigNumber(
        response[p.address.toLowerCase()].returns.daily.feeApr
      );
    });
  } catch (e) {
    console.log('Gamma Api Error', e);
  }

  return await getApyBreakdown(pools, tradingAprs, aprs, 0);
};

module.exports = getMerklGammaApys;
