import BigNumber, { BigNumber as BigNumberStatic } from 'bignumber.js';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { ChainId } from '../../../../packages/address-book/address-book';
import { getTotalPerformanceFeeForVault } from '../../vaults/getVaultFees';
import getBlockTime from '../../../utils/getBlockTime';
import fetchPrice from '../../../utils/fetchPrice';
import { compound } from '../../../utils/compound';
import { getContractWithProvider } from '../../../utils/contractHelper';
import { BASE_HPY } from '../../../constants';

const IToken = require('../../../abis/VToken.json');
const IComptroller: AbiItem[] = require('../../../abis/IComptroller.json');

const SECONDS_PER_YEAR = 31536000;

const getCompoundV2ApyData = async (params: CompoundV2ApysParams) => {
  params.compOracle = params.compOracle || 'tokens';
  params.compDecimals = params.compDecimals || '1e18';
  params.comptrollerAbi = params.comptrollerAbi || IComptroller;
  params.cTokenAbi = params.cTokenAbi || IToken;

  const [calculatedBlockTime] = await Promise.all([getBlockTime(params.chainId)]);
  params.secondsPerBlock = params.secondsPerBlock || calculatedBlockTime;

  let apys = {};

  let promises = [];
  params.pools.forEach(pool => promises.push(getPoolApy(params, pool)));
  const values = await Promise.all(promises);

  for (let item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async (params: CompoundV2ApysParams, pool: CompoundV2Pool) => {
  const [{ supplyBase, supplyComp }, { borrowBase, borrowComp }] = await Promise.all([
    getSupplyApys(params, pool),
    getBorrowApys(params, pool),
  ]);

  const { leveragedSupplyBase, leveragedBorrowBase, leveragedSupplyComp, leveragedBorrowComp } =
    getLeveragedApys(
      supplyBase,
      borrowBase,
      supplyComp,
      borrowComp,
      pool.borrowDepth,
      pool.borrowRate
    );

  let totalComp = leveragedSupplyComp.plus(leveragedBorrowComp);
  let shareAfterBeefyPerformanceFee = 1 - getTotalPerformanceFeeForVault(pool.name);
  let compoundedComp = compound(totalComp, BASE_HPY, 1, shareAfterBeefyPerformanceFee);
  let apy = leveragedSupplyBase.minus(leveragedBorrowBase).plus(compoundedComp).toNumber();

  if (params.log) {
    console.log(
      pool.name,
      apy,
      supplyBase.valueOf(),
      borrowBase.valueOf(),
      supplyComp.valueOf(),
      borrowComp.valueOf()
    );
  }

  return { [pool.name]: apy };
};

const getSupplyApys = async (params: CompoundV2ApysParams, pool: CompoundV2Pool) => {
  const BLOCKS_PER_YEAR = SECONDS_PER_YEAR / params.secondsPerBlock;

  const cTokenContract = getContractWithProvider(params.cTokenAbi, pool.cToken, params.web3);
  const comptrollerContract = getContractWithProvider(
    params.comptrollerAbi,
    params.comptroller,
    params.web3
  );

  let [compPrice, tokenPrice, supplyRate, compRate, totalSupply, exchangeRateStored] =
    await Promise.all([
      fetchPrice({ oracle: params.compOracle, id: params.compOracleId }),
      fetchPrice({ oracle: pool.oracle, id: pool.oracleId }),
      cTokenContract.methods.supplyRatePerBlock().call(),
      comptrollerContract.methods.compSupplySpeeds(pool.cToken).call(),
      cTokenContract.methods.totalSupply().call(),
      cTokenContract.methods.exchangeRateStored().call(),
    ]);

  supplyRate = new BigNumber(supplyRate);
  compRate = new BigNumber(compRate);
  totalSupply = new BigNumber(totalSupply);
  exchangeRateStored = new BigNumber(exchangeRateStored);

  const supplyApy = supplyRate.times(BLOCKS_PER_YEAR).div('1e18');

  const compPerYear = compRate.times(BLOCKS_PER_YEAR);
  const compPerYearInUsd = compPerYear.div(params.compDecimals).times(compPrice);

  const totalSupplied = totalSupply.times(exchangeRateStored).div('1e18');
  const totalSuppliedInUsd = totalSupplied.div(pool.decimals).times(tokenPrice);

  return {
    supplyBase: supplyApy,
    supplyComp: compPerYearInUsd.div(totalSuppliedInUsd),
  };
};

const getBorrowApys = async (params: CompoundV2ApysParams, pool: CompoundV2Pool) => {
  const BLOCKS_PER_YEAR = SECONDS_PER_YEAR / params.secondsPerBlock;

  const cTokenContract = getContractWithProvider(params.cTokenAbi, pool.cToken, params.web3);
  const comptrollerContract = getContractWithProvider(
    params.comptrollerAbi,
    params.comptroller,
    params.web3
  );

  let [compPrice, tokenPrice, borrowRate, compRate, totalBorrows] = await Promise.all([
    fetchPrice({ oracle: params.compOracle, id: params.compOracleId }),
    fetchPrice({ oracle: pool.oracle, id: pool.oracleId }),
    cTokenContract.methods.borrowRatePerBlock().call(),
    comptrollerContract.methods.compBorrowSpeeds(pool.cToken).call(),
    cTokenContract.methods.totalBorrows().call(),
  ]);

  borrowRate = new BigNumber(borrowRate);
  compRate = new BigNumber(compRate);
  totalBorrows = new BigNumber(totalBorrows);

  const borrowApyPerYear = borrowRate.times(BLOCKS_PER_YEAR).div('1e18');

  const compPerYear = compRate.times(BLOCKS_PER_YEAR);
  const compPerYearInUsd = compPerYear.div(params.compDecimals).times(compPrice);

  const totalBorrowsInUsd = totalBorrows.div(pool.decimals).times(tokenPrice);

  return {
    borrowBase: borrowApyPerYear,
    borrowComp: compPerYearInUsd.div(totalBorrowsInUsd),
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

export interface CompoundV2ApysParams {
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
