import { addressBook } from '../../../../packages/address-book/address-book';
import { quickClient, sushiClient, apePolyClient } from '../../../apollo/client';
import { QUICK_LPF, SUSHI_LPF, APEPOLY_LPF } from '../../../constants';
import { getEDecimals } from '../../../utils/getEDecimals';
import { ApyBreakdownResult } from '../common/getApyBreakdown';
import { getMasterChefApys } from './getMaticMasterChefApys';
import { LpPool, SingleAssetPool } from '../../../types/LpPool';
import quickPools from '../../../data/matic/polyyeldQuickLpPools.json';
import sushiPools from '../../../data/matic/polyyeldSushiLpPools.json';
import apePools from '../../../data/matic/polyyeldApeLpPools.json';
import L2LpPools from '../../../data/matic/polyyeldL2LpPools.json';
import L2SingleAssetPools from '../../../data/matic/polyyeldL2SingleAssetPools.json';
import {
  PolyyeldMasterChef_ABI,
  PolyyeldMasterChefMethodNames,
  xYeldMasterChef_ABI,
  xYeldMasterChefMethodNames,
} from '../../../abis/matic/Polyyeld';

const {
  polygon: {
    platforms: { polyyeld, polyyeld_xyeld },
    tokens: { YELD, xYELD },
  },
} = addressBook;

export const getPolyyeldApys = async (): Promise<ApyBreakdownResult> => {
  // L1
  const yeldPerBlock: PolyyeldMasterChefMethodNames = 'YeldPerBlock';

  const quick = getMasterChefApys({
    masterchef: polyyeld.masterchef,
    masterchefAbi: PolyyeldMasterChef_ABI,
    tokenPerBlock: yeldPerBlock,
    hasMultiplier: false,
    pools: quickPools,
    oracle: 'tokens',
    oracleId: YELD.symbol,
    decimals: getEDecimals(YELD.decimals),
    tradingFeeInfoClient: quickClient,
    liquidityProviderFee: QUICK_LPF,
  });

  const sushi = getMasterChefApys({
    masterchef: polyyeld.masterchef,
    masterchefAbi: PolyyeldMasterChef_ABI,
    tokenPerBlock: yeldPerBlock,
    hasMultiplier: false,
    pools: sushiPools,
    oracle: 'tokens',
    oracleId: YELD.symbol,
    decimals: getEDecimals(YELD.decimals),
    tradingFeeInfoClient: sushiClient,
    liquidityProviderFee: SUSHI_LPF,
  });

  const ape = getMasterChefApys({
    masterchef: polyyeld.masterchef,
    masterchefAbi: PolyyeldMasterChef_ABI,
    tokenPerBlock: yeldPerBlock,
    hasMultiplier: false,
    pools: apePools,
    oracle: 'tokens',
    oracleId: YELD.symbol,
    decimals: getEDecimals(YELD.decimals),
    tradingFeeInfoClient: apePolyClient,
    liquidityProviderFee: APEPOLY_LPF,
  });

  const L1Promises = [quick, sushi, ape];

  // L2
  const xYeldPerBlock: xYeldMasterChefMethodNames = 'xYeldPerBlock';
  const singlexYeldPools: LpPool[] = L2LpPools;
  const lpxYeldPools: SingleAssetPool[] = L2SingleAssetPools;

  const L2 = getMasterChefApys({
    masterchef: polyyeld_xyeld.masterchef,
    masterchefAbi: xYeldMasterChef_ABI,
    tokenPerBlock: xYeldPerBlock,
    hasMultiplier: false,
    singlePools: singlexYeldPools,
    pools: lpxYeldPools,
    oracle: 'tokens',
    oracleId: xYELD.symbol,
    decimals: getEDecimals(xYELD.decimals),
    tradingFeeInfoClient: quickClient,
    liquidityProviderFee: QUICK_LPF,
    // log: true,
  });

  const L2Promises = [L2];

  let apys = {};
  let apyBreakdowns = {};

  let promises = [...L1Promises, ...L2Promises];
  const results = await Promise.allSettled(promises);

  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getPolyyeldApys L2 error', result.reason);
      continue;
    }

    // Set default APY values
    let mappedApyValues: ApyBreakdownResult | Record<string, number> = result.value;
    let mappedApyBreakdownValues = {};

    // Loop through key values and move default breakdown format
    // To require totalApy key
    for (const [key, value] of Object.entries(result.value)) {
      mappedApyBreakdownValues[key] = {
        totalApy: value,
      };
    }

    // Break out to apy and breakdowns if possible
    let hasApyBreakdowns = 'apyBreakdowns' in result.value;
    if (hasApyBreakdowns) {
      mappedApyValues = result.value.apys;
      mappedApyBreakdownValues = result.value.apyBreakdowns;
    }

    apys = { ...apys, ...mappedApyValues };

    apyBreakdowns = { ...apyBreakdowns, ...mappedApyBreakdownValues };
  }

  return {
    apys,
    apyBreakdowns,
  };
};
