'use strict';

const _ = require('lodash/fp');
const moment = require('moment');
const sqlite3 = require('sqlite3');

const dbModule = () => {
	let connection;
	const DATEFORMAT = 'YYYY-WW';

	const initFn = (fileName) => {
		console.log('Database initialized in', fileName);
		connection = new sqlite3.Database(fileName, createTable);
	}

	const getHistoryFn = (base, target, start, weeks, callback) => {
		let startYear = moment(start, DATEFORMAT, true);
		let endDate = moment(startYear).subtract(weeks, "weeks").format(DATEFORMAT);
		connection.all(`SELECT * FROM history
			WHERE base = ?
			AND target = ?
			AND week > ?
			ORDER BY week ASC;
		`, [base, target, endDate], callback);
	}

	const insertHistoryFn = (base, target, week, rate) => {
		console.log('Inserting to database:', base, target, week, rate);
		var statement = connection.prepare('INSERT INTO history VALUES (?,?,?,?)');
		statement.run([base, target, rate, week]);
		statement.finalize();
	}

	const createTable = () => {
		// WEEK will be in format YYYY-WW
		connection.run(`
			CREATE TABLE IF NOT EXISTS history (
				base TEXT,
				target TEXT,
				rate REAL,
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