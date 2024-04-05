import BigNumber from 'bignumber.js';
import { LINEA_CHAIN_ID as chainId } from '../../../constants';
import getBlockTime from '../../../utils/getBlockTime';
import { fetchPrice } from '../../../utils/fetchPrice';
import VToken from '../../../abis/VToken';
import IMendiComptroller from '../../../abis/linea/IMendiComptroller';
import IMendiDistributor from '../../../abis/linea/IMendiDistributor';
import { fetchContract } from '../../rpc/client';
import getApyBreakdown from '../common/getApyBreakdown';
import jp from 'jsonpath';

const pools: MendiPool[] = require('../../../data/linea/mendiPools.json');
const params: MendiApyParams = {
  pools,
  comptroller: '0x1b4d3b0421dDc1eB216D230Bc01527422Fb93103',
  compOracleId: 'MENDI',
  compAddress: '0x43E8809ea748EFf3204ee01F08872F063e44065f',
  secondsPerBlock: 1,
};

const SECONDS_PER_YEAR = 31536000;

const getMendiApys = async () => {
  const poolsData = await getPoolsData(params);

  const { leveragedBaseAprs, leveragedRewardAprs, leveragedLsAprs } = await getPoolsApys(
    params,
    poolsData
  );

  return getApyBreakdown(
    params.pools.map(p => ({ ...p, address: p.name })),
    Object.fromEntries(params.pools.map((p, i) => [p.name, leveragedBaseAprs[i]])),
    leveragedRewardAprs,
    0,
    leveragedLsAprs
  );
};

const getPoolsApys = async (params: MendiApyParams, data: PoolsData) => {
  const compPrice = await fetchPrice({ oracle: 'tokens', id: params.compOracleId });
  const calculatedBlockTime = await getBlockTime(chainId);
  const secondsPerBlock = params.secondsPerBlock ?? calculatedBlockTime;
  const BLOCKS_PER_YEAR = SECONDS_PER_YEAR / secondsPerBlock;

  const supplyApys = data.supplyRates.map(v => v.times(BLOCKS_PER_YEAR).div('1e18'));
  const borrowApys = data.borrowRates.map(v => v.times(BLOCKS_PER_YEAR).div('1e18'));

  const annualCompSupplyInUsd = data.compSupplySpeeds.map(v =>
    v.times(BLOCKS_PER_YEAR).div('1e18').times(compPrice)
  );
  const annualCompBorrowInUsd = data.compBorrowSpeeds.map(v =>
    v.times(BLOCKS_PER_YEAR).div('1e18').times(compPrice)
  );

  const totalSuppliesInUsd = data.totalSupplies.map((v, i) =>
    v
      .times(data.exchangeRatesStored[i])
      .div('1e10')
      .div(params.pools[i].decimals)
      .div(data.cTokenDecimals[i])
      .times(data.tokenPrices[i])
  );
  const totalBorrowsInUsd = data.totalBorrows.map((v, i) =>
    v.toNumber() > 0 ? v.times(data.tokenPrices[i]).div(params.pools[i].decimals) : v.plus(1)
  );

  const supplyCompApys = annualCompSupplyInUsd.map((v, i) => v.div(totalSuppliesInUsd[i]));
  const borrowCompApys = annualCompBorrowInUsd.map((v, i) => v.div(totalBorrowsInUsd[i]));

  const supplyLeverageFactor = params.pools.map(
    v => (1 - (v.borrowRate / 100) ** v.borrowDepth) / (1 - v.borrowRate / 100)
  );
  const borrowLeverageFactor = params.pools.map(
    v => (v.borrowRate / 100 - (v.borrowRate / 100) ** v.borrowDepth) / (1 - v.borrowRate / 100)
  );

  const leveragedSupplyApys = supplyApys.map((v, i) => v.times(supplyLeverageFactor[i]));
  const leveragedBorrowApys = borrowApys.map((v, i) => v.times(borrowLeverageFactor[i]));
  const leveragedSupplyCompApys = supplyCompApys.map((v, i) => v.times(supplyLeverageFactor[i]));
  const leveragedBorrowCompApys = borrowCompApys.map((v, i) => v.times(borrowLeverageFactor[i]));
  const leveragedLsAprs = data.lsAprs;

  const leveragedBaseAprs = leveragedSupplyApys.map((v, i) => v.minus(leveragedBorrowApys[i]));
  const leveragedRewardAprs = leveragedSupplyCompApys.map((v, i) =>
    v.plus(leveragedBorrowCompApys[i])
  );

  return {
    leveragedBaseAprs,
    leveragedRewardAprs,
    leveragedLsAprs,
  };
};

const getPoolsData = async (params: MendiApyParams): Promise<PoolsData> => {
  const comptrollerContract = fetchContract(params.comptroller, IMendiComptroller, chainId);
  const distributor = (await comptrollerContract.read.rewardDistributor()).toString();
  const distributorContract = fetchContract(distributor, IMendiDistributor, chainId);

  const supplyRateCalls = [];
  const borrowRateCalls = [];
  const compSpeedCalls = [];
  const totalSupplyCalls = [];
  const totalBorrowsCalls = [];
  const exchangeRateStoredCalls = [];
  const cTokenDecimalsCalls = [];

  let pricePromises = params.pools.map(pool =>
    fetchPrice({ oracle: pool.oracle, id: pool.oracleId })
  );
  let lsAprCalls = params.pools.map(pool => getLiquidStakingApy(pool));

  params.pools.forEach(pool => {
    const cTokenContract = fetchContract(pool.cToken, VToken, chainId);
    supplyRateCalls.push(cTokenContract.read.supplyRatePerBlock());
    borrowRateCalls.push(cTokenContract.read.borrowRatePerBlock());
    compSpeedCalls.push(
      distributorContract.read.rewardMarketState([
        params.compAddress as `0x${string}`,
        pool.cToken as `0x${string}`,
      ])
    );
    totalSupplyCalls.push(cTokenContract.read.totalSupply());
    totalBorrowsCalls.push(cTokenContract.read.totalBorrows());
    exchangeRateStoredCalls.push(cTokenContract.read.exchangeRateStored());
    cTokenDecimalsCalls.push(cTokenContract.read.decimals());
  });
  const res = await Promise.all([
    Promise.all(supplyRateCalls),
    Promise.all(borrowRateCalls),
    Promise.all(compSpeedCalls),
    Promise.all(totalSupplyCalls),
    Promise.all(totalBorrowsCalls),
    Promise.all(exchangeRateStoredCalls),
    Promise.all(cTokenDecimalsCalls),
    Promise.all(pricePromises),
    Promise.all(lsAprCalls),
  ]);

  const supplyRates: BigNumber[] = res[0].map(v => new BigNumber(v.toString()));
  const borrowRates: BigNumber[] = res[1].map(v => new BigNumber(v.toString()));
  const compSupplySpeeds: BigNumber[] = res[2].map(v => new BigNumber(v['0'].toString()));
  const compBorrowSpeeds: BigNumber[] = res[2].map(v => new BigNumber(v['3'].toString()));
  const totalSupplies: BigNumber[] = res[3].map(v => new BigNumber(v.toString()));
  const totalBorrows: BigNumber[] = res[4].map(v => new BigNumber(v.toString()));
  const exchangeRatesStored: BigNumber[] = res[5].map(v => new BigNumber(v.toString()));
  const cTokenDecimals: BigNumber[] = res[6].map(v =>
    new BigNumber(10).exponentiatedBy(v.toString())
  );
  const tokenPrices = res[7];
  const lsAprs = res[8];

  return {
    tokenPrices,
    supplyRates,
    borrowRates,
    compSupplySpeeds,
    compBorrowSpeeds,
    lsAprs,
    totalSupplies,
    totalBorrows,
    exchangeRatesStored,
    cTokenDecimals,
  };
};

const getLiquidStakingApy = async (pool: MendiPool) => {
  let liquidStakingApr: number = 0;

  if (pool.lsUrl) {
    //Normalize ls Data to always handle arrays
    //Coinbase's returned APR is already in %, we need to normalize it by multiplying by 100
    let lsAprFactor: number = 1;
    if (pool.lsAprFactor) lsAprFactor = pool.lsAprFactor!;

    let lsApr: number = 0;
    try {
      const url = pool.lsUrl!;
      const lsResponse: any = await fetch(url).then(res => res.json());

      lsApr = jp.query(lsResponse, pool.dataPath!)[0];
      lsApr = (lsApr * lsAprFactor) / 100;
      liquidStakingApr = lsApr;
    } catch {
      console.error(`Failed to fetch ${pool.name} liquid staking APR from ${pool.lsUrl}`);
    }
  }
  return liquidStakingApr;
};

export interface PoolsData {
  tokenPrices: number[];
  supplyRates: BigNumber[];
  borrowRates: BigNumber[];
  compSupplySpeeds: BigNumber[];
  compBorrowSpeeds: BigNumber[];
  lsAprs: number[];
  totalSupplies: BigNumber[];
  totalBorrows: BigNumber[];
  exchangeRatesStored: BigNumber[];
  cTokenDecimals: BigNumber[];
}

export interface MendiPool {
  name: string;
  cToken: string;
  oracle: string;
  oracleId: string;
  decimals: string;
  lsUrl?: string;
  lsAprFactor?: number;
  dataPath?: string;
  borrowRate?: number;
  borrowDepth?: number;
}

export interface MendiApyParams {
  comptroller: string;
  compOracleId: string;
  compAddress: string;
  pools: MendiPool[];
  secondsPerBlock?: number;
}

module.exports = getMendiApys;
