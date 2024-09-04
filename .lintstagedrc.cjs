module.exports = {
  './(src|scripts)/**/*.{ts,js,json}': stagedFiles => [
    `prettier --write ${stagedFiles.join(' ')}`,
    `tsc --noEmit`,
  ],
};
