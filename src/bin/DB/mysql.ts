import * as mysql from 'mysql';
import {DB_HOST, DB_NAME, DB_PASSWORD, DB_USER} from '../../environment/endpoints';
import {logMessage} from "../logger";

export const DB = mysql.createConnection({
	host: DB_HOST,
	user: DB_USER,
	password: DB_PASSWORD,
	database: DB_NAME
});

DB.connect(function(err) {
	if (err) throw err;
	logMessage('Connected!');
});

export async function executeQuery(query: string): Promise<any> {
	return new Promise((resolve, reject) => {
		DB.query(query, (err, res) => {
			if (err) reject(err);
			else resolve(res);
		});
	});
}

export async function startTransaction(): Promise<void> {
	await executeQuery('START TRANSACTION;');
}

export async function commitTransaction(): Promise<void> {
	await executeQuery('COMMIT;');
}

export async function rollbackTransaction(): Promise<void> {
	await executeQuery('ROLLBACK;');
}
