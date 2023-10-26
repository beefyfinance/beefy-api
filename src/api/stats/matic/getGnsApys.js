const BigNumber = require('bignumber.js');

import getApyBreakdown from '../common/getApyBreakdown';

const pools = [{ name: 'gns-poly-gns', address: '0xE5417Af564e4bFDA1c483642db72007871397896' }];
const url = 'https://backend-polygon.gains.trade/apr';

const getGnsApys = async () => {
  let farmAprs = [];
  try {
    const response = await fetch(url).then(res => res.json());
    farmAprs[0] = new BigNumber(response.sssApr).dividedBy(100);
  } catch (e) {
    console.error('Gns apy error ', url);
  }

  return getApyBreakdown(pools, 0, farmAprs, 0);
};

module.exports = { getGnsApys };
