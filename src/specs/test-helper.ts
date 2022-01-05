import * as admin from 'firebase-admin';
import {credential} from "firebase-admin";
import {serviceAccount} from "../environment/endpoints";

before(async function () {
    admin.initializeApp({
        credential: credential.cert(serviceAccount)
    });
})