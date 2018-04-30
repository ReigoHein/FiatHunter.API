'use strict';

const _ = require('lodash/fp');

//config values can be defaults (set), required (true) or optional (false)
//DBFILE can be set to :memory: for in-memory DB
const defaults = {
  'FIXER_SECRET': true,
  'PORT': 3001,
  'CURRENCIES': 'AUD,BGN,BRL,CAD,CHF,CNY,CZK,DKK,EUR,GBP,HKD,HRK,HUF,IDR,ILS,INR,JPY,KRW,MXN,MYR,NOK,NZD,PHP,PLN,RON,RUB,SEK,SGD,THB,TRY,USD,ZAR',
  'DBFILE': ':memory:'
};

const getConfigFromEnv = function(p) {
  if(process.env && process.env[p[0]]) {
    return [p[0], process.env[p[0]]];
  } else if(p[1] !== true) {
    return [p[0], p[1]];
  } else {
    throw new Error('environment variable ' + p[0] + ' required, but not provided');
  }
};

const getConfig = _.flow(_.toPairs, _.map(getConfigFromEnv), _.fromPairs);

module.exports = getConfig(defaults);