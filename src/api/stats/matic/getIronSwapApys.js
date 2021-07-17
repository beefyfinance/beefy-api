const axios = require('axios');
const BigNumber = require('bignumber.js');
import { DFYN_LPF } from '../../../constants';

const { polygonWeb3: web3 } = require('../../../utils/web3');
const ERC20 = require('../../../abis/ERC20.json');
const MasterChefAbi = require('../../../abis/degens/IronChef.json');
const { getMasterChefApys } = require('./getMaticMasterChefApys');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/matic/ironSwapPools.json');
const lpPools = require('../../../data/matic/ironSwapLpPools.json');
import { dfynClient } from '../../../apollo/client';

const getIronSwapApys = async () => {
  const tradingAprs = await get3PoolBaseApy();
  return getMasterChefApys({
    masterchef: '0x1fD1259Fa8CdC60c6E8C86cfA592CA1b8403DFaD',
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'rewardPerSecond',
    secondsPerBlock: 1,
    allocPointIndex: '2',
    hasMultiplier: false,
    pools: [...pools, ...lpPools],
    oracle: 'tokens',
    oracleId: 'ICEiron',
    decimals: '1e18',
    tradingAprs: tradingAprs,
    tradingFeeInfoClient: dfynClient,
    liquidityProviderFee: DFYN_LPF,
    // log: true,
  });
};

const get3PoolBaseApy = async () => {
  let volume = new BigNumber(0);
  try {
    const to = Math.floor(Date.now() / 1000);
    const from = to - 86400;
    const url = `https://api-v2.iron.finance/swap/total-volume?chainId=137&from=${from}&to=${to}`;
    const response = await axios.get(url);
    volume = new BigNumber(response.data.value);
  } catch (err) {
    console.error(err);
  }

  const address = '0xb4d09ff3dA7f9e9A2BA029cb0A81A989fd7B8f17';
  const lpFee = 0.0001;
  const price = await fetchPrice({ oracle: 'lps', id: 'ironswap-3usd' });
  let totalSupply = await new web3.eth.Contract(ERC20, address).methods.totalSupply().call();
  totalSupply = new BigNumber(totalSupply);
  const tradingApr = volume.times(365).times(price).times(lpFee).dividedBy(totalSupply);
  return { [address.toLowerCase()]: tradingApr };
};

module.exports = getIronSwapApys;
