import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { assetsProviders } from './assets.providers';
import { MongooseModule } from '@nestjs/mongoose';
import { Asset, AssetSchema } from './schemas/asset.schema';
import { ThreatsModule } from '../threats/threats.module';
import { VulnerabilitiesModule } from '../vulnerabilities/vulnerabilities.module';

@Module({
  imports: [MongooseModule.forFeature([{name: Asset.name, schema: AssetSchema}]), DatabaseModule, ThreatsModule, VulnerabilitiesModule],
  controllers: [AssetsController],
  providers: [...assetsProviders, AssetsService],
  exports: [...assetsProviders, AssetsService],
})
export class AssetsModule {}
