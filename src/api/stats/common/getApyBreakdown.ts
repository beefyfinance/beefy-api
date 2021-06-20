import BigNumber from "bignumber.js";

import getFarmWithTradingFeesApy from '../../../utils/getFarmWithTradingFeesApy';
import { compound } from '../../../utils/compound';

import { BASE_HPY } from '../../../constants';

const beefyPerformanceFee = 0.045;
const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;

interface ApyBreakdown {
    vaultApr:number,
    compoundingsPerYear:number,
    beefyPerformanceFee:number,
    vaultApy:number,
    lpFee:number,
    tradingApr:number,
    totalApy:number,
}

export default function(pools:{name:string,address:string}[], tradingAprs:BigNumber[], farmAprs:BigNumber[], providerFee:number) {
  const result:{
        apys:Record<string,number>,
        apyBreakdowns:Record<string,ApyBreakdown>
    } = {
        apys:{},
        apyBreakdowns:{}
    };

  pools.forEach((pool, i) => {
    const simpleApr = farmAprs[i];
    const vaultApr = simpleApr?.times(shareAfterBeefyPerformanceFee);
    const vaultApy = compound(simpleApr, BASE_HPY, 1, shareAfterBeefyPerformanceFee);
    const tradingApr = tradingAprs[pool.address.toLowerCase()];
    const totalApy = getFarmWithTradingFeesApy(simpleApr, tradingApr, BASE_HPY, 1, 0.955);

    // Add token to APYs object
    result.apys[pool.name] = totalApy;
    result.apyBreakdowns[pool.name] = {
        vaultApr: vaultApr?.toNumber(),
        compoundingsPerYear: BASE_HPY,
        beefyPerformanceFee: beefyPerformanceFee,
        vaultApy: vaultApy,
        lpFee: providerFee,
        tradingApr: tradingApr?.toNumber(),
        totalApy: totalApy,
    };
  });

  return result;
};
