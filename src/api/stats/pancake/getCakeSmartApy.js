const Web3 = require('web3');

const StrategySmartCake = require('../../../abis/StrategySmartCake.json');

const web3 = new Web3(process.env.BSC_RPC);

const getCakeSmartApy = async apys => {
  const pools = {
    0: 'cake-hard',
    1: 'cake-broobee',
    2: 'cake-twt',
  };

  const strategy = new web3.eth.Contract(
    StrategySmartCake,
    '0xBD8ad0F6492DA660f506fB65f049A5DA4b894a27'
  );
  const currentPool = await strategy.methods.currentPool().call();

  return apys[pools[currentPool]];
};

module.exports = getCakeSmartApy;
