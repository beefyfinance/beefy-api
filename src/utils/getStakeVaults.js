const axios = require('axios');
const fs = require('fs');
const { sleep } = require('./time');
const { ABI_ENDPOINT } = require('../constants');

const getStakeVaults = async vaultsEndpoint => {
  try {
    const response = await axios.get(vaultsEndpoint);
    const data = response.data;
    fs.writeFile('src/utils/pools/stake/bsc_stake.js', data, function (err) {
      if (err) return console.log(err);
      // console.log('> stake pools sourced into src/utils/pools/stake/bsc_stake.js');
    });

    const abiResponse = await axios.get(ABI_ENDPOINT);
    const abiData = abiResponse.data;
    fs.writeFile('src/utils/pools/abi.js', abiData, function (err) {
      if (err) return console.log(err);
      // console.log('> abi sourced into src/utils/pools/abi.js');
    });

    await sleep(1000);

    const bscStake = require('../utils/pools/stake/bsc_stake');

    return bscStake.bscStakePools;
  } catch (err) {
    console.error(err);
    return 0;
  }
};

module.exports = getStakeVaults;
