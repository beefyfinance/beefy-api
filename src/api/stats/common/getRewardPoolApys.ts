const BigNumber = require('bignumber.js');
const { MultiCall } = require('eth-multicall');
const { multicallAddress } = require('../../../utils/web3');
import { AbiItem } from 'web3-utils';

const IRewardPool = require('../../../abis/IRewardPool.json');
const ERC20 = require('../../../abis/ERC20.json');
const fetchPrice = require('../../../utils/fetchPrice');
import getApyBreakdown from '../common/getApyBreakdown';
import { isSushiClient } from '../../../apollo/client';
import getBlockTime from '../../../utils/getBlockTime';
import { getTradingFeeApr, getTradingFeeAprSushi } from '../../../utils/getTradingFeeApr';

export const getRewardPoolApys = async params => {
  const tradingAprs = await getTradingAprs(params);
  const farmApys = await getFarmApys(params);

  const liquidityProviderFee = params.liquidityProviderFee ?? 0.003;

  return getApyBreakdown(params.pools, tradingAprs, farmApys, liquidityProviderFee);
};

const getTradingAprs = async params => {
  let tradingAprs = params.tradingAprs ?? {};
  const client = params.tradingFeeInfoClient;
  const fee = params.liquidityProviderFee;
  if (client && fee) {
    const pairAddresses = params.pools.map(pool => pool.address.toLowerCase());
    const getAprs = isSushiClient(client) ? getTradingFeeAprSushi : getTradingFeeApr;
    const aprs = await getAprs(client, pairAddresses, fee);
    tradingAprs = { ...tradingAprs, ...aprs };
  }
  return tradingAprs;
};

const getFarmApys = async params => {
  const apys = [];
  const tokenPrice = await fetchPrice({ oracle: params.oracle, id: params.oracleId });
  const rewardTokenPrice = params.isRewardInXToken
                             ? await getXPrice(tokenPrice, params)
                             : tokenPrice;
  const { balances, rewardRates } = await getPoolsData(params);
  const secondsPerYear = 31536000;
  const secondsPerBlock = params.perBlock ? (await getBlockTime(params.chainId)) : 1;

  for (let i = 0; i < params.pools.length; i++) {
    const pool = params.pools[i];

    const oracle = pool.oracle ?? 'lps';
    const id = pool.oracleId ?? pool.name;
    const stakedPrice = await fetchPrice({ oracle, id });
    const totalStakedInUsd = balances[i].times(stakedPrice).dividedBy(pool.decimals ?? '1e18');

    const yearlyRewards = rewardRates[i].times(secondsPerYear).dividedBy(secondsPerBlock);
    const yearlyRewardsInUsd = yearlyRewards.times(rewardTokenPrice).dividedBy(params.decimals);

    const apy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    apys.push(apy);

    if (params.log) {
      console.log(
        pool.name,
        apy.toNumber(),
        totalStakedInUsd.valueOf(),
        yearlyRewardsInUsd.valueOf()
      );
    }
  }
  return apys;
};

const getPoolsData = async params => {
  const web3 = params.web3;
  const multicall = new MultiCall(web3, multicallAddress(params.chainId));
  const balanceCalls = [];
  const rewardRateCalls = [];
  params.pools.forEach(pool => {
    const abi = params.tokenPerBlock ? chefAbi(params.tokenPerBlock) : IRewardPool;
    const tokenPerBlock = params.tokenPerBlock ?? 'rewardRate';
    const tokenContract = new params.web3.eth.Contract(ERC20, pool.address);
    const rewardPool = new params.web3.eth.Contract(abi, pool.rewardPool);
    balanceCalls.push({
      balance: tokenContract.methods.balanceOf(pool.rewardPool),
    });
    rewardRateCalls.push({
      rewardRate: rewardPool.methods[tokenPerBlock](),
    });
  });

  const res = await multicall.all([balanceCalls, rewardRateCalls]);

  const balances = res[0].map(v => new BigNumber(v.balance));
  const rewardRates = res[1].map(v => new BigNumber(v.rewardRate));
  return { balances, rewardRates };
};

const getXPrice = async (tokenPrice, params) => {
  const tokenContract = new params.web3.eth.Contract(ERC20, params.tokenAddress);
  const xTokenContract = new params.web3.eth.Contract(ERC20, params.xTokenAddress);
  const stakedInXPool = new BigNumber(await tokenContract.methods.balanceOf(params.xTokenAddress).call());
  const totalXSupply = new BigNumber(await xTokenContract.methods.totalSupply().call());

  return stakedInXPool.times(tokenPrice).dividedBy(totalXSupply);
}

const chefAbi = (tokenPerBlock): AbiItem[] => {
  const cakeAbi = IRewardPool as AbiItem[];
  cakeAbi.push({
    inputs: [],
    name: tokenPerBlock,
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  });
  return cakeAbi;
};

module.exports = { getRewardPoolApys };
