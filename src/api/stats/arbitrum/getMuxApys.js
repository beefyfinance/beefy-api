import { getContract } from '../../../utils/contractHelper';
import { ARBITRUM_CHAIN_ID as chainId } from '../../../constants';
import { ERC20_ABI } from '../../../abis/common/ERC20';
import IMuxRewardRouter from '../../../abis/arbitrum/MuxRewardRouter.json';
import { MultiCall } from 'eth-multicall';
import BigNumber from 'bignumber.js';
import { multicallAddress } from '../../../utils/web3';
import fetchPrice from '../../../utils/fetchPrice';
import { arbitrumWeb3 as web3 } from '../../../utils/web3';
import getApyBreakdown from '../common/getApyBreakdown';

const name = 'mux-arb-mlp';
const feeMlp = '0x290450cDea757c68E4Fe6032ff3886D204292914';
const rewardRouter = '0xaf9C4F6A0ceB02d4217Ff73f3C95BbC8c7320ceE';
const mlpRewardProportion = 0.7;
const rewardOracle = 'tokens';
const rewardOracleId = 'WETH';

export const getMuxArbitrumApys = async () => {
  const RewardRouter = getContract(IMuxRewardRouter, rewardRouter);
  const calls = [
    {
      feeRate: RewardRouter.methods.feeRewardRate(),
      poolOwnedRate: RewardRouter.methods.poolOwnedRate(),
    },
  ];
  const supplyCalls = [{ totalSupply: getContract(ERC20_ABI, feeMlp).methods.totalSupply() }];

  const multicall = new MultiCall(web3, multicallAddress(chainId));
  const res = await multicall.all([calls, supplyCalls]);

  const feeRate = new BigNumber(res[0][0].feeRate).div('1e18');
  const poolOwnedRate = new BigNumber(res[0][0].poolOwnedRate).div('1e18');
  const totalSupply = new BigNumber(res[1][0].totalSupply).div('1e18');

  const lpPrice = await fetchPrice({ oracle: 'lps', id: name });
  const rewardPrice = await fetchPrice({ oracle: rewardOracle, id: rewardOracleId });
  const totalStakedUsd = totalSupply.times(lpPrice);
  const rewardsUsd = feeRate
    .times(rewardPrice)
    .times(31536000)
    .times(mlpRewardProportion)
    .times(1 - poolOwnedRate);
  const apr = rewardsUsd.div(totalStakedUsd);

  // console.log('MUX apy', rewardsUsd.toNumber(), totalStakedUsd.toNumber(), apr.toNumber());
  return getApyBreakdown([{ name, address: name }], {}, [apr], 0);
};
