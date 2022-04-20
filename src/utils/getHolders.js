const fetch = require('node-fetch');

const getHolders = async () => {
  let holderCount = 0;

  try {
    let response = await fetch(
      'https://beefy-vote-api.herokuapp.com/api/0xCa3F508B8e4Dd382eE878A314789373D80A5190A/snapshot/holders'
    ).then(res => res.json());

    const ipfsHash = response.holders;

    let holders = await fetch(`https://ipfs.io/ipfs/${ipfsHash}`).then(res => res.json());
    holders = Object.keys(holders).filter(key => parseFloat(holders[key]) > 0);
    holderCount = holders.length;
  } catch (err) {
    console.error('Holders error:', err);
  }
  return { holderCount: holderCount };
};

module.exports = { getHolders };
