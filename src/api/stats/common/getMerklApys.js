export const getMerklApys = async (chainId, pools) => {
  let merklPools = {};
  let merklApi = `https://api.angle.money/v3/opportunity?chainId=${chainId}`;
  try {
    merklPools = await fetch(merklApi).then(res => res.json());
  } catch (e) {
    console.error(`Failed to fetch Merkl APRs: ${chainId}`);
  }

  let merklAprs = pools.map(pool => {
    if (Object.keys(merklPools).length !== 0) {
      for (const [key, value] of Object.entries(merklPools)) {
        if (key.toLowerCase().slice(key.indexOf('_') + 1) === `${pool.address.toLowerCase()}`) {
          return (value.dailyrewards * 365) / value.tvl;
        }
      }
    }
    return 0;
  });

  return merklAprs;
};
