'use strict';

const _ = require('lodash/fp');
const config = require('../config.js');
const db = require('../db/db.js');
const moment = require('moment');
const request = require('request');

const currencyHistory = () => {

	const getFn = (req, res) => {
		let params = parseRequest(req);

		if (!params.valid) {
			res.status(400).json({
				error_message: params.invalidField + ' could not be found or was invalid.'
			});
			return;
		}

		db.getHistory(params.base, params.target, params.startWeek, 
			params.weeks, (err, rows) => {
			if (err != null) {
				console.log("Could not retrieve history from db", err);
				res.status(400).json({
					error_message: 'Problems with the database'
				});
				return;
			} else {
				if (rows.length < weeks) {
					// populateMissingRows(, (results) => {

					// });
				} else {
					res.json(rows);
				}
			}
		});
	}

	const populateMissingRows = (base, target, start, weeks, cb) => {

	}


	const parseRequest = (req) => {
		let result = {
			base: '',
			target: '',
			weeks: 0,
			startWeek: '',
			valid: false,
			invalidField: ''
		};
		let validCurrencies = config.CURRENCIES.split(',');
		if (req.params.base && _.findIndex(req.params.base, validCurrencies) !== -1) {
			result.base = req.params.base;
		} else {
			result.invalidField = 'base';
			return result;
		}
		if (req.params.target && _.findIndex(req.params.target, validCurrencies) !== -1) {
			result.target = req.params.target;
		} else {
			result.invalidField = 'target';
			return result;
		}
		if (req.params.weeks && !isNaN(parseInt(req.params.weeks))) {
			let parsedWeeks = parseInt(req.params.weeks);
			if (parsedWeeks > 0 && parsedWeeks <= 25) {
				result.weeks = parsedWeeks;
			} else {
				result.invalidField = 'weeks';
				return result;
			}
		} else {
			result.invalidField = 'weeks';
			return result;
		}
		if (req.params.start) {
			let start = moment(req.params.start, 'YYYY-WW', true);
			if (start.isValid()) {
				result.startWeek = start.format('YYYY-WW');
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