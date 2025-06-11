import BigNumber from 'bignumber.js';
import getApyBreakdown from './getApyBreakdown';
import jp from 'jsonpath';

const getSiloApyData = async (params: SiloApyParams) => {
  const poolsData = await getPoolsData(params);

  const { supplyAprs, supplyBaseAprs } = await getPoolsApys(params, poolsData);
  const liquidStakingApys = await getLiquidStakingApys(params.pools);

  if (params.log) {
    params.pools.forEach((pool, i) =>
      console.log(pool.name, supplyAprs[i].valueOf(), supplyBaseAprs[i].valueOf())
    );
  }

  return getApyBreakdown(
    params.pools.map(p => ({ ...p, address: p.name })),
    Object.fromEntries(params.pools.map((p, i) => [p.name, supplyBaseAprs[i]])),
    supplyAprs,
    0,
    liquidStakingApys
  );
};

const getPoolsApys = async (params: SiloApyParams, silos: SiloDataMap) => {
  const supplyAprs = params.pools.map(pool => silos[pool.address]?.supplyApr ?? new BigNumber(0));
  const supplyBaseAprs = params.pools.map(pool => silos[pool.address]?.supplyBaseApr ?? new BigNumber(0));

  return {
    supplyAprs,
    supplyBaseAprs,
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

const getPoolsData = async (params: SiloApyParams): Promise<SiloDataMap> => {
  const api = 'https://v2.silo.finance/api/earn';
  let json;

  try {
    const data = await fetch(api, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        search: null,
        chainKeys: [params.chainKey],
        type: null,
        sort: null,
        minTotalSupplyUsd: '0',
        limit: 100,
        offset: 0,
      }),
    });

    json = await data.json();
  } catch (e) {
    console.error(e);
  }

  const silos = json.pools.reduce((map, silo) => {
    const supplyApr = silo.programs.reduce((acc, program) => {
      const aprMultiplier = program.rewardTokenSymbol === 'xSILO' ? 0.5 : 1;
      return acc.plus(program.apr * aprMultiplier);
    }, new BigNumber(0));

    map[silo.vaultAddress ?? silo.siloId.slice(silo.siloId.indexOf('-') + 1)] = {
      supplyApr: supplyApr.div(1e18),
      supplyBaseApr: new BigNumber(silo.supplyBaseApr.toString()).div(1e18),
    };
    return map;
  }, {});

  return silos;
};

interface SiloDataMap {
  [key: string]: SiloData;
}

export interface SiloData {
  supplyApr: BigNumber;
  supplyBaseApr: BigNumber;
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
  lens: string;
  legacy?: boolean;
  collateral?: boolean;
  v2?: boolean;
  vault?: string;
}

export interface SiloApyParams {
  chainKey: string;
  pools: SiloPool[];
  log?: boolean;
}

export default getSiloApyData;
