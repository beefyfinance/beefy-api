import { BigNumber } from 'bignumber.js';
import jp from 'jsonpath';
import MoeChefAbi from '../../../abis/mantle/MoeChef.ts';
import { MANTLE_CHAIN_ID } from '../../../constants.ts';
import { fetchPrice } from '../../../utils/fetchPrice.ts';
import { getLoggerFor } from '../../../utils/logger/index.ts';
import { fetchContract } from '../../rpc/client.ts';
import { type ApyBreakdownResult, getApyBreakdown } from '../common/getApyBreakdown.ts';
import pools from '../../../data/mantle/moeLpPools.json' with { type: 'json' };

const secondsPerYear = 31536000;
const masterchef = '0xA756f7D419e1A5cbd656A438443011a7dE1955b5';
const oracle = 'tokens';
const oracleId = 'MOE';
const decimals = '1e18';
const liquidityProviderFee = 0.0025;
const treasuryShare = 0.368421052631578947;
const url = 'https://barn.merchantmoe.com/v1/pools/mantle';

const logger = getLoggerFor({ module: 'apy', platform: 'moe', chain: MANTLE_CHAIN_ID });

const getMoeApys = async (): Promise<ApyBreakdownResult> => {
  const [tradingAprs, farmApys] = await Promise.all([getTradingAprs(), getFarmApys()]);
  return getApyBreakdown(pools, tradingAprs, farmApys, liquidityProviderFee);
};

const getTradingAprs = async (): Promise<Record<string, BigNumber>> => {
  const pairAddressToAprMap: Record<string, BigNumber> = {};
  try {
    const response: any = await fetch(url).then(res => res.json());
    const pairAddresses = pools.map(pool => pool.address.toLowerCase());
    pairAddresses.forEach(pair => {
      const pairData = jp.query(response, '$..[?(@.pairAddress==' + pair + ')]')[0];
      if (pairData) {
        const tvl = new BigNumber(pairData.liquidityUsd ?? 0);
        const volume = new BigNumber(pairData.volumeUsd ?? 0);
        pairAddressToAprMap[pair] = volume.times(liquidityProviderFee).dividedBy(tvl);
      } else {
        pairAddressToAprMap[pair] = new BigNumber(0);
      }
    });
  } catch (e) {
    logger.warn({ url, err: e }, 'failed to fetch trading aprs');
  }
  return pairAddressToAprMap;
};

const getFarmApys = async (): Promise<BigNumber[]> => {
  const apys: BigNumber[] = [];

  const moePrice = await fetchPrice({ oracle: oracle, id: oracleId });
  const { moePerSecPerId, balances } = await getData();

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const oracle = /*pool.oracle ??*/ 'lps';
    const id = /*pool.oracleId ??*/ pool.name;
    const stakedPrice = await fetchPrice({ oracle, id });
    const totalStakedInUsd = balances[i].times(stakedPrice).dividedBy(pool.decimals ?? '1e18');

    const poolRewards = moePerSecPerId[i].times(1 - treasuryShare);
    const yearlyRewards = poolRewards.times(secondsPerYear);
    const yearlyRewardsInUsd = yearlyRewards.times(moePrice).dividedBy(decimals);

    const apy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    apys.push(apy);
    // console.log(pool.name, apy.valueOf(), yearlyRewardsInUsd.valueOf(), totalStakedInUsd.valueOf());
  }

  return apys;
};

const getData = async () => {
  const masterchefContract = fetchContract(masterchef, MoeChefAbi, MANTLE_CHAIN_ID);

  const moePerSecCalls = (pools as any[]).map(pool => {
    return masterchefContract.read.getMoePerSecondForPid([pool.poolId]);
  });
  const balanceCalls = (pools as any[]).map(pool => {
    return masterchefContract.read.getTotalDeposit([pool.poolId]);
  });

  const [moePerSecResults, balanceResults] = await Promise.all([
    Promise.all(moePerSecCalls),
    Promise.all(balanceCalls),
  ]);

  return {
    moePerSecPerId: moePerSecResults.map(v => new BigNumber(v.toString())),
    balances: balanceResults.map(v => new BigNumber(v.toString())),
  };
};

export default getMoeApys;
