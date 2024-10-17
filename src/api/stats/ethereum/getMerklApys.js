import { getMerklAprs } from '../common/getMerklAprs';
import { getApyBreakdown } from '../common/getApyBreakdown';
import { ChainId } from '../../../../packages/address-book/src/types/chainid';

const BigNumber = require('bignumber.js');
const uniPools = require('../../../data/ethereum/rangeLpPools.json');

const rangeApi =
  'https://rangeprotocol-public.s3.ap-southeast-1.amazonaws.com/data/fees-ethereum-uniswap.json';
const rangePancakeApi =
  'https://rangeprotocol-public.s3.ap-southeast-1.amazonaws.com/data/fees-ethereum-pancakeswap.json';

const pools = [...uniPools];
const getMerklApys = async () => {
  const merklAprs = await getMerklAprs(ChainId.ethereum, pools);

  let tradingAprs = {};
  try {
    const response = await fetch(rangeApi).then(res => res.json());
    const pancakeReponse = await fetch(rangePancakeApi).then(res => res.json());

    // Combine the two responses
    Object.assign(response, pancakeReponse);

    pools.forEach(p => {
      tradingAprs[p.address.toLowerCase()] = new BigNumber(response[p.address].apy / 100);
    });
  } catch (e) {
    console.log('Range Api Error', e);
  }

  return await getApyBreakdown(pools, tradingAprs, merklAprs, 0);
};

module.exports = getMerklApys;
