const BigNumber = require('bignumber.js');
const uniPools = require('../../../data/ethereum/rangeLpPools.json');
import { getApyBreakdown } from '../common/getApyBreakdown';

const merklApi = 'https://api.angle.money/v1/merkl?chainId=1';
const rangeApi =
  'https://rangeprotocol-public.s3.ap-southeast-1.amazonaws.com/data/fees-ethereum-uniswap.json';
const rangePancakeApi =
  'https://rangeprotocol-public.s3.ap-southeast-1.amazonaws.com/data/fees-ethereum-pancakeswap.json';

const pools = [...uniPools];
const getMerklApys = async () => {
  let poolAprs = {};
  try {
    poolAprs = await fetch(merklApi).then(res => res.json());
  } catch (e) {
    console.error(`Failed to fetch Merkl APRs`);
  }

  let aprs = [];
  for (let i = 0; i < pools.length; ++i) {
    let apr = BigNumber(0);
    if (Object.keys(poolAprs).length !== 0) {
      for (const [key, value] of Object.entries(poolAprs.pools)) {
        if (key.toLowerCase() === pools[i].pool.toLowerCase()) {
          apr = BigNumber(0);
          let str = 'Range ';
          str = str.concat(`${pools[i].address.toLowerCase()}`);
          apr = BigNumber(value.aprs[str]).dividedBy(100);
        }
      }
    }

    aprs.push(apr);
  }

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

  return await getApyBreakdown(pools, tradingAprs, aprs, 0);
};

module.exports = getMerklApys;
