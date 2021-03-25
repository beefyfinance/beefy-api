const { bscWeb3: web3 } = require('./web3');
const { BigNumber, ethers } = require('ethers');
const { BSC_RPC } = require('../../constants');
const ERC20 = require('../abis/ERC20.json');

const getDailyEarnings = async () => {
  const provider = new ethers.providers.JsonRpcProvider(BSC_RPC);
  const contract = new ethers.Contract("0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c", ERC20, provider);
  const filterTo = contract.filters.Transfer(null, "0x453d4ba9a2d594314df88564248497f7d74d6b2c");

  let totalEarnings = BigNumber.from(0);
  let difference = 20 * 60 * 24;
  const endBlock = await web3.eth.getBlockNumber();
  const startBlock = endBlock - difference;
  let currentBlock = startBlock;
  let result = BigNumber.from(0);

  try{
    while (currentBlock < endBlock) {
      // provider only allows up to 5000 blocks at a time
      let data = await contract.queryFilter(filterTo, currentBlock, currentBlock+5000);
      for (var i = 0; i < data.length; i++ ){
        let hexAmount = data[i]["args"][2];
        
        let amount = BigNumber.from(hexAmount);
        
        totalEarnings = totalEarnings.add(amount);
      }
      currentBlock += 5000;
    }

    console.log("> calculated daily earnings");
    // divide twice to avoid overflow error, 1e16 so we can have 2 decimal places in response
    let result = (totalEarnings.div(1e9)).div(1e7); 
    
    return {
      daily: result.toNumber() / 100,
      startBlock: startBlock,
      endBlock: endBlock,
    };
  } catch (err){
    console.error('Daily earnings error:', err);
    return {};
  }
  
};
  
module.exports = { getDailyEarnings };
