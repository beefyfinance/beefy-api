import { ChainId } from '../../../packages/address-book/address-book';
import BigNumber from 'bignumber.js';
import { ApiChain } from '../../utils/chain';
import { fetchContract } from '../rpc/client';
import BeefyBoostAbi from '../../abis/BeefyBoost';
import { Boost } from './types';

export const getBoosts = async chain => {
  const boostsEndpoint = `https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/boost/${chain}.json`;
  try {
    let boosts = await fetch(boostsEndpoint).then(res => res.json());
    return boosts as Boost[];
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getBoostPeriodFinish = async (chain: ApiChain, boosts: any[]) => {
  const chainId = ChainId[chain];

  const boostAddresses = boosts.map(v => v.earnContractAddress);
  const periodFinishCalls = boostAddresses.map(boostAddress => {
    const boostContract = fetchContract(boostAddress, BeefyBoostAbi, chainId);
    return boostContract.read.periodFinish();
  });

  const res = await Promise.all(periodFinishCalls);

  const periodFinishes = res.map(v => new BigNumber(v.toString()).toNumber());

  for (let i = 0; i < periodFinishes.length; i++) {
    boosts[i].periodFinish = periodFinishes[i];
  }

  return boosts;
};
