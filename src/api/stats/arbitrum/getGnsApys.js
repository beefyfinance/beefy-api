const BigNumber = require('bignumber.js');

import getApyBreakdown from '../common/getApyBreakdown';

const pools = [{ name: 'gns-arb-gns', address: '0x18c11FD286C5EC11c3b683Caa813B77f5163A122' }];
const url = 'https://backend-arbitrum.gains.trade/apr';

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
