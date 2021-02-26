Contributing to Beefy's API
=======

We really appreciate and value contributions to the Beefy.Finance repositories. Please take 5' to review the items listed below to make sure that your contributions are merged as soon as possible.

## Creating Pull Requests (PRs)

As a contributor, you are expected to fork this repository, work on your own fork and then submit pull requests. The pull requests will be reviewed and eventually merged into the main repo. See ["Fork-a-Repo"](https://help.github.com/articles/fork-a-repo/) for how this works.

## A typical workflow

1) Make sure your fork is up to date with the main repository:

```
cd beefy-api
git remote add upstream https://github.com/beefyfinance/beefy-api.git
git fetch upstream
git pull --rebase upstream master
```
NOTE: The directory `beefy-api` represents your fork's local copy.

2) Branch out from `master` into `fix/some-bug-#123`:
(Postfixing #123 will associate your PR with the issue #123 and make everyone's life easier =D)
```
git checkout -b fix/some-bug-#123
```

3) Make your changes, add your files, commit, and push to your fork.

```
git add SomeFile.js
git commit "Fix some bug #123"
git push origin fix/some-bug-#123
```

4) Go to [github.com/beefyfinance/beefy-api](https://github.com/beefyfinance/beefy-api) in your web browser and issue a new pull request.

5) Maintainers will review your code and possibly ask for changes before your code is pulled in to the main repository. We'll check that all tests pass, review the coding style, and check for general code correctness. If everything is OK, we'll merge your pull request and your code will be part of Beefy's API.

*IMPORTANT* Please pay attention to the maintainer's feedback, since its a necessary step to keep up with the standards Beefy.Finance attains to.

## All set!

If you have any questions, feel free to post them to [github.com/beefyfinance/beefy-api/issues](https://github.com/beefyfinance/beefy-api/issues).

Finally, if you're looking to collaborate and want to find easy tasks to start, look at the issues we marked as ["Good first issue"](https://github.com/beefyfinance/beefy-api/issues?q=label%3A%22good+first+issue%22).

## Contributor rewards 

Beefy wants to be a self-sustainable community. A portion of the fees that come from running the vaults at [beefy.finance](https://app.beefy.finance) goes into a community managed treasury. The treasury is used to pay for marketing, community managers, developers, etc. We are learning together how to do this in a fair and effective way. When it comes to devs there are a few options: 

1. There are some issues that will have a "Treasury Bounty" tag and a dollar amount in the issue title. This means that the issue carries a reward to the dev that closes it. 
2. You can propose a bounty or budget to get something done by following our [proposal guidelines](PROPOSAL_GUIDELINES.md)
3. We are tracking all contributions using [Sourcecred](https://sourcecred.io/). This is a project designed specifically to track community contributions. We have [our instance](https://beefy.finance/beefy-cred/#/explorer) and track GitHub contributions. A percentage of the treasury funds might be used every month to reward developers based on that distribution. This initiative is just getting started.

Thanks for your time and code!
