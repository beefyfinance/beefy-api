import { MultiCall } from 'eth-multicall';
import fetch from 'node-fetch';
import { ChainId } from '../../../packages/address-book/address-book';
import { getContract } from '../../utils/contractHelper';
import { multicallAddress, web3Factory } from '../../utils/web3';
import BoostABI from '../../abis/BeefyBoost.json';
import BigNumber from 'bignumber.js';

export const getBoosts = async chain => {
  const boostsEndpoint = `https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/boost/${chain}.json`;
  try {
    let boosts = await fetch(boostsEndpoint).then(res => res.json());
    return boosts;
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getBoostPeriodFinish = async (chain: string, boosts: any[]) => {
  const chainId = ChainId[chain] as any as ChainId;
  const web3 = web3Factory(chainId);
  const multicall = new MultiCall(web3, multicallAddress(ChainId[chain]));

  // Split query in batches
  const boostAddresses = boosts.map(v => v.earnContractAddress);
  const periodFinishCalls = boostAddresses.map(boostAddress => {
    const boostContract = getContract(BoostABI, boostAddress);
    return {
      periodFinish: boostContract.methods.periodFinish(),
    };
  });

  let res = await multicall.all([periodFinishCalls]);

  const periodFinishes = res[0].map(v => new BigNumber(v.periodFinish).toNumber());

  for (let i = 0; i < periodFinishes.length; i++) {
    boosts[i].periodFinish = periodFinishes[i];
  }

  return boosts;
};
