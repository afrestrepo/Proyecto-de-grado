import { Connection } from 'mongoose';
import { VulnerabilitySchema } from './schemas/vulnerability.schema';

export const vulnerabilitiesProviders = [
    {
        provide: 'VULNERABILITY_MODEL',
        useFactory: (connection: Connection) => connection.model('Vulnerability', VulnerabilitySchema),
        inject: ['DATABASE_CONNECTION'],
    },
];
