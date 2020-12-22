const axios = require('axios');
const Web3 = require('web3');

const web3 = new Web3(process.env.BSC_RPC_3 || process.env.BSC_RPC);

const getDailyEarnings = async () => {

  let totalEarnings = 0;
  let page = 1;
  let difference = 20 * 60 * 24;
  const endBlock = await web3.eth.getBlockNumber();
  const startBlock = endBlock - difference;
  
  while(true) {
    const response = await axios.get('https://api.bscscan.com/api', {
     params: {
        module: 'account',
        action: 'tokentx',
        contractaddress: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
        address: '0x453d4ba9a2d594314df88564248497f7d74d6b2c',
        offset: '1000',
        sort: 'asc',
        startblock: startBlock,
        endblock: endBlock,
        page : page
     },
    });

    let data = response.data["result"];

    if (data.length === 0) {
      break;
    }

    const earnings = data.filter(e => e.to === '0x453d4ba9a2d594314df88564248497f7d74d6b2c');

    earnings.forEach(x =>
      totalEarnings += parseInt(x.value)
    );

    page++;
  }
  return {
    "dailyEarnings" : totalEarnings/10**18,
    "startBlock" : startBlock,
    "endBlock": endBlock
  }
};

module.exports = { getDailyEarnings };

