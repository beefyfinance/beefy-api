import BigNumber, { BigNumber as BigNumberStatic } from 'bignumber.js';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { MultiCall } from 'eth-multicall';
import { multicallAddress } from '../../../utils/web3';
import { ChainId } from '../../../../packages/address-book/address-book';
import { getTotalPerformanceFeeForVault } from '../../vaults/getVaultFees';
import getBlockTime from '../../../utils/getBlockTime';
import fetchPrice from '../../../utils/fetchPrice';
import { compound } from '../../../utils/compound';
import { getContract } from '../../../utils/contractHelper';
import { BASE_HPY } from '../../../constants';

const IToken = require('../../../abis/VToken.json');
const IComptroller: AbiItem[] = require('../../../abis/IComptroller.json');

const SECONDS_PER_YEAR = 31536000;

const getCompoundV2ApyData = async (params: CompoundV2ApyParams) => {
  const poolsData = await getPoolsData(params);

  const { supplyApys, borrowApys, supplyCompApys, borrowCompApys } = await getPoolsApys(
    params,
    poolsData
  );

  const apys = {};
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

    apys[pool.name] = apy;
  });

  return apys;
};

const getPoolsApys = async (params: CompoundV2ApyParams, data: PoolsData) => {
  const compDecimals = params.compDecimals ?? '1e18';
  const compOracle = params.compOracle ?? 'tokens';
  const compPrice = await fetchPrice({ oracle: compOracle, id: params.compOracleId });
  const [calculatedBlockTime] = await Promise.all([getBlockTime(params.chainId)]);
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
) => {
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
  const apy = leveragedSupplyBase.minus(leveragedBorrowBase).plus(compoundedComp).toNumber();

  return apy;
};

const getPoolsData = async (params: CompoundV2ApyParams): Promise<PoolsData> => {
  const comptrollerAbi = params.comptrollerAbi ?? IComptroller;
  const cTokenAbi = params.cTokenAbi ?? IToken;

  const comptrollerContract = getContract(comptrollerAbi, params.comptroller);
  const multicall = new MultiCall(params.web3 as any, multicallAddress(params.chainId));

  const supplyRateCalls = [];
  const borrowRateCalls = [];
  const compSupplySpeedCalls = [];
  const compBorrowSpeedCalls = [];
  const totalSupplyCalls = [];
  const totalBorrowsCalls = [];
  const exchangeRateStoredCalls = [];
  const cTokenDecimalsCalls = [];

  let promises = [];
  params.pools.forEach(pool =>
    promises.push(fetchPrice({ oracle: pool.oracle, id: pool.oracleId }))
  );
  const tokenPrices: BigNumber[] = await Promise.all(promises);

  params.pools.forEach(pool => {
    const cTokenContract = getContract(cTokenAbi, pool.cToken);
    supplyRateCalls.push({ supplyRate: cTokenContract.methods.supplyRatePerBlock() });
    borrowRateCalls.push({ borrowRate: cTokenContract.methods.borrowRatePerBlock() });
    compSupplySpeedCalls.push({
      compSupplySpeed: comptrollerContract.methods.compSupplySpeeds(pool.cToken),
    });
    compBorrowSpeedCalls.push({
      compBorrowSpeed: comptrollerContract.methods.compBorrowSpeeds(pool.cToken),
    });
    totalSupplyCalls.push({ totalSupply: cTokenContract.methods.totalSupply() });
    totalBorrowsCalls.push({ totalBorrows: cTokenContract.methods.totalBorrows() });
    exchangeRateStoredCalls.push({
      exchangeRateStored: cTokenContract.methods.exchangeRateStored(),
    });
    cTokenDecimalsCalls.push({ decimals: cTokenContract.methods.decimals() });
  });

  const res = await multicall.all([
    supplyRateCalls,
    borrowRateCalls,
    compSupplySpeedCalls,
    compBorrowSpeedCalls,
    totalSupplyCalls,
    totalBorrowsCalls,
    exchangeRateStoredCalls,
    cTokenDecimalsCalls,
  ]);

  const supplyRates: BigNumber[] = res[0].map(v => new BigNumber(v.supplyRate));
  const borrowRates: BigNumber[] = res[1].map(v => new BigNumber(v.borrowRate));
  const compSupplySpeeds: BigNumber[] = res[2].map(v => new BigNumber(v.compSupplySpeed));
  const compBorrowSpeeds: BigNumber[] = res[3].map(v => new BigNumber(v.compBorrowSpeed));
  const totalSupplies: BigNumber[] = res[4].map(v => new BigNumber(v.totalSupply));
  const totalBorrows: BigNumber[] = res[5].map(v => new BigNumber(v.totalBorrows));
  const exchangeRatesStored: BigNumber[] = res[6].map(v => new BigNumber(v.exchangeRateStored));
  const cTokenDecimals: BigNumber[] = res[7].map(v =>
    new BigNumber(10).exponentiatedBy(v.decimals)
  );

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

export interface PoolsData {
  tokenPrices: BigNumber[];
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
}

export interface CompoundV2ApyParams {
  web3: Web3;
  chainId: ChainId;
  comptroller: string;
  comptrollerAbi?: AbiItem[];
  compOracle?: string;
  compOracleId: string;
  compDecimals?: string;
  cTokenAbi?: AbiItem[];
  pools: CompoundV2Pool[];
  secondsPerBlock?: number;
  liquidityProviderFee?: number;
  log?: boolean;
}

export default getCompoundV2ApyData;
