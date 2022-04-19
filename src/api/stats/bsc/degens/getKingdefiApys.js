const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');

import getApyBreakdown from '../../common/getApyBreakdown';
import { getTradingFeeApr } from '../../../../utils/getTradingFeeApr';
import { PCS_LPF } from '../../../../constants';
import { getContractWithProvider } from '../../../../utils/contractHelper';

const MasterChef = require('../../../../abis/degens/KingDefiMaster.json');
const fetchPrice = require('../../../../utils/fetchPrice');
const pools = require('../../../../data/degens/kingdefiLpPools.json');
const { cakeClient } = require('../../../../apollo/client');

const masterchef = '0x49A44ea2B4126CC1C53C47Ed7f9a5905Cbecae8d';
const oracleId = 'KRW';
const oracle = 'tokens';
const DECIMALS = '1e18';

const getKingdefiApys = async () => {
  const allPools = [...pools];
  allPools.push({
    name: 'kingdefi-krown',
    address: '0x1446f3CEdf4d86a9399E49f7937766E6De2A3AAB',
    poolId: 1,
    oracle: 'tokens',
    oracleId: 'KRW',
  });

  const pairAddresses = pools.map(pool => pool.address.toLowerCase());
  const tradingAprs = await getTradingFeeApr(cakeClient, pairAddresses, PCS_LPF);
  let promises = [];
  allPools.forEach(pool => promises.push(getPoolApy(masterchef, pool)));
  const farmApys = await Promise.all(promises);

  return getApyBreakdown(allPools, tradingAprs, farmApys, PCS_LPF);
};

const getPoolApy = async (masterchef, pool) => {
  const masterchefContract = getContractWithProvider(MasterChef, masterchef, web3);
  let { totalSupply, krwPerBlock } = await masterchefContract.methods.poolInfo(pool.poolId).call();
  totalSupply = new BigNumber(totalSupply);
  krwPerBlock = new BigNumber(krwPerBlock);

  const lpPrice = await fetchPrice({
    oracle: pool.oracle ?? 'lps',
    id: pool.oracleId ?? pool.name,
  });
  const totalStakedInUsd = totalSupply.times(lpPrice).dividedBy(pool.decimals ?? '1e18');

  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = krwPerBlock.dividedBy(secondsPerBlock).times(secondsPerYear);
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  // console.log(pool.name, simpleApy.valueOf(), totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
  return simpleApy;
};

module.exports = getKingdefiApys;
