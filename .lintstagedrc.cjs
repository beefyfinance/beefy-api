const ifStaged = fn => stagedFiles => stagedFiles.length === 0 ? [] : fn(stagedFiles);

module.exports = {
  './(src|scripts)/**/*.{ts,js,json}': ifStaged(stagedFiles => [
    `biome check --reporter concise --staged --no-errors-on-unmatched --diagnostic-level error`,
    `tsc --project tsconfig.json`,
  ]),
  './src/data/**/beefyCowVaults.json': ifStaged(stagedFiles => [
    `yarn checkClms`,
  ]),
};
