const axios = require('axios');

const getHolders = async () => {
  let response = await axios.get('https://beefy-vote-api.herokuapp.com/api/0xCa3F508B8e4Dd382eE878A314789373D80A5190A/snapshot/holders');

  const ipfsHash = response.data["holders"];
  console.log(ipfsHash)

  response = await axios.get(`https://ipfs.io/ipfs/${ipfsHash}`);

  let holders = response.data;

  holders = Object.keys(holders).filter(key => parseFloat(holders[key]) > 0 );

  return {"holderCount" : holders.length};
};

module.exports = {getHolders};
