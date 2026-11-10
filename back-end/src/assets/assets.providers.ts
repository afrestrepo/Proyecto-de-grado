import { Connection } from 'mongoose';
import { AssetSchema } from './schemas/asset.schema';

export const assetsProviders = [
  {
    provide: 'ASSET_MODEL',
    useFactory: (connection: Connection) => connection.model('Asset', AssetSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
