import BigNumber from 'bignumber.js';
import { LINEA_CHAIN_ID as chainId } from '../../../constants';
import getBlockTime from '../../../utils/getBlockTime';
import { fetchPrice, } from '../../../utils/fetchPrice';
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
  secondsPerBlock: 1
};

const SECONDS_PER_YEAR = 31536000;

const getMendiApys = async () => {
  const poolsData = await getPoolsData(params);

  const { supplyApys, supplyCompApys } = await getPoolsApys(
    params,
    poolsData
  );

  const liquidStakingApys = await getLiquidStakingApys(params.pools);

  return getApyBreakdown(
    params.pools.map(p => ({ ...p, address: p.name })),
    Object.fromEntries(params.pools.map((p, i) => [p.name, supplyApys[i]])),
    supplyCompApys,
    0,
    liquidStakingApys
  );
};

const getPoolsApys = async (params: MendiApyParams, data: PoolsData) => {
  const compPrice = await fetchPrice({ oracle: 'tokens', id: params.compOracleId });
  const calculatedBlockTime = await getBlockTime(chainId);
  const secondsPerBlock = params.secondsPerBlock ?? calculatedBlockTime;
  const BLOCKS_PER_YEAR = SECONDS_PER_YEAR / secondsPerBlock;

  const supplyApys = data.supplyRates.map(v => v.times(BLOCKS_PER_YEAR).div('1e18'));

  const annualCompSupplyInUsd = data.compSupplySpeeds.map(v =>
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

  const supplyCompApys = annualCompSupplyInUsd.map((v, i) => v.div(totalSuppliesInUsd[i]));

  return {
    supplyApys,
    supplyCompApys,
  };
};

const getPoolsData = async (params: MendiApyParams): Promise<PoolsData> => {
  const comptrollerContract = fetchContract(params.comptroller, IMendiComptroller, chainId);
  const distributor = (await comptrollerContract.read.rewardDistributor()).toString();
  const distributorContract = fetchContract(distributor, IMendiDistributor, chainId);

  const supplyRateCalls = [];
  const compSupplySpeedCalls = [];
  const totalSupplyCalls = [];
  const exchangeRateStoredCalls = [];
  const cTokenDecimalsCalls = [];

  let pricePromises = params.pools.map(pool =>
    fetchPrice({ oracle: pool.oracle, id: pool.oracleId })
  );

  params.pools.forEach(pool => {
    const cTokenContract = fetchContract(pool.cToken, VToken, chainId);
    supplyRateCalls.push(cTokenContract.read.supplyRatePerBlock());
    compSupplySpeedCalls.push(distributorContract.read.rewardMarketState(
      [params.compAddress as `0x${string}`, pool.cToken as `0x${string}`]
    ));
    totalSupplyCalls.push(cTokenContract.read.totalSupply());
    exchangeRateStoredCalls.push(cTokenContract.read.exchangeRateStored());
    cTokenDecimalsCalls.push(cTokenContract.read.decimals());
  });
  const res = await Promise.all([
    Promise.all(supplyRateCalls),
    Promise.all(compSupplySpeedCalls),
    Promise.all(totalSupplyCalls),
    Promise.all(exchangeRateStoredCalls),
    Promise.all(cTokenDecimalsCalls),
    Promise.all(pricePromises),
  ]);

  const supplyRates: BigNumber[] = res[0].map(v => new BigNumber(v.toString()));
  const compSupplySpeeds: BigNumber[] = res[1].map(v => new BigNumber(v['0'].toString()));
  const totalSupplies: BigNumber[] = res[2].map(v => new BigNumber(v.toString()));
  const exchangeRatesStored: BigNumber[] = res[3].map(v => new BigNumber(v.toString()));
  const cTokenDecimals: BigNumber[] = res[4].map(v =>
    new BigNumber(10).exponentiatedBy(v.toString())
  );
  const tokenPrices = res[5];

  return {
    tokenPrices,
    supplyRates,
    compSupplySpeeds,
    totalSupplies,
    exchangeRatesStored,
    cTokenDecimals,
  };
};

const getLiquidStakingApys = async (pools: MendiPool[]) => {
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
  compSupplySpeeds: BigNumber[];
  totalSupplies: BigNumber[];
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
}

export interface MendiApyParams {
  comptroller: string;
  compOracleId: string;
  compAddress: string;
  pools: MendiPool[];
  secondsPerBlock?: number;
}

module.exports = getMendiApys;
