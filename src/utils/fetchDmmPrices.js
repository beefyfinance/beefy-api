const BigNumber = require('bignumber.js');
const { ethers } = require('ethers');
const { MULTICHAIN_RPC } = require('../constants');
import { multicallAddress, web3Factory } from './web3';
import { MultiCall } from 'eth-multicall';
import { getContract } from './contractHelper';
const DMMPool = require('../abis/DMMPool');
const ERC20 = require('../abis/common/ERC20/ERC20.json');

const sortByKeys = o => {
  return Object.keys(o)
    .sort()
    .reduce((r, k) => ((r[k] = o[k]), r), {});
};

const calcTokenPrice = (knownPrice, knownToken, unknownToken) => {
  const valuation = knownToken.virtualBal.dividedBy(knownToken.decimals).multipliedBy(knownPrice);
  const price = valuation.multipliedBy(unknownToken.decimals).dividedBy(unknownToken.virtualBal);
  const weight = knownToken.virtualBal.plus(unknownToken.virtualBal).toNumber();

  return {
    price: price.toNumber(),
    weight: unknownToken.virtualBal.dividedBy(unknownToken.decimals).toNumber(),
  };
};

const calcLpPrice = (pool, tokenPrices) => {
  const lp0 = pool.lp0.balance
    .multipliedBy(tokenPrices[pool.lp0.oracleId])
    .dividedBy(pool.lp0.decimals);
  const lp1 = pool.lp1.balance
    .multipliedBy(tokenPrices[pool.lp1.oracleId])
    .dividedBy(pool.lp1.decimals);
  return lp0.plus(lp1).multipliedBy(pool.decimals).dividedBy(pool.totalSupply).toNumber();
};

const fetchDmmPrices = async (pools, knownPrices) => {
  let prices = { ...knownPrices };
  let lps = {};
  let weights = {};
  Object.keys(knownPrices).forEach(known => {
    weights[known] = Number.MAX_SAFE_INTEGER;
  });

  const chainIds = pools.map(p => p.chainId);
  const uniqueChainIds = [...new Set(chainIds)];

  for (let i = 0; i < uniqueChainIds.length; i++) {
    const web3 = web3Factory(uniqueChainIds[i]);
    let filtered = pools.filter(p => p.chainId == uniqueChainIds[i]);
    const multicall = new MultiCall(web3, multicallAddress(uniqueChainIds[i]));

    const dmmCalls = [];
    const lp0Calls = [];
    const lp1Calls = [];
    filtered.forEach(pool => {
      const tokenContract = getContract(DMMPool, pool.address);
      const lp0Contract = getContract(ERC20, pool.lp0.address);
      const lp1Contract = getContract(ERC20, pool.lp1.address);
      dmmCalls.push({
        totalSupply: tokenContract.methods.totalSupply(),
        tradeInfo: tokenContract.methods.getTradeInfo(),
      });
      lp0Calls.push({
        balance: lp0Contract.methods.balanceOf(pool.address),
      });
      lp1Calls.push({
        balance: lp1Contract.methods.balanceOf(pool.address),
      });
    });

    let res;
    try {
      res = await multicall.all([dmmCalls, lp0Calls, lp1Calls]);
    } catch (e) {
      console.error('fetchDmmPrices', e);
      continue;
    }

    const totalSupply = res[0].map(v => new BigNumber(v.totalSupply));
    const virtualBal0 = res[0].map(v => new BigNumber(v.tradeInfo['2']));
    const virtualBal1 = res[0].map(v => new BigNumber(v.tradeInfo['3']));
    const lp0Bal = res[1].map(v => new BigNumber(v.balance));
    const lp1Bal = res[2].map(v => new BigNumber(v.balance));

    for (let i = 0; i < filtered.length; i++) {
      filtered[i].totalSupply = totalSupply[i];
      filtered[i].lp0.virtualBal = virtualBal0[i];
      filtered[i].lp1.virtualBal = virtualBal1[i];
      filtered[i].lp0.balance = lp0Bal[i];
      filtered[i].lp1.balance = lp1Bal[i];
    }

    const unsolved = filtered.slice();
    let solving = true;
    while (solving) {
      solving = false;

      for (let i = unsolved.length - 1; i >= 0; i--) {
        const pool = unsolved[i];

        let knownToken, unknownToken;
        if (pool.lp0.oracleId in prices) {
          knownToken = pool.lp0;
          unknownToken = pool.lp1;
        } else if (pool.lp1.oracleId in prices) {
          knownToken = pool.lp1;
          unknownToken = pool.lp0;
        } else {
          console.log('unsolved: ', pool.lp0.oracleId, pool.lp1.oracleId, pool.name);
          continue;
        }

        const { price, weight } = calcTokenPrice(
          prices[knownToken.oracleId],
          knownToken,
          unknownToken
        );
        if (weight > (weights[unknownToken.oracleId] || 0)) {
          prices[unknownToken.oracleId] = price;
          weights[unknownToken.oracleId] = weight;
        }
        lps[pool.name] = calcLpPrice(pool, prices);

        unsolved.splice(i, 1);
        solving = true;
      }
    }
  }

  return {
    poolPrices: sortByKeys(lps),
    tokenPrices: sortByKeys(prices),
  };
};

module.exports = { fetchDmmPrices };
