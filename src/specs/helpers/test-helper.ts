import {executeQuery} from "../../bin/db/mysql";

const clearDBQueries = ['use sewing_test;',
  'SET SQL_SAFE_UPDATES = 0;',
  'delete from project_auth;',
  'delete from users;',
  'delete from supplies_required;',
  'delete from todos;',
  'delete from projects;',
  'delete from supplies;',
];

export async function clearDB(): Promise<void> {
  return new Promise((resolve) => {
    clearDBQueries.forEach(query => {
      void (async () => {
        await executeQuery(query);
      })();
    });
    resolve();
  });
}

before(async () => {
  await clearDB();
})
