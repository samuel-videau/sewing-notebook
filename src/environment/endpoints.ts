import * as serviceAccountDev from './sewing-notebook-service-account.json';
import * as serviceAccountTest from './sewing-notebook-service-account-test.json';

const ENV = process.env.ENV ? process.env.ENV : 'DEV';

export const serviceAccount = ENV === 'DEV' ? {
  projectId: serviceAccountDev.project_id,
  clientEmail: serviceAccountDev.client_email,
  privateKey: serviceAccountDev.private_key
} :
  {
    projectId: serviceAccountTest.project_id,
    clientEmail: serviceAccountTest.client_email,
    privateKey: serviceAccountTest.private_key
  };
