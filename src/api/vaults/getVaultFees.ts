const { MultiCall } = require('eth-multicall');
import { performance } from 'perf_hooks';
import Web3 from 'web3';
import { addressBookByChainId, ChainId } from '../../../packages/address-book/address-book';
import { getContract, getContractWithProvider } from '../../utils/contractHelper';
import { getKey, setKey } from '../../utils/redisHelper';
import { sleep } from '../../utils/time';
import { multicallAddress, web3Factory } from '../../utils/web3';
const FeeABI = require('../../abis/FeeABI.json');
const { getMultichainVaults } = require('../stats/getMultichainVaults');
const BigNumber = require('bignumber.js');

const feeBatchTreasurySplitMethodABI = [
  {
    inputs: [],
    name: 'treasuryFee',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

const INIT_DELAY = 20000;
const REFRESH_INTERVAL = 20 * 60 * 1000;
const VAULT_FEES_KEY = 'VAULT_FEES';
const FEE_BATCH_KEY = 'FEE_BATCHES';

interface PerformanceFee {
  total: number;
  call: number;
  strategist: number;
  treasury: number;
  stakers: number;
}

interface VaultFeeBreakdown {
  performance: PerformanceFee;
  withdraw: number;
  lastUpdated: number;
}

interface FeeBatchDetail {
  address: string;
  treasurySplit: number;
  stakerSplit: number;
}

var feeBatches: Record<ChainId, FeeBatchDetail>;
var vaultFees: Record<string, VaultFeeBreakdown>;

const updateFeeBatches = async () => {
  for (const chainId of Object.keys(addressBookByChainId)) {
    const feeBatchAddress = addressBookByChainId[chainId].platforms.beefyfinance.beefyFeeRecipient;
    const web3 = web3Factory(Number(chainId));

    const feeBatchContract = getContractWithProvider(
      feeBatchTreasurySplitMethodABI,
      feeBatchAddress,
      web3
    );

    let treasurySplit;

    try {
      treasurySplit = await feeBatchContract.methods.treasuryFee().call();
    } catch (err) {
      //If reverted, method isn't available on contract so must be older split
      if (err.message.includes('revert') || err.message.includes('correct ABI')) {
        treasurySplit = 140;
      } else {
        console.log(' > Error updating feeBatch on chain ' + chainId);
        console.log(err.message);
      }
    }

    if (treasurySplit) {
      feeBatches[chainId] = {
        address: feeBatchAddress,
        treasurySplit: treasurySplit / 1000,
        stakerSplit: 1 - treasurySplit / 1000,
      };
    } else {
      console.log('Failed to update feeBatch on chain ' + chainId);
    }
  }

  setKey(FEE_BATCH_KEY, feeBatches);
  console.log(`> feeBatches updated`);
};

const updateVaultFees = async () => {
  console.log(`> updating vault fees`);
  let start = Date.now();
  let vaults = getMultichainVaults();

  let promises = [];

  for (const chain of Object.keys(addressBookByChainId).map(c => Number(c))) {
    const chainVaults = vaults
      .filter(vault => vault.chain === ChainId[chain])
      .filter(
        v => !vaultFees[v.id] || Date.now() - vaultFees[v.id].lastUpdated > 1000 * 60 * 60 * 12
      );
    promises.push(getChainFees(chainVaults, chain, feeBatches[chain]));
  }

  await Promise.allSettled(promises);
  await saveToRedis();

  console.log(`> updated vault fees (${(Date.now() - start) / 1000}s)`);

  setTimeout(updateVaultFees, REFRESH_INTERVAL);
};

const saveToRedis = async () => {
  await setKey(VAULT_FEES_KEY, vaultFees);
};

const getChainFees = async (vaults, chainId, feeBatch: FeeBatchDetail) => {
  try {
    const web3 = web3Factory(chainId);
    const multicall = new MultiCall(web3, multicallAddress(chainId));
    const feeCalls = [];

    vaults.forEach(vault => {
      const strategyContract = getContract(FeeABI, vault.strategy);

      // All past iterations of fee data naming in strategies
      feeCalls.push({
        id: vault.id,
        strategy: vault.strategy,
        strategist: strategyContract.methods.strategistFee(),
        strategist2: strategyContract.methods.STRATEGIST_FEE(),
        call: strategyContract.methods.callFee(),
        CALL: strategyContract.methods.CALL_FEE(),
        call3: strategyContract.methods.callfee(),
        call4: strategyContract.methods.callFeeAmount(),
        maxCallFee: strategyContract.methods.MAX_CALL_FEE(),
        beefy: strategyContract.methods.beefyFee(),
        fee: strategyContract.methods.fee(),
        treasury: strategyContract.methods.TREASURY_FEE(),
        rewards: strategyContract.methods.REWARDS_FEE(),
        rewards2: strategyContract.methods.rewardsFee(),
        breakdown: strategyContract.methods.getFees(),
        maxFee: strategyContract.methods.MAX_FEE(),
        maxFee2: strategyContract.methods.max(),
        maxFee3: strategyContract.methods.maxfee(),
        withdraw: strategyContract.methods.withdrawalFee(),
        withdraw2: strategyContract.methods.WITHDRAWAL_FEE(),
        withdrawMax: strategyContract.methods.WITHDRAWAL_MAX(),
        withdrawMax2: strategyContract.methods.withdrawalMax(),
        paused: strategyContract.methods.paused(),
      });
    });

    const res = await multicall.all([feeCalls]);
    const feeResults = res[0];
    for (const contractCalls of res[0]) {
      let fees = await mapStrategyCallsToFeeBreakdown(contractCalls, web3, feeBatch);
      if (fees) {
        vaultFees[contractCalls.id] = fees;
      } else {
        console.log(' > Failed to get fees for ' + contractCalls.id);
      }
    }
  } catch (err) {
    console.log(err.message);
  }
};

const withdrawalFeeFromCalls = methodCalls => {
  if (
    (methodCalls.withdraw === undefined && methodCalls.withdraw2 === undefined) ||
    (methodCalls.withdraMax === undefined && methodCalls.withdrawMax2 === undefined)
  ) {
    return 0;
  } else {
    let withdrawFee = parseFloat(methodCalls.withdraw ?? methodCalls.withdraw2);
    let maxWithdrawFee = parseFloat(methodCalls.withdraMax ?? methodCalls.withdrawMax2);
    return withdrawFee / maxWithdrawFee;
  }
};

const legacyFeeMappings = (methodCalls, feeBatch: FeeBatchDetail): PerformanceFee => {
  let total = 4.5;
  let performanceFee: PerformanceFee;

  let callFee = parseFloat(
    methodCalls.call ?? methodCalls.CALL ?? methodCalls.call3 ?? methodCalls.call4
  );
  let maxCallFee = parseFloat(methodCalls.maxCallFee ?? 1000);
  let strategistFee = parseFloat(methodCalls.strategist ?? methodCalls.strategist2);
  let maxFee = parseFloat(methodCalls.maxFee ?? methodCalls.maxFee2 ?? methodCalls.maxFee3);
  let beefyFee = parseFloat(methodCalls.beefy);
  let fee = parseFloat(methodCalls.fee);
  let treasury = parseFloat(methodCalls.treasury);
  let rewards = parseFloat(methodCalls.rewards ?? methodCalls.rewards2);

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
    total = 5;
    performanceFee = {
      total: total,
      call: (total * callFee) / maxFee,
      strategist: 0,
      treasury: 0,
      stakers: (total * rewards) / maxFee,
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
    if (methodCalls.id === 'cake-cakev2-eol') total = 1;
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
    console.log(`> Performance fee fetch failed for: ${methodCalls.id} - ${methodCalls.strategy}`);
  }

  return performanceFee;
};

const performanceFromGetFees = async (
  contractCalls,
  web3: Web3,
  feeBatch: FeeBatchDetail
): Promise<PerformanceFee> => {
  await sleep(1000);
  const strategyContract = getContractWithProvider(FeeABI, contractCalls.strategy, web3);
  const fees = await strategyContract.methods.getFees().call();

  let total = new BigNumber(fees.total).div(1e9).toNumber() / 1e9;
  let beefy = new BigNumber(fees.beefy).div(1e9).toNumber() / 1e9;
  let call = new BigNumber(fees.call).div(1e9).toNumber() / 1e9;
  let strategist = new BigNumber(fees.strategist).div(1e9).toNumber() / 1e9;

  const feeSum = beefy + call + strategist;
  const beefySplit = ((total * beefy) / feeSum) * 100;

  let feeBreakdown = {
    total: total * 100,
    call: ((total * call) / feeSum) * 100,
    strategist: ((total * strategist) / feeSum) * 100,
    treasury: feeBatch.treasurySplit * beefySplit,
    stakers: feeBatch.stakerSplit * beefySplit,
  };
  return feeBreakdown;
};

const performanceForMaxi = async (contractCalls): Promise<PerformanceFee> => {
  let performanceFee: PerformanceFee;

  let callFee = parseFloat(
    contractCalls.call ?? contractCalls.CALL ?? contractCalls.call3 ?? contractCalls.call4
  );
  let maxCallFee = parseFloat(contractCalls.maxCallFee ?? 1000);
  let maxFee = parseFloat(contractCalls.maxFee ?? contractCalls.maxFee2 ?? contractCalls.maxFee3);
  let rewards = parseFloat(contractCalls.rewards ?? contractCalls.rewards2);

  let strategyAddress = contractCalls.strategy.toLowerCase();

  // Specific contracts with distinct method for charging fees
  if (
    [
      '0x436D5127F16fAC1F021733dda090b5E6DE30b3bB'.toLowerCase(),
      '0xa9E6E271b27b20F65394914f8784B3B860dBd259'.toLowerCase(),
    ].includes(strategyAddress)
  ) {
    performanceFee = {
      total: (callFee / 1000) * 100,
      strategist: 0,
      call: (callFee / 1000) * 100,
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
      total: (4.5 * callFee) / maxFee,
      strategist: 0,
      call: (4.5 * callFee) / maxFee,
      treasury: 0,
      stakers: 0,
    };
  } else if ('0xca077eEC87e2621F5B09AFE47C42BAF88c6Af18c'.toLowerCase() === strategyAddress) {
    performanceFee = {
      total: (5 / 1000) * 100,
      strategist: 0,
      call: (5 / 1000) * 100,
      treasury: 0,
      stakers: 0,
    };
  } else if ('0x87056F5E8Dce0fD71605E6E291C6a3B53cbc3818'.toLowerCase() === strategyAddress) {
    performanceFee = {
      total: ((callFee + rewards) / maxFee) * 100,
      strategist: 0,
      call: (callFee / maxFee) * 100,
      treasury: 0,
      stakers: (rewards / maxFee) * 100,
    };
  } else {
    performanceFee = {
      total: (callFee / maxCallFee) * 100,
      strategist: 0,
      call: (callFee / maxCallFee) * 100,
      treasury: 0,
      stakers: 0,
    };
  }
  return performanceFee;
};

const performanceFeesFromCalls = async (
  methodCalls,
  web3: Web3,
  feeBatch: FeeBatchDetail
): Promise<PerformanceFee> => {
  if (methodCalls.id.includes('-maxi')) {
    return performanceForMaxi(methodCalls);
  } else if (methodCalls.breakdown !== undefined) {
    //newest method
    return await performanceFromGetFees(methodCalls, web3, feeBatch);
  } else {
    return legacyFeeMappings(methodCalls, feeBatch);
  }
};

const mapStrategyCallsToFeeBreakdown = async (
  methodCalls,
  web3: Web3,
  feeBatch: FeeBatchDetail
) => {
  let withdrawFee = withdrawalFeeFromCalls(methodCalls);

  let performanceFee = await performanceFeesFromCalls(methodCalls, web3, feeBatch);

  if (withdrawFee === undefined) {
    console.log(`Failed to find withdrawFee for ${methodCalls.id}`);
    return undefined;
  } else if (performanceFee === undefined) {
    console.log(`Failed to find performanceFee for ${methodCalls.id}`);
    return undefined;
  }

  return {
    performance: performanceFee,
    withdraw: withdrawFee,
    lastUpdated: Date.now(),
  };
};

export const initVaultFeeService = async () => {
  const cachedVaultFees = await getKey(VAULT_FEES_KEY);
  const cachedFeeBatches = await getKey(FEE_BATCH_KEY);

  feeBatches = cachedFeeBatches ?? {};
  vaultFees = cachedVaultFees ?? {};

  await updateFeeBatches();

  setTimeout(() => {
    updateVaultFees();
  }, INIT_DELAY);
};

export const getVaultFees = async () => {
  return vaultFees;
};
