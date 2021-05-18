const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');

const IBunnyRewards = require('../../../../abis/IBunnyRewards.json');
const { compound } = require('../../../../utils/compound');
const { DAILY_HPY } = require('../../../../constants');

const getBunnyRewardsApy = async () => {
  const bunnyRewards = new web3.eth.Contract(
    IBunnyRewards,
    '0xCADc8CB26c8C7cB46500E61171b5F27e9bd7889D'
  );
  let { _bnb } = await bunnyRewards.methods.apy().call();
  _bnb = new BigNumber(_bnb);
  const apy = compound(_bnb.div('1e18'), DAILY_HPY, 1, 0.955);

  return { 'bunny-bunny': apy };
};

module.exports = getBunnyRewardsApy;
