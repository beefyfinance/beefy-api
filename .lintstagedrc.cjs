const ifStaged = fn => stagedFiles => stagedFiles.length === 0 ? [] : fn(stagedFiles);

module.exports = {
  './(src|scripts)/**/*.{ts,js,json}': ifStaged(stagedFiles => [
    `prettier --write ${stagedFiles.join(' ')}`,
    `tsc --noEmit`,
  ]),
  './src/data/**/beefyCowVaults.json': ifStaged(stagedFiles => [
    `yarn checkClms`,
  ]),
};
