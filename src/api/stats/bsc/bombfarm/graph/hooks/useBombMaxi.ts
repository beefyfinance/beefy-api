//import { useCallback, useEffect, useState } from 'react';
import { bombMaxi } from '../fetchers';

export const useBombMaxi = (poolId: string) => {
  // const [maxiStats, setMaxiStats] = useState(null);

  const maxiData = bombMaxi(poolId);

  //   const fetchMaxi = useCallback(async () => {
  //     setMaxiStats(await maxiData);
  //   }, [maxiData]);

  //   useEffect(() => {
  //     fetchMaxi().catch((err) => console.error(`Failed to fetch maxiStats: ${err.stack}`));
  //     //    let refreshInterval = setInterval(fetchMaxi);
  //     //  return () => clearInterval(refreshInterval);
  //   }, [maxiData, fetchMaxi]);

  //const BombMaxi = useState(bombMaxi(poolId));
  return maxiData;
};

export default useBombMaxi;
