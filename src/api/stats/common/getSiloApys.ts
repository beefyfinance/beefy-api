import BigNumber from 'bignumber.js';
import { ChainId } from '../../../../packages/address-book/address-book';
import { fetchPrice } from '../../../utils/fetchPrice';
import SiloTokenAbi from '../../../abis/arbitrum/SiloToken';
import SiloIncentivesController from '../../../abis/arbitrum/SiloIncentivesController';
import SiloLens from '../../../abis/arbitrum/SiloLens';
import { fetchContract } from '../../rpc/client';
import getApyBreakdown from './getApyBreakdown';
import { fetchDaiSavingsRate } from '../../../utils/fetchDaiSavingsRate';
import jp from 'jsonpath';

const SECONDS_PER_YEAR = 31536000;

const getSiloApyData = async (params: SiloApyParams) => {
  const poolsData = await getPoolsData(params);

  const { supplyApys, supplySiloApys } = await getPoolsApys(params, poolsData);
  const liquidStakingApys = await getLiquidStakingApys(params.pools);

  if (params.log) {
    params.pools.forEach((pool, i) =>
      console.log(pool.name, supplyApys[i].valueOf(), supplySiloApys[i].valueOf())
    );
  }

  return getApyBreakdown(
    params.pools.map(p => ({ ...p, address: p.name })),
    Object.fromEntries(params.pools.map((p, i) => [p.name, supplyApys[i]])),
    supplySiloApys,
    0,
    liquidStakingApys,
    [],
    'supplyApr'
  );
};

const getPoolsApys = async (params: SiloApyParams, data: PoolsData) => {
  //const compDecimals = params.compDecimals ?? '1e18';
  const oracle = params.rewardOracle ?? 'tokens';
  const price = await fetchPrice({ oracle: oracle, id: params.rewardOracleId });

  const supplyApys = data.supplyRates.map(v => v.div('1e18'));

  const annualRewardsInUsd = data.rewardSpeeds.map(v =>
    v.times(SECONDS_PER_YEAR).div(params.rewardDecimals).times(price)
  );

  const totalSuppliesInUsd = data.totalSupplies.map((v, i) =>
    v.div(params.pools[i].decimals).times(data.tokenPrices[i])
  );

  const supplySiloApys = annualRewardsInUsd.map((v, i) => v.div(totalSuppliesInUsd[i]));

  return {
    supplyApys,
    supplySiloApys,
  };
};

const getLiquidStakingApys = async (pools: SiloPool[]) => {
  let liquidStakingAprs: number[] = [];

  for (let i = 0; i < pools.length; i++) {
    if (pools[i].lsUrl) {
      //Normalize ls Data to always handle arrays
      //Coinbase's returned APR is already in %, we need to normalize it by multiplying by 100
      let lsAprFactor: number = 1;
      if (pools[i].lsAprFactor) lsAprFactor = pools[i].lsAprFactor!;

      let lsApr: number = 0;
      try {
        const url = pools[i].lsUrl!;
        const lsResponse: any = await fetch(url).then(res => res.json());

        lsApr = jp.query(lsResponse, pools[i].dataPath!)[0];
        lsApr = (lsApr * lsAprFactor) / 100;
        liquidStakingAprs.push(lsApr);
      } catch {
        console.error(`Failed to fetch ${pools[i].name} liquid staking APR from ${pools[i].lsUrl}`);
      }
    } else {
      liquidStakingAprs.push(0);
    }
  }
  return liquidStakingAprs;
};

const getPoolsData = async (params: SiloApyParams): Promise<PoolsData> => {
  const siloTokenAbi = SiloTokenAbi;

  const supplyRateCalls = [];
  const rewardsPerSecondCalls = [];
  const totalSupplyCalls = [];

  let pricePromises = params.pools.map(pool => fetchPrice({ oracle: 'lps', id: pool.name }));

  for (let i = 0; i < params.pools.length; i++) {
    const pool = params.pools[i];
    const siloTokenContract = fetchContract(pool.address, siloTokenAbi, params.chainId);
    const incentivesControllerContract = fetchContract(
      params.incentivesController,
      SiloIncentivesController,
      params.chainId
    );
    const lensContract = fetchContract(params.lens, SiloLens, params.chainId);
    supplyRateCalls.push(lensContract.read.depositAPY([pool.silo, pool.underlying]));
    rewardsPerSecondCalls.push(incentivesControllerContract.read.getAssetData([pool.address]));
    totalSupplyCalls.push(siloTokenContract.read.totalSupply());
  }

  const res = await Promise.all([
    Promise.all(supplyRateCalls),
    Promise.all(rewardsPerSecondCalls),
    Promise.all(totalSupplyCalls),
    Promise.all(pricePromises),
  ]);

  const supplyRates: BigNumber[] = res[0].map(v => new BigNumber(v.toString()));
  const rewardSpeeds: BigNumber[] = res[1].map(v => new BigNumber(v['1'].toString()));
  const totalSupplies: BigNumber[] = res[2].map(v => new BigNumber(v.toString()));

  const tokenPrices = res[3];

  return {
    tokenPrices,
    supplyRates,
    rewardSpeeds,
    totalSupplies,
  };
};

export interface PoolsData {
  tokenPrices: number[];
  supplyRates: BigNumber[];
  rewardSpeeds: BigNumber[];
  totalSupplies: BigNumber[];
}

export interface SiloPool {
  name: string;
  address: `0x${string}`;
  silo: `0x${string}`;
  underlying: `0x${string}`;
  oracle: string;
  oracleId: string;
  decimals: string;
  lsUrl?: string;
  lsAprFactor?: number;
  dataPath?: string;
}

export interface SiloApyParams {
  chainId: ChainId;
  rewardOracle?: string;
  rewardOracleId: string;
  rewardDecimals?: string;
  pools: SiloPool[];
  incentivesController: string;
  lens: string;
  log?: boolean;
}

export default getSiloApyData;
