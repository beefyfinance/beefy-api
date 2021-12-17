const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');

const { getTradingFeeApr } = require('../../../../utils/getTradingFeeApr');
const { cakeClient } = require('../../../../apollo/client');
const { PCS_LPF } = require('../../../../constants');
const pools = require('../../../../data/degens/chargeLpPools.json');
const { getApyBreakdown } = require('../../common/getApyBreakdown');

const getChargeApys = async () => {
  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(pool)));
  const farmApys = await Promise.all(promises);

  const pairAddresses = pools.map(pool => pool.address.toLowerCase());
  const tradingAprs = await getTradingFeeApr(cakeClient, pairAddresses, PCS_LPF);

  return getApyBreakdown(pools, tradingAprs, farmApys, PCS_LPF);
};

const getPoolApy = async pool => {
  const masterchefContract = new web3.eth.Contract(abi, pool.pool);
  return new BigNumber(await masterchefContract.methods.APR(0).call()).div('1e18');
};

const abi = [
  {
    inputs: [{ internalType: 'uint256', name: '_pid', type: 'uint256' }],
    name: 'APR',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

module.exports = getChargeApys;
