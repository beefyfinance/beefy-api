const ifStaged = fn => stagedFiles => stagedFiles.length === 0 ? [] : fn(stagedFiles);

module.exports = {
  './(src|scripts)/**/*.{ts,js,json}': ifStaged(stagedFiles => [
    `biome check --reporter concise --staged --fix`,
    `tsc --project tsconfig.json`,
  ]),
  './src/data/**/beefyCowVaults.json': ifStaged(stagedFiles => [
    `yarn checkClms`,
  ]),
};
