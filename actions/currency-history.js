'use strict';

const _ = require('lodash/fp');
const config = require('../config.js');
const db = require('./../db/db.js');
const moment = require('moment');
const request = require('request-promise-any');
const Q = require('q');

const currencyHistory = () => {
	const DATEFORMAT = 'YYYY-WW';

	const getFn = (req, res) => {
		let params = parseRequest(req);
		const WEEKS = 25;

		if (!params.valid) {
			res.status(400).json({
				error_message: params.invalidField + ' could not be found or was invalid.'
			});
			return;
		}

		db.getHistory(params.base, params.target, params.startWeek,
			WEEKS, (err, rows) => {
				if (err) {
					console.log("Could not retrieve history from db", err);
					res.status(400).json({
						error_message: 'Problems with the database'
					});
					return;
				} else {
					let results = _.takeRight(WEEKS, rows);
					if (results.length < WEEKS) {
						populateMissingRows(params.base, params.target, params.startWeek, WEEKS, results, (err, results) => {
							if (err) {
								console.log("Could not retrieve data from Fixer", err);
								res.status(400).json({
									error_message: 'Problems with the consumed API'
								});
								return;
							}
						});
					}
					let ordered = _.sortBy((result) => result.week, results);
					res.json(ordered);
				}
			});
	}

	const populateMissingRows = (base, target, start, weeks, existing, cb) => {
		let startTime = moment(start, DATEFORMAT, true);
		let requests = [];
		let apiError;
		for (let i = 0; i < weeks; i++) {
			let time = moment(startTime).subtract(i, 'weeks');
			console.log('Retrieving rate for date', time.format(DATEFORMAT));
			if (_.findIndex((item) => item.week === time.format(DATEFORMAT), existing) == -1) {
				let formattedDay = time.day("Monday").format("YYYY-MM-DD");
				requests.push(request(`http://data.fixer.io/api/${formattedDay}?access_key=${config.FIXER_SECRET}&base=${base}&symbols=${target}`)
					.then((resp) => {
						let parsed = JSON.parse(resp);
						if (parsed.success) {
							let result = {
								base: base,
								target: target,
								week: time.format(DATEFORMAT),
								rate: parsed.rates[target]
							};
							db.insertHistory(base, target, time.format(DATEFORMAT), result.rate);
							existing.push(result);
						}
						
					}).catch((err) => {
						apiError = err;
					}));
			}
		}
		Q.all(requests).then(() => {
			cb(apiError, existing);
		});
	}


	const parseRequest = (req) => {
		let result = {
			base: '',
			target: '',
			startWeek: '',
			valid: false,
			invalidField: ''
		};
		let validCurrencies = config.CURRENCIES.split(',');
		if (req.params.base && validCurrencies.find((item) => item === req.params.base)) {
			result.base = req.params.base;
		} else {
			result.invalidField = 'base';
			return result;
		}
		if (req.params.target && validCurrencies.find((item) => item === req.params.target)) {
			result.target = req.params.target;
		} else {
			result.invalidField = 'target';
			return result;
		}
		if (req.params.start) {
			let start = moment(req.params.start, DATEFORMAT, true);
			if (start.isValid()) {
				result.startWeek = start.format(DATEFORMAT);
			} else {
				result.invalidField = 'start';
				return;
			}
		} else {
			result.invalidField = 'start';
			return;
		}
		result.valid = true;
		return result;
	}

	return {
		get: getFn
	};
};

module.exports = currencyHistory();