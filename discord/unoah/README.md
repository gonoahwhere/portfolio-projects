## Scripts
- `npm run deploy`: runs the deploy script
- `npm run start`: starts the bot
- `npm run dev`: hot reload the bot

## Cleaning Git History
- `git filter-branch --tree-filter 'rm -f .env' -f HEAD`: removes .env from all git history
- `git push --force-with-lease`: pushes cleaned history to GitHub (safer than --force)