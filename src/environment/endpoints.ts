import { config } from 'dotenv'
import * as path from 'path'

import * as serviceAccountDev from './sewing-notebook-service-account.json';
import * as serviceAccountTest from './sewing-notebook-service-account-test.json';

export const NODE_ENV = (process.env.NODE_ENV || 'development') as 'test' | 'development' | 'production'

// config() does not override loaded env variable, so load overrides first
if (NODE_ENV === 'test') config({ path: path.resolve(process.cwd(), '.env.test') })
config()

console.log('Run in ' + NODE_ENV + ' mode');

export const serviceAccount = NODE_ENV === 'test' ?
  {
    projectId: serviceAccountTest.project_id,
    clientEmail: serviceAccountTest.client_email,
    privateKey: serviceAccountTest.private_key
  } :
  {
    projectId: serviceAccountDev.project_id,
    clientEmail: serviceAccountDev.client_email,
    privateKey: serviceAccountDev.private_key
  };

function getOrThrow(name: string) {
  const val = process.env[name]
  if (typeof val === 'undefined') throw new Error(`Missing mandatory environment variable ${name}`)
  return val
}
