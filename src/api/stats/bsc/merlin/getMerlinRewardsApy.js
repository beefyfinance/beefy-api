const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');

const Rewards = require('../../../../abis/IBunnyRewards.json');
const { compound } = require('../../../../utils/compound');
const { BASE_HPY } = require('../../../../constants');

const getMerlinRewardsApy = async () => {
  const rewardsContract = new web3.eth.Contract(
    Rewards,
    '0x3b87475ac293eeed0e8bC25713Eb8242A9497C3F'
  );
  let { _bnb } = await rewardsContract.methods.apy().call();
  _bnb = new BigNumber(_bnb);
  const apy = compound(_bnb.div('1e18'), BASE_HPY, 1, 0.955);

  return { 'merlin-merlin': apy };
};

module.exports = getMerlinRewardsApy;
