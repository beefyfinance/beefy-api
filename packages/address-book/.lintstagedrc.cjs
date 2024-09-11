const ifStaged = fn => stagedFiles => stagedFiles.length === 0 ? [] : fn(stagedFiles);
const withArgs = (cmd, ...args) => `${cmd} ${args.flat().join(' ')}`;

module.exports = {
  './(src|scripts)/**/*.ts': ifStaged(stagedFiles => [
    withArgs('prettier', '--write', stagedFiles),
    withArgs('eslint', '--fix', stagedFiles),
    withArgs('tsc', '--noEmit'),
  ]),
  './src/address-book/*/tokens/tokens.ts': ifStaged(stagedFiles => {
    const chains = stagedFiles.map(file => file.split('/')[2]).filter(v => !!v);
    if (!chains.length) {
      throw new Error('Matched files do not match expected path structure');
    }
    return [withArgs('ts-node', '--transpileOnly', './scripts/checkDuplicates.ts', chains)];
  }),
  './src/address-book/**/*.ts': ifStaged(stagedFiles => {
    const changed = stagedFiles.reduce(
      (acc, file) => {
        const matches = file.match(
          /^src\/address-book\/(?<chain>[^/]+)\/((?<type>[^/]+)\/)?(?<file>[^.]+)\.ts$/
        );
        if (!matches) {
          throw new Error('Matched files do not match expected path structure');
        }
        if (!matches.groups.type) {
          acc.all.add(matches.groups.chain);
        } else if (matches.groups.type === 'tokens') {
          acc.tokens.add(matches.groups.chain);
        } else if (matches.groups.type === 'platforms') {
          acc.platforms.add(matches.groups.chain);
        }
        return acc;
      },
      { all: new Set(), tokens: new Set(), platforms: new Set() }
    );

    const all = changed.all.size
      ? withArgs('ts-node', '--transpileOnly', './scripts/checksum.ts', Array.from(changed.all))
      : undefined;
    for (const chain of changed.all) {
      changed.tokens.delete(chain);
      changed.platforms.delete(chain);
    }
    const tokens = changed.tokens.size
      ? withArgs(
          'ts-node',
          '--transpileOnly',
          './scripts/checksum.ts',
          '--tokens',
          Array.from(changed.tokens)
        )
      : undefined;
    const platforms = changed.platforms.size
      ? withArgs(
          'ts-node',
          '--transpileOnly',
          './scripts/checksum.ts',
          '--platforms',
          Array.from(changed.platforms)
        )
      : undefined;
    return [all, tokens, platforms].filter(v => !!v);
  }),
};
