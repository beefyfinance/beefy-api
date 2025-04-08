import BigNumber from 'bignumber.js';
import { addressBookByChainId, ChainId } from '../../../packages/address-book/src/address-book';
import { getKey, setKey } from '../../utils/cache';
import { ApiChains } from '../../utils/chain';
import { fetchContract } from '../rpc/client';
import FeeABI from '../../abis/FeeABI';
import { HarvestableVault } from './types';
import { getHarvestableVaultsByChain } from '../stats/getMultichainVaults';
import { isDefined } from '../../utils/array';
import { Address, BaseError } from 'viem';

const feeBatchTreasurySplitMethodABI = [
  {
    inputs: [],
    name: 'treasuryFee',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const INIT_DELAY = Number(process.env.FEES_INIT_DELAY || 15000);
const REFRESH_INTERVAL = 5 * 60 * 1000;
const CACHE_EXPIRY = 1000 * 60 * 60 * 12;
const VAULT_FEES_KEY = 'VAULT_FEES';
const FEE_BATCH_KEY = 'FEE_BATCHES';

interface PerformanceFee {
  total: number;
  call: number;
  strategist: number;
  treasury: number;
  stakers: number;
  liquidity?: number;
}

interface VaultFeeBreakdown {
  performance: PerformanceFee;
  withdraw: number;
  deposit?: number;
  lastUpdated: number;
}

interface FeeBatchDetail {
  address: string;
  treasurySplit: number;
  stakerSplit: number;
}

interface PerformanceFeeCallResponse {
  total: BigNumber;
  beefy: BigNumber;
  strategist: BigNumber;
  call: BigNumber;
}

interface AllFeesCallResponse {
  performance: PerformanceFeeCallResponse;
  withdraw: BigNumber;
  deposit: BigNumber;
}

type StrategyCallResponse = {
  id: string;
  strategy: Address;
} & CallResponseMap;

let feeBatches: Partial<Record<ChainId, FeeBatchDetail>> = {};
let vaultFees: Record<string, VaultFeeBreakdown> = {};

const updateFeeBatch = async () => {
  const chainId = ChainId.ethereum;
  const { beefyFeeRecipient: feeBatchAddress } = addressBookByChainId[chainId].platforms.beefyfinance;
  const feeBatchContract = fetchContract(feeBatchAddress, feeBatchTreasurySplitMethodABI, Number(chainId));

  let treasurySplit;

  try {
    treasurySplit = Number((await feeBatchContract.read.treasuryFee()).toString());
  } catch (err) {
    console.log(` > Error updating feeBatch on chain ${chainId}:${feeBatchAddress}`);
    console.log(err.message);
    treasurySplit = 640;
  }

  feeBatches[chainId] = {
    address: feeBatchAddress,
    treasurySplit: treasurySplit / 1000,
    stakerSplit: 1 - treasurySplit / 1000,
  };

  await setKey(FEE_BATCH_KEY, feeBatches);
  console.log(`> feeBatches updated`);
};

const updateVaultFees = async () => {
  console.log(`> updating vault fees`);
  const start = Date.now();

  const expiredBefore = start - CACHE_EXPIRY;
  const promises = ApiChains.map(chain => {
    const chainVaults = getHarvestableVaultsByChain(chain).filter(
      v => (vaultFees[v.id]?.lastUpdated || 0) < expiredBefore
    );
    if (chainVaults.length > 0) {
      // Use ethereum feeBatch for all chains (only place where revenue is split)
      return getChainFees(chainVaults, ChainId[chain], feeBatches[ChainId.ethereum]);
    }
  }).filter(isDefined);

  await Promise.allSettled(promises);
  await saveToRedis();

  console.log(`> updated vault fees (${(Date.now() - start) / 1000}s)`);
  setTimeout(updateVaultFees, REFRESH_INTERVAL);
};

const saveToRedis = async () => {
  await setKey(VAULT_FEES_KEY, vaultFees);
};

async function undefinedIfReverts<T extends Promise<unknown>>(promise: T): Promise<Awaited<T> | undefined> {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof BaseError && error.shortMessage.includes('reverted')) {
      return undefined;
    }
    throw error;
  }
}

type FeeAbiContract = ReturnType<typeof fetchContract<typeof FeeABI>>;
type FeeAbiContractMethods = keyof FeeAbiContract['read'];
type FeeAbiContractMethodsOfType<T> = {
  [K in FeeAbiContractMethods]: FeeAbiContract['read'][K] extends (...args: any[]) => Promise<T> ? K : never;
}[FeeAbiContractMethods];

function makeBigIntToNumberHandler(methodName: FeeAbiContractMethodsOfType<bigint>) {
  return async (contract: FeeAbiContract) => {
    const value = await contract.read[methodName]();
    return new BigNumber(value.toString(10)).toNumber();
  };
}

const callHandlers = {
  strategist: makeBigIntToNumberHandler('strategistFee'),
  strategist2: makeBigIntToNumberHandler('STRATEGIST_FEE'),
  call: makeBigIntToNumberHandler('callFee'),
  call2: makeBigIntToNumberHandler('CALL_FEE'),
  call3: makeBigIntToNumberHandler('callfee'),
  call4: makeBigIntToNumberHandler('callFeeAmount'),
  maxCallFee: makeBigIntToNumberHandler('MAX_CALL_FEE'),
  beefy: makeBigIntToNumberHandler('beefyFee'),
  fee: makeBigIntToNumberHandler('fee'),
  treasury: makeBigIntToNumberHandler('TREASURY_FEE'),
  rewards: makeBigIntToNumberHandler('REWARDS_FEE'),
  rewards2: makeBigIntToNumberHandler('rewardsFee'),
  maxFee: makeBigIntToNumberHandler('MAX_FEE'),
  maxFee2: makeBigIntToNumberHandler('max'),
  maxFee3: makeBigIntToNumberHandler('maxfee'),
  withdraw: makeBigIntToNumberHandler('withdrawalFee'),
  withdraw2: makeBigIntToNumberHandler('WITHDRAWAL_FEE'),
  withdrawMax: makeBigIntToNumberHandler('WITHDRAWAL_MAX'),
  withdrawMax2: makeBigIntToNumberHandler('withdrawalMax'),
  liquidityFee: async (contract: FeeAbiContract) =>
    new BigNumber((await contract.read.liquidityFee()).toString(10)),
  breakdown: async (contract: FeeAbiContract) => {
    const value = await contract.read.getFees();
    return {
      total: new BigNumber(value.total.toString()),
      beefy: new BigNumber(value.beefy.toString()),
      call: new BigNumber(value.call.toString()),
      strategist: new BigNumber(value.strategist.toString()),
    } satisfies PerformanceFeeCallResponse;
  },
  allFees: async (contract: FeeAbiContract) => {
    const value = await contract.read.getAllFees();
    return {
      performance: {
        total: new BigNumber(value.beefy.total.toString()),
        beefy: new BigNumber(value.beefy.beefy.toString()),
        call: new BigNumber(value.beefy.call.toString()),
        strategist: new BigNumber(value.beefy.strategist.toString()),
      },
      deposit: new BigNumber(value.deposit.toString()),
      withdraw: new BigNumber(value.withdraw.toString()),
    } satisfies AllFeesCallResponse;
  },
  paused: async (contract: FeeAbiContract) => await contract.read.paused(),
} as const;

type CallResponseMap = {
  [T in keyof typeof callHandlers]?: Awaited<ReturnType<(typeof callHandlers)[T]>>;
};

// I'm so sorry for whoever comes across this file, it was a nightmare to get working, blame the strategists, ily
const getChainFees = async (vaults: HarvestableVault[], chainId: number, feeBatch: FeeBatchDetail) => {
  try {
    const calls = vaults.map(async vault => {
      const contract = fetchContract(vault.strategy, FeeABI, chainId);
      const results = Object.fromEntries(
        (
          await Promise.all(
            Object.entries(callHandlers).map(async ([key, handler]) => [
              key,
              await undefinedIfReverts(handler(contract)),
            ])
          )
        ).filter((_, value) => value !== undefined)
      ) as CallResponseMap;
      return {
        id: vault.id,
        strategy: vault.strategy as Address,
        ...results,
      } satisfies StrategyCallResponse;
    });
    const results = await Promise.allSettled(calls);
    const failed = results.filter(res => res.status === 'rejected');

    results.forEach((res, index) => {
      if (res.status === 'fulfilled') {
        const callResponse: StrategyCallResponse = res.value;
        const fees = mapStrategyCallsToFeeBreakdown(callResponse, feeBatch);
        if (fees) {
          vaultFees[vaults[index].id] = fees;
        } else {
          console.warn(`> Failed to get fees for ` + vaults[index].id);
        }
      }
    });

    if (failed.length > 0) {
      console.log(`> feeUpdate failed on chain ${chainId} for ${failed.length} vaults}`);
    }
  } catch (err) {
    console.log('> feeUpdate error on chain ' + chainId);
    console.error(err);
  }
};

const mapStrategyCallsToFeeBreakdown = (
  contractCalls: StrategyCallResponse,
  feeBatch: FeeBatchDetail
): VaultFeeBreakdown => {
  let withdrawFee = withdrawalFeeFromCalls(contractCalls);

  let performanceFee = performanceFeesFromCalls(contractCalls, feeBatch);

  let depositFee = depositFeeFromCalls(contractCalls);

  if (withdrawFee === undefined) {
    console.log(`Failed to find withdrawFee for ${contractCalls.id}`);
    return undefined;
  } else if (performanceFee === undefined) {
    console.log(`Failed to find performanceFee for ${contractCalls.id}`);
    return undefined;
  }

  return {
    performance: performanceFee,
    withdraw: withdrawFee,
    ...(depositFee != null ? { deposit: depositFee } : {}),
    lastUpdated: Date.now(),
  };
};

const depositFeeFromCalls = (contractCalls: StrategyCallResponse): number => {
  if (contractCalls.allFees) {
    return contractCalls.allFees.deposit.toNumber() / 10000;
  }
  return null; // null and not 0 so that we can avoid adding this into the response for old strategies (fees hardcoded in vault files)
};

const withdrawalFeeFromCalls = (contractCalls: StrategyCallResponse): number => {
  if (contractCalls.allFees) {
    return contractCalls.allFees.withdraw.toNumber() / 10000;
  } else if (
    (contractCalls.withdraw === undefined && contractCalls.withdraw2 === undefined) ||
    (contractCalls.withdrawMax === undefined && contractCalls.withdrawMax2 === undefined) ||
    contractCalls.paused
  ) {
    return 0;
  } else {
    let withdrawFee = contractCalls.withdraw ?? contractCalls.withdraw2;
    let maxWithdrawFee = contractCalls.withdrawMax ?? contractCalls.withdrawMax2;
    return withdrawFee / maxWithdrawFee;
  }
};

const performanceFeesFromCalls = (
  contractCalls: StrategyCallResponse,
  feeBatch: FeeBatchDetail
): PerformanceFee => {
  if (contractCalls.liquidityFee && contractCalls.allFees) {
    // beSonic as additional liquidity fee
    return performanceFromGetFeesWithLiquidity(
      contractCalls.allFees.performance,
      feeBatch,
      contractCalls.liquidityFee
    );
  } else if (contractCalls.allFees !== undefined) {
    return performanceFromGetFees(contractCalls.allFees.performance, feeBatch);
  } else if (contractCalls.breakdown !== undefined) {
    return performanceFromGetFees(contractCalls.breakdown, feeBatch);
  } else if (contractCalls.id.includes('-maxi')) {
    return performanceForMaxi(contractCalls);
  } else {
    return legacyFeeMappings(contractCalls, feeBatch);
  }
};

const legacyFeeMappings = (contractCalls: StrategyCallResponse, feeBatch: FeeBatchDetail): PerformanceFee => {
  let total = 0.045;
  let performanceFee: PerformanceFee;

  let callFee = contractCalls.call ?? contractCalls.call2 ?? contractCalls.call3 ?? contractCalls.call4;
  let strategistFee = contractCalls.strategist ?? contractCalls.strategist2;
  let maxFee = contractCalls.maxFee ?? contractCalls.maxFee2 ?? contractCalls.maxFee3;
  let beefyFee = contractCalls.beefy;
  let fee = contractCalls.fee;
  let treasury = contractCalls.treasury;
  let rewards = contractCalls.rewards ?? contractCalls.rewards2;

  if (callFee + strategistFee + beefyFee === maxFee) {
    performanceFee = {
      total,
      call: (total * callFee) / maxFee,
      strategist: (total * strategistFee) / maxFee,
      treasury: (total * feeBatch.treasurySplit * beefyFee) / maxFee,
      stakers: (total * feeBatch.stakerSplit * beefyFee) / maxFee,
    };
  } else if (callFee + strategistFee + rewards + treasury === maxFee) {
    performanceFee = {
      total,
      call: (total * callFee) / maxFee,
      strategist: (total * strategistFee) / maxFee,
      treasury: (total * treasury) / maxFee,
      stakers: (total * rewards) / maxFee,
    };
  } else if (fee + callFee === maxFee) {
    total = 0.05;
    performanceFee = {
      total: total,
      call: (total * callFee) / maxFee,
      strategist: 0,
      treasury: 0,
      stakers: (total * fee) / maxFee,
    };
  } else if (!isNaN(strategistFee + callFee + beefyFee)) {
    performanceFee = {
      total,
      call: (total * callFee) / maxFee,
      strategist: (total * strategistFee) / maxFee,
      treasury: (total * feeBatch.treasurySplit * beefyFee) / maxFee,
      stakers: (total * feeBatch.stakerSplit * beefyFee) / maxFee,
    };
  } else if (!isNaN(strategistFee + callFee + treasury)) {
    performanceFee = {
      total,
      call: (total * callFee) / maxFee,
      strategist: (total * strategistFee) / maxFee,
      treasury: (total * treasury) / maxFee,
      stakers: 0,
    };
  } else if (callFee + treasury + rewards === maxFee) {
    performanceFee = {
      total,
      call: (total * callFee) / maxFee,
      strategist: 0,
      treasury: (total * treasury) / maxFee,
      stakers: (total * rewards) / maxFee,
    };
  } else if (callFee + beefyFee === maxFee) {
    if (contractCalls.id === 'cake-cakev2-eol') total = 0.01;
    performanceFee = {
      total,
      call: (total * callFee) / maxFee,
      strategist: 0,
      treasury: (total * feeBatch.treasurySplit * beefyFee) / maxFee,
      stakers: (total * feeBatch.stakerSplit * beefyFee) / maxFee,
    };
  } else if (callFee + fee === maxFee) {
    performanceFee = {
      total,
      call: (total * callFee) / maxFee,
      strategist: 0,
      treasury: 0,
      stakers: (total * fee) / maxFee,
    };
  } else {
    console.log(`> Performance fee fetch failed for: ${contractCalls.id} - ${contractCalls.strategy}`);
  }

  return performanceFee;
};

const performanceFromGetFees = (
  fees: PerformanceFeeCallResponse,
  feeBatch: FeeBatchDetail
): PerformanceFee => {
  let total = fees.total.div(1e9).toNumber() / 1e9;
  let beefy = fees.beefy.div(1e9).toNumber() / 1e9;
  let call = fees.call.div(1e9).toNumber() / 1e9;
  let strategist = fees.strategist.div(1e9).toNumber() / 1e9;

  const feeSum = beefy + call + strategist;
  const beefySplit = (total * beefy) / feeSum;

  return {
    total: total,
    call: (total * call) / feeSum,
    strategist: (total * strategist) / feeSum,
    treasury: feeBatch.treasurySplit * beefySplit,
    stakers: feeBatch.stakerSplit * beefySplit,
  };
};

const performanceFromGetFeesWithLiquidity = (
  fees: PerformanceFeeCallResponse,
  feeBatch: FeeBatchDetail,
  liquidityFee: BigNumber
): PerformanceFee => {
  const base = performanceFromGetFees(fees, feeBatch);
  const liquidity = liquidityFee.shiftedBy(-18).toNumber();

  return {
    ...base,
    total: base.total + liquidity,
    liquidity,
  };
};

const performanceForMaxi = (contractCalls: StrategyCallResponse): PerformanceFee => {
  let performanceFee: PerformanceFee;

  let callFee = contractCalls.call ?? contractCalls.call2 ?? contractCalls.call3 ?? contractCalls.call4;
  let maxCallFee = contractCalls.maxCallFee ?? 1000;
  let maxFee = contractCalls.maxFee ?? contractCalls.maxFee2 ?? contractCalls.maxFee3;
  let rewards = contractCalls.rewards ?? contractCalls.rewards2;

  let strategyAddress = contractCalls.strategy.toLowerCase();

  // Specific contracts with distinct method for charging fees
  if (
    [
      '0x436D5127F16fAC1F021733dda090b5E6DE30b3bB'.toLowerCase(),
      '0xa9E6E271b27b20F65394914f8784B3B860dBd259'.toLowerCase(),
    ].includes(strategyAddress)
  ) {
    performanceFee = {
      total: callFee / 1000,
      strategist: 0,
      call: callFee / 1000,
      treasury: 0,
      stakers: 0,
    };

    //Another bunch of legacy contracts
  } else if (
    [
      '0x24AAaB9DA14308bAf9d670e2a37369FE8Cb5Fe36',
      '0x22b3d90BDdC3Ad5F2948bE3914255C64Ebc8c9b3',
      '0xbCF1e02ac0c45729dC85F290C4A6AB35c4801cB1',
      '0xb25eB9105549627050AAB3A1c909fBD454014beA',
    ]
      .map(address => address.toLowerCase())
      .includes(strategyAddress)
  ) {
    performanceFee = {
      total: ((45 / 1000) * callFee) / maxFee,
      strategist: 0,
      call: ((45 / 1000) * callFee) / maxFee,
      treasury: 0,
      stakers: 0,
    };
  } else if ('0xca077eEC87e2621F5B09AFE47C42BAF88c6Af18c'.toLowerCase() === strategyAddress) {
    //avax maxi
    performanceFee = {
      total: 5 / 1000,
      strategist: 0,
      call: 5 / 1000,
      treasury: 0,
      stakers: 0,
    };
  } else if ('0x87056F5E8Dce0fD71605E6E291C6a3B53cbc3818'.toLowerCase() === strategyAddress) {
    //old bifi maxi
    performanceFee = {
      total: (callFee + rewards) / maxFee,
      strategist: 0,
      call: callFee / maxFee,
      treasury: 0,
      stakers: rewards / maxFee,
    };
  } else {
    performanceFee = {
      total: callFee / maxCallFee,
      strategist: 0,
      call: callFee / maxCallFee,
      treasury: 0,
      stakers: 0,
    };
  }
  return performanceFee;
};

export const initVaultFeeService = async () => {
  const cachedVaultFees = await getKey<Record<string, VaultFeeBreakdown>>(VAULT_FEES_KEY);
  // const cachedFeeBatches = await getKey<Record<ChainId, FeeBatchDetail>>(FEE_BATCH_KEY);

  // feeBatches = cachedFeeBatches ?? {};
  feeBatches = {};
  vaultFees = cachedVaultFees ?? {};

  setTimeout(async () => {
    await updateFeeBatch();
    updateVaultFees();
  }, INIT_DELAY);
};

export const getVaultFees = () => {
  return vaultFees;
};

export const getTotalPerformanceFeeForVault = (vaultId: string) => {
  if (!vaultFees[vaultId]) {
    // console.log(`[FEES]> Missing fees for vault ${vaultId}`);
    return 0.095;
  }
  return vaultFees[vaultId].performance.total;
};
