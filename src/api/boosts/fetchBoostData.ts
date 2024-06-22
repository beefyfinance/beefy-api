import { ChainId } from '../../../packages/address-book/src/address-book';
import BigNumber from 'bignumber.js';
import { ApiChain } from '../../utils/chain';
import { fetchContract } from '../rpc/client';
import BeefyBoostAbi from '../../abis/BeefyBoost';
import { Boost } from './types';

export const getBoosts = async chain => {
  const boostsEndpoint = `https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/boost/${chain}.json`;
  const response = await fetch(boostsEndpoint);
  if (response.status !== 200) {
    throw new Error(
      `Failed to fetch boosts for ${chain}: ${response.status} ${response.statusText}`
    );
  }

  const boosts = await response.json();
  if (!boosts || !Array.isArray(boosts)) {
    throw new Error(`Invalid boosts data for ${chain}`);
  }

  return boosts as Boost[];
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
