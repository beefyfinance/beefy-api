export const getMerklApys = async (chainId, pools) => {
  const merklAprByAddress = await getMerklV4AprByExplorerAddress(
    chainId,
    pools.map(p => p.address)
  );

  return pools.map(pool => merklAprByAddress[pool.address.toLowerCase()] ?? 0);
};

const getMerklV4AprByExplorerAddress = async (chainId, explorerAddresses) => {
  const result = {};
  const batchSize = 8; // stay under Merkl's default 10 req/s rate limit

  for (let i = 0; i < explorerAddresses.length; i += batchSize) {
    const batch = explorerAddresses.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async address => {
        const url = `https://api.merkl.xyz/v4/opportunities?chainId=${chainId}&explorerAddress=${address}`;
        try {
          const data = await fetch(url).then(res => res.json());
          if (!Array.isArray(data) || data.length === 0) {
            return 0;
          }

          const match =
            data.find(
              o => typeof o?.identifier === 'string' && o.identifier.toLowerCase() === address.toLowerCase()
            ) ?? data[0];

          if (typeof match?.apr === 'number' && Number.isFinite(match.apr)) {
            return match.apr / 100;
          }

          if (
            typeof match?.dailyRewards === 'number' &&
            Number.isFinite(match.dailyRewards) &&
            typeof match?.tvl === 'number' &&
            Number.isFinite(match.tvl) &&
            match.tvl > 0
          ) {
            return (match.dailyRewards * 365) / match.tvl;
          }

          return 0;
        } catch (e) {
          console.error(`Failed to fetch Merkl APRs (v4): ${chainId}`);
          return 0;
        }
      })
    );

    batch.forEach((address, idx) => {
      result[address.toLowerCase()] = batchResults[idx] ?? 0;
    });
  }

  return result;
};
