const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');

const PeraToken = require('../../../../abis/degens/PeraToken.json');
const fetchPrice = require('../../../../utils/fetchPrice');
const pools = require('../../../../data/degens/peraLpPools.json');
const { compound } = require('../../../../utils/compound');
const { getContractWithProvider } = require('../../../../utils/contractHelper');
const { getTotalPerformanceFeeForVault } = require('../../../vaults/getVaultFees');

const getPeraApys = async () => {
  const pera = '0xb9D8592E16A9c1a3AE6021CDDb324EaC1Cbc70d6';
  const pool = pools[0];

  const peraContract = getContractWithProvider(PeraToken, pera, web3);
  const multiplier = new BigNumber(await peraContract.methods.LPRewardMultiplier().call());
  const rate = new BigNumber(await peraContract.methods.blockRewardLP().call());
  const totalStakedLP = new BigNumber(await peraContract.methods.totalStakedLP().call());

  const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
  const totalStakedInUsd = totalStakedLP.times(lpPrice).div('1e18');

  const tokenPrice = await fetchPrice({ oracle: 'tokens', id: 'PERA' });
  const yearlyRewardsInUsd = rate
    .times(multiplier)
    .times(10512000)
    .times(tokenPrice)
    .div(2000)
    .div('1e18');

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const shareAfterBeefyPerformanceFee = 1 - getTotalPerformanceFeeForVault(pool.name);
  const apy = compound(simpleApy, process.env.BASE_HPY, 1, shareAfterBeefyPerformanceFee);
  // console.log(pool.name, simpleApy.valueOf(), apy, totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
  return { [pool.name]: apy };
};

module.exports = getPeraApys;
