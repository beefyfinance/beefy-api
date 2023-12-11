import BigNumber, { BigNumber as BigNumberStatic } from 'bignumber.js';
import { ChainId } from '../../../../packages/address-book/address-book';
import { getTotalPerformanceFeeForVault } from '../../vaults/getVaultFees';
import getBlockTime from '../../../utils/getBlockTime';
import { fetchPrice, Oracle, PriceOracle } from '../../../utils/fetchPrice';
import { compound } from '../../../utils/compound';
import { BASE_HPY } from '../../../constants';
import VToken from '../../../abis/VToken';
import IComptroller from '../../../abis/IComptroller';
import { Abi } from 'viem';
import { fetchContract } from '../../rpc/client';
import getApyBreakdown from './getApyBreakdown';
import jp from 'jsonpath';

const SECONDS_PER_YEAR = 31536000;

const getCompoundV2ApyData = async (params: CompoundV2ApyParams) => {
  const poolsData = await getPoolsData(params);

  const { supplyApys, borrowApys, supplyCompApys, borrowCompApys } = await getPoolsApys(
    params,
    poolsData
  );

  const liquidStakingApys = await getLiquidStakingApys(params.pools);

  const apys: BigNumber[] = [];
  params.pools.forEach((pool, i) => {
    const apy = getPoolLeveragedApy(
      pool,
      supplyApys[i],
      borrowApys[i],
      supplyCompApys[i],
      borrowCompApys[i]
    );

    if (params.log) {
      console.log(
        pool.name,
        apy,
        supplyApys[i].valueOf(),
        borrowApys[i].valueOf(),
        supplyCompApys[i].valueOf(),
        borrowCompApys[i].valueOf()
      );
    }

    apys.push(apy);
  });

  return getApyBreakdown(
    params.pools.map(p => ({ ...p, address: p.name })),
    Object.fromEntries(params.pools.map((p, i) => [p.name, supplyApys[i]])),
    supplyCompApys,
    0,
    liquidStakingApys
  );
};

const getPoolsApys = async (params: CompoundV2ApyParams, data: PoolsData) => {
  const compDecimals = params.compDecimals ?? '1e18';
  const compOracle = params.compOracle ?? 'tokens';
  const compPrice = await fetchPrice({ oracle: compOracle, id: params.compOracleId });
  const calculatedBlockTime = await getBlockTime(params.chainId);
  const secondsPerBlock = params.secondsPerBlock ?? calculatedBlockTime;
  const BLOCKS_PER_YEAR = SECONDS_PER_YEAR / secondsPerBlock;

  const supplyApys = data.supplyRates.map(v => v.times(BLOCKS_PER_YEAR).div('1e18'));
  const borrowApys = data.borrowRates.map(v => v.times(BLOCKS_PER_YEAR).div('1e18'));

  const annualCompSupplyInUsd = data.compSupplySpeeds.map(v =>
    v.times(BLOCKS_PER_YEAR).div(compDecimals).times(compPrice)
  );
  const annualCompBorrowInUsd = data.compBorrowSpeeds.map(v =>
    v.times(BLOCKS_PER_YEAR).div(compDecimals).times(compPrice)
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
    v.times(data.tokenPrices[i]).div(params.pools[i].decimals)
  );

  const supplyCompApys = annualCompSupplyInUsd.map((v, i) => v.div(totalSuppliesInUsd[i]));
  const borrowCompApys = annualCompBorrowInUsd.map((v, i) => v.div(totalBorrowsInUsd[i]));

  return {
    supplyApys,
    borrowApys,
    supplyCompApys,
    borrowCompApys,
  };
};

const getPoolLeveragedApy = (
  pool: CompoundV2Pool,
  supplyApy: BigNumberStatic,
  borrowApy: BigNumberStatic,
  supplyCompApy: BigNumberStatic,
  borrowCompApy: BigNumberStatic
): BigNumber => {
  const { leveragedSupplyBase, leveragedBorrowBase, leveragedSupplyComp, leveragedBorrowComp } =
    getLeveragedApys(
      supplyApy,
      borrowApy,
      supplyCompApy,
      borrowCompApy,
      pool.borrowDepth,
      pool.borrowRate
    );
  const totalComp = leveragedSupplyComp.plus(leveragedBorrowComp);
  const shareAfterBeefyPerformanceFee = 1 - getTotalPerformanceFeeForVault(pool.name);
  const compoundedComp = compound(totalComp, BASE_HPY, 1, shareAfterBeefyPerformanceFee);
  const apy = leveragedSupplyBase.minus(leveragedBorrowBase).plus(compoundedComp);

  return apy;
};

const getPoolsData = async (params: CompoundV2ApyParams): Promise<PoolsData> => {
  const comptrollerAbi = params.comptrollerAbi ?? IComptroller;
  const cTokenAbi = params.cTokenAbi ?? VToken;

  const comptrollerContract = fetchContract(params.comptroller, comptrollerAbi, params.chainId);

  const supplyRateCalls = [];
  const borrowRateCalls = [];
  const compSupplySpeedCalls = [];
  const compBorrowSpeedCalls = [];
  const totalSupplyCalls = [];
  const totalBorrowsCalls = [];
  const exchangeRateStoredCalls = [];
  const cTokenDecimalsCalls = [];

  let pricePromises = params.pools.map(pool =>
    fetchPrice({ oracle: pool.oracle, id: pool.oracleId })
  );

  params.pools.forEach(pool => {
    const cTokenContract = fetchContract(pool.cToken, cTokenAbi, params.chainId);
    supplyRateCalls.push(cTokenContract.read.supplyRatePerBlock());
    borrowRateCalls.push(cTokenContract.read.borrowRatePerBlock());
    compSupplySpeedCalls.push(comptrollerContract.read.compSupplySpeeds([pool.cToken]));
    compBorrowSpeedCalls.push(comptrollerContract.read.compBorrowSpeeds([pool.cToken]));
    totalSupplyCalls.push(cTokenContract.read.totalSupply());
    totalBorrowsCalls.push(cTokenContract.read.totalBorrows());
    exchangeRateStoredCalls.push(cTokenContract.read.exchangeRateStored());
    cTokenDecimalsCalls.push(cTokenContract.read.decimals());
  });
  const res = await Promise.all([
    Promise.all(supplyRateCalls),
    Promise.all(borrowRateCalls),
    Promise.all(compSupplySpeedCalls),
    Promise.all(compBorrowSpeedCalls),
    Promise.all(totalSupplyCalls),
    Promise.all(totalBorrowsCalls),
    Promise.all(exchangeRateStoredCalls),
    Promise.all(cTokenDecimalsCalls),
    Promise.all(pricePromises),
  ]);

  const supplyRates: BigNumber[] = res[0].map(v => new BigNumber(v.toString()));
  const borrowRates: BigNumber[] = res[1].map(v => new BigNumber(v.toString()));
  const compSupplySpeeds: BigNumber[] = res[2].map(v => new BigNumber(v.toString()));
  const compBorrowSpeeds: BigNumber[] = res[3].map(v => new BigNumber(v.toString()));
  const totalSupplies: BigNumber[] = res[4].map(v => new BigNumber(v.toString()));
  const totalBorrows: BigNumber[] = res[5].map(v => new BigNumber(v.toString()));
  const exchangeRatesStored: BigNumber[] = res[6].map(v => new BigNumber(v.toString()));
  const cTokenDecimals: BigNumber[] = res[7].map(v =>
    new BigNumber(10).exponentiatedBy(v.toString())
  );
  const tokenPrices = res[8];

  return {
    tokenPrices,
    supplyRates,
    borrowRates,
    compSupplySpeeds,
    compBorrowSpeeds,
    totalSupplies,
    totalBorrows,
    exchangeRatesStored,
    cTokenDecimals,
  };
};

const getLeveragedApys = (
  supplyBase: BigNumberStatic,
  borrowBase: BigNumberStatic,
  supplyNative: BigNumberStatic,
  borrowNative: BigNumberStatic,
  depth: number,
  borrowPercent: number
) => {
  let bigBorrowPercent = new BigNumber(borrowPercent);
  let leveragedSupplyBase = new BigNumber(0);
  let leveragedBorrowBase = new BigNumber(0);
  let leveragedSupplyComp = new BigNumber(0);
  let leveragedBorrowComp = new BigNumber(0);

  for (let i = 0; i < depth; i++) {
    leveragedSupplyBase = leveragedSupplyBase.plus(
      supplyBase.times(bigBorrowPercent.exponentiatedBy(i))
    );
    leveragedSupplyComp = leveragedSupplyComp.plus(
      supplyNative.times(bigBorrowPercent.exponentiatedBy(i))
    );

    leveragedBorrowBase = leveragedBorrowBase.plus(
      borrowBase.times(bigBorrowPercent.exponentiatedBy(i + 1))
    );
    leveragedBorrowComp = leveragedBorrowComp.plus(
      borrowNative.times(bigBorrowPercent.exponentiatedBy(i + 1))
    );
  }

  return {
    leveragedSupplyBase,
    leveragedBorrowBase,
    leveragedSupplyComp,
    leveragedBorrowComp,
  };
};

const getLiquidStakingApys = async (pools: CompoundV2Pool[]) => {
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

export interface PoolsData {
  tokenPrices: number[];
  supplyRates: BigNumber[];
  borrowRates: BigNumber[];
  compSupplySpeeds: BigNumber[];
  compBorrowSpeeds: BigNumber[];
  totalSupplies: BigNumber[];
  totalBorrows: BigNumber[];
  exchangeRatesStored: BigNumber[];
  cTokenDecimals: BigNumber[];
}

export interface CompoundV2Pool {
  name: string;
  cToken: string;
  oracle: string;
  oracleId: string;
  decimals: string;
  borrowDepth: number;
  borrowRate: number;
  platform?: string;
  depositFee?: number;
  beefyFee?: number;
  lsUrl?: string;
  lsAprFactor?: number;
  dataPath?: string;
}

export interface CompoundV2ApyParams {
  chainId: ChainId;
  comptroller: string;
  comptrollerAbi?: Abi;
  compOracle?: string;
  compOracleId: string;
  compDecimals?: string;
  cTokenAbi?: Abi;
  pools: CompoundV2Pool[];
  secondsPerBlock?: number;
  liquidityProviderFee?: number;
  log?: boolean;
}

export default getCompoundV2ApyData;
