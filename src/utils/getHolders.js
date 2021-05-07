const axios = require('axios');

const getHolders = async () => {
  let holderCount = 0;

  try {
    let response = await axios.get(
      'https://beefy-vote-api.herokuapp.com/api/0xCa3F508B8e4Dd382eE878A314789373D80A5190A/snapshot/holders'
    );

    const ipfsHash = response.data['holders'];
    response = await axios.get(`https://ipfs.io/ipfs/${ipfsHash}`);

    let holders = response.data;
    holders = Object.keys(holders).filter(key => parseFloat(holders[key]) > 0);
    holderCount = holders.length;
  } catch (err) {
    console.error('Holders error:', err);
  }
  return { holderCount: holderCount };
};

module.exports = { getHolders };
