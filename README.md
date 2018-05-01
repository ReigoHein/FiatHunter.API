# FiatHunter.API

## Requirements

* Node 6.9
* NPM

## Environment variables

* FIXER_SECRET - required, fixer.io secret to make API calls. Free user is limited to EUR -> * rates only.
* PORT - optional, port to start the listener on (default is :3001)
* CURRENCIES - optional, comma-separated list (USD,EUR,GBP,AUD). Default includes all fixer.io supports.
* DBFILE - optional, if left unset, will initialize database to memory. Can provide file name instead (e.g. development.sqlite3).

## Dependencies

Install dependencies via npm

	npm install

If running from terminal, prepend the environment variables before the node command.

	FIXER_SECRET=xxxxxxx node index.js

Project can be also run form IDE's, provided they can specify their own environment variables.