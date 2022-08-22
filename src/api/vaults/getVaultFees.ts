const { MultiCall } = require('eth-multicall');
import { performance } from 'perf_hooks';
import { addressBookByChainId, ChainId } from '../../../packages/address-book/address-book';
import { getContract, getContractWithProvider } from '../../utils/contractHelper';
import { getKey, setKey } from '../../utils/redisHelper';
import { sleep } from '../../utils/time';
import { multicallAddress, web3Factory } from '../../utils/web3';
const FeeABI = require('../../abis/FeeABI.json');
const { getMultichainVaults } = require('../stats/getMultichainVaults');
const BigNumber = require('bignumber.js');

const VAULT_FEES_KEY = 'VAULT_FEES';
const FEE_BATCH_KEY = 'FEE_BATCHES';

interface BeefyFee {
  total: number;
  treasury: number;
  stakers: number;
}

interface VaultFeeBreakdown {
  performance: {
    total: number;
    call: number;
    strategist: number;
    beefy: {
      total: number;
      treasury: number;
      stakers: number;
    };
  };
  withdraw: number;
  lastUpdated: number;
}

var feeBatches: Record<ChainId, string>;
var vaultFees: Record<string, VaultFeeBreakdown>;

const updateFeeBatches = async () => {
  Object.keys(addressBookByChainId).forEach(chainId => {
    feeBatches[chainId] = addressBookByChainId[chainId].platforms.beefyfinance.beefyFeeRecipient;
  });
  setKey(FEE_BATCH_KEY, feeBatches);
  console.log(`> feeBatches updated`);
};

const updateVaultFees = async () => {
  let vaults = getMultichainVaults();

  const chainVaults = vaults.filter(
    vault => !vault.id.includes('-maxi') && vault.chain === 'arbitrum'
  );
  // await getChainFees(chainVaults, ChainId.arbitrum)
  // console.log(chainVaults[0])
  // await getBreakdown(chainVaults[0], ChainId.optimism)

  for (const chain of Object.values(ChainId).filter(c => isNaN(Number(c)))) {
    console.log('~~~~~~~');
    console.log(chain);
    const chainVaults = vaults.filter(
      vault => !vault.id.includes('-maxi') && vault.chain === chain
    );

    try {
      await getChainFees(chainVaults, ChainId[chain]);
    } catch (err) {
      console.log(` > Failed to update fees on chain ` + chain);
      console.log(err.message);
    }
    console.log('finished chain');
  }
};

const getBreakdown = async (vault, chainId) => {
  const web3 = web3Factory(chainId);
  const contract = getContractWithProvider(FeeABI, vault.strategy, web3);
  const contractNoProv = getContract(FeeABI, vault.strategy);
  let res = await contract.methods.getFees().call();
  console.log(res);
  console.log(multicallAddress(chainId));
  const multicall = new MultiCall(web3, multicallAddress(chainId));
  const feeCalls = [];
  feeCalls.push({
    fees: contractNoProv.methods.getFees(),
  });
  let res2 = await multicall.all([feeCalls]);
  console.log(res2);
  console.log(res2[0][0].fees);
};

const getChainFees = async (vaults, chainId) => {
  const web3 = web3Factory(chainId);
  const multicall = new MultiCall(web3, multicallAddress(chainId));
  const feeCalls = [];

  console.log(vaults[0].chain);
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
      beefy: strategyContract.methods.beefyFee(),
      fee: strategyContract.methods.fee(),
      treasury: strategyContract.methods.TREASURY_FEE(),
      rewards: strategyContract.methods.REWARDS_FEE(),
      rewards2: strategyContract.methods.rewardsFee(),
      breakdown: strategyContract.methods.getFees(),
      maxFee: strategyContract.methods.MAX_FEE(),
      maxFee2: strategyContract.methods.max(),
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
    let fees = await mapStrategyCallsToFeeBreakdown(contractCalls, web3);
    if (fees) {
    } else {
    }
  }

  // let filtered = feeResults.filter(r => r.breakdown !== undefined);
  // console.log(filtered)
  // if (feeResults.filter(r => r.withdrawMax === undefined).length > 0) {
  //     console.log(feeResults.filter(r => r.withdrawMax === undefined))
  // }
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

const legacyFeeMappings = async methodCalls => {
  let total = 4.5;

  let callFee = parseFloat(methodCalls.call ?? methodCalls.CALL ?? methodCalls.call3);
  let strategistFee = parseFloat(methodCalls.strategist ?? methodCalls.strategist2);
  let maxFee = parseFloat(methodCalls.maxFee ?? methodCalls.maxFee2);
  let beefyFee = parseFloat(methodCalls.beefy);
  let fee = parseFloat(methodCalls.fee);
  let treasury = parseFloat(methodCalls.treasury);
  let rewards = parseFloat(methodCalls.rewards ?? methodCalls.rewards2);

  if (callFee + strategistFee + beefyFee !== maxFee) {
    if (callFee + strategistFee + rewards + treasury !== maxFee) {
      if (callFee + treasury + rewards !== maxFee) {
        if (fee + callFee !== maxFee) {
          if (strategistFee + callFee + treasury !== maxFee) {
            if (
              strategistFee !== undefined &&
              callFee !== undefined &&
              beefyFee !== undefined &&
              maxFee !== undefined
            ) {
            }
          }
        }
      }
    }
  }
  return 1;
};

const performanceFeesFromCalls = async (methodCalls, web3) => {
  if (methodCalls.breakdown !== undefined) {
    //newest method
    //Requires an RPC call so a sleep to rate-limit is used
    await sleep(1000);
    const strategyContract = getContractWithProvider(FeeABI, methodCalls.strategy, web3);
    const fees = await strategyContract.methods.getFees().call();

    let total = new BigNumber(fees.total).div(1e9).toNumber() / 1e9;
    let beefy = new BigNumber(fees.beefy).div(1e9).toNumber() / 1e9;
    let call = new BigNumber(fees.call).div(1e9).toNumber() / 1e9;
    let strategist = new BigNumber(fees.strategist).div(1e9).toNumber() / 1e9;

    const feeSum = beefy + call + strategist;
    const beefySplit = ((total * beefy) / feeSum) * 100;

    let feeBreakdown = {
      total: (total * 100).toFixed(2),
      call: (((total * call) / feeSum) * 100).toFixed(4),
      strategist: (((total * strategist) / feeSum) * 100).toFixed(2),
      beefy: {
        total: beefySplit.toFixed(2),
        treasury: (0.64 * beefySplit).toFixed(2),
        stakers: (0.36 * beefySplit).toFixed(2),
      },
    };
    return feeBreakdown;
  } else {
    return await legacyFeeMappings(methodCalls);
  }
};

const mapStrategyCallsToFeeBreakdown = async (methodCalls, web3) => {
  let withdrawFee = withdrawalFeeFromCalls(methodCalls);

  let performanceFee = await performanceFeesFromCalls(methodCalls, web3);

  if (withdrawFee === undefined) {
    console.log(`Failed to find withdrawFee for ${methodCalls.id}`);
    return undefined;
  } else if (performanceFee === undefined) {
    console.log(`Failed to find performance for ${methodCalls.id}`);
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
  }, 15000);
};
