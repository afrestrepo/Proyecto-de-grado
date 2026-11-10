
import { Connection } from 'mongoose';
import { ThreatSchema } from './schemas/threat.schema';

/* Warning
In the real-world applications you should avoid magic strings. Both CAT_MODEL and DATABASE_CONNECTION should be kept in the separated constants.ts file. 
  */
export const threatsProviders = [
    {
        provide: 'THREAT_MODEL',
        useFactory: (connection: Connection) => connection.model('Threat', ThreatSchema),
        inject: ['DATABASE_CONNECTION'],
    },
];