# address-book

A collection of useful addresses on EVM chains for defi development

### Contributing


1. Read the [CONTRIBUTING](./CONTRIBUTING.md) doc first
1. run `npm ci`. This will install the packages and prepare husky pre-commit hook 
1. Add addresses:
   1. If new platform: 
       1. Add a file for the platform (i.e pancakeswap) under the respective chain in address-book/<your chain name>
       1. Add the third party contracts in an object there and export the object. 
       1. Add the export to the chain's index.ts file.
   1. For tokens:
      1. Add to respective token.ts file, with token symbol as key. Make sure the decimals are correct for the token. Usually you can find this info via the chain's block explorer.   
1. Try to commit the change. If it fails, its because the address isn't passing the checksum check. Look at the console output and paste the correct address.
1. Once commit goes through, raise a PR
1. If the checksum passes, a maintainer will review it and merge it
1. Once merged, the package version will be bumped and the package will be published. Run `npm install <package>@latest` in the consuming repo to consume the new package version.