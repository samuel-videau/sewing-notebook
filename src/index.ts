import { fastify } from './lib/fastify'
import * as admin from 'firebase-admin';
import {app, credential} from "firebase-admin";
import {serviceAccount} from "./environment/endpoints";

admin.initializeApp({
  credential: credential.cert(serviceAccount)
});

fastify.listen(process.env.PORT ?? 3000).catch(console.error);
