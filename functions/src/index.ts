import './config/firebase.config';
import { onRequest } from 'firebase-functions/v2/https';
import { createApp } from './app';

const app = createApp();

export const api = onRequest(
    {
        region: 'us-central1',
        memory: '256MiB',
        timeoutSeconds: 60,
    },
    app,
);
