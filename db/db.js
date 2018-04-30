'use strict';

const _ = require('lodash/fp');
const moment = require('moment');
const sqlite3 = require('sqlite3');

const dbModule = () => {
	let connection;

	const initFn = (fileName) => {
		console.log('Database initialized in', fileName);
		connection = new sqlite3.Database(fileName, createTable);
	}

	const getHistoryFn = (base, target, start, weeks, callback) => {
		let endYear = moment().year();
		let startYear = moment(start, 'YYYY-WW', true);
		let limit = moment().subtract(startYear).weeks();
		connection.all(`SELECT * FROM history
			WHERE base = $1
			AND target = $2
			AND week LIKE '$3-%'
			ORDER BY week DESC
			LIMIT $4;
		`, [base, target, startYear.year(), limit], callback);
	}

	const insertHistoryFn = (base, target, week) => {

	}

	const createTable = () => {
		// WEEK will be in format YYYY-WW
		connection.run(`
			CREATE TABLE IF NOT EXISTS history (
				base TEXT,
				target TEXT,
				value REAL,
				week TEXT
			)
		`);
	}

	const closeFn = () => {
		console.log('Closing database connection.');
		connection.close();
	}
	
	return {
		init: initFn,
		getHistory: getHistoryFn,
		insertHistory: insertHistoryFn,
		close: closeFn
	};
};

module.exports = dbModule();