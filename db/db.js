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
		let startYear = moment(start, 'YYYY-WW', true);
		let endYear = moment(startYear).subtract(weeks, "weeks");
		let limit = moment().diff(endYear, 'weeks');
		connection.all(`SELECT * FROM history
			WHERE base = ?
			AND target = ?
			AND (
				week LIKE ?
				OR week LIKE ?
			)
			ORDER BY week DESC
			LIMIT ?;
		`, [base, target, startYear.year() + '-%', endYear.year() + '-%', limit], callback);
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