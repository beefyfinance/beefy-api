import { getApyBreakdown } from '../common/getApyBreakdown';
import { ChainId } from '../../../../packages/address-book/src/types/chainid';
import { getMerklAprs } from '../common/getMerklAprs';

const BigNumber = require('bignumber.js');
const uniPools = require('../../../data/arbitrum/uniswapGammaPools.json');
const sushiPools = require('../../../data/arbitrum/sushiGammaPools.json');

const gammaApi = 'https://wire2.gamma.xyz/arbitrum/hypervisors/allData';
const sushiGammaApi = 'https://wire2.gamma.xyz/sushi/arbitrum/hypervisors/allData';

const pools = [...uniPools, ...sushiPools];
const getMerklGammaApys = async () => {
  const merklAprs = await getMerklAprs(ChainId.arbitrum, pools);

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

  return await getApyBreakdown(pools, tradingAprs, merklAprs, 0);
};

module.exports = getMerklGammaApys;
