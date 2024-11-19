import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

import { PROJECT_ID } from './constants.js';

const client = new SecretManagerServiceClient();

export async function accessSecret(secretName: string, version: string = 'latest') {
    try {
        // Full secret name
        const secretPath = `projects/${PROJECT_ID}/secrets/${secretName}/versions/${version}`;

        // Access the secret version
        const [ accessResponse ] = await client.accessSecretVersion({
            name: secretPath,
        });

        // Extract and return the payload
        const payload = accessResponse.payload?.data?.toString();
        return payload;
    } catch (error) {
        console.error('Error accessing secret:', error);
        throw error;
    }
}