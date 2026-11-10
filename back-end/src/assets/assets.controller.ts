import { Controller, Get, Post, Put, Delete, Param, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetDocument } from './schemas/asset.schema';
import { CreateAssetDto } from './dto/create-asset.dto';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

    @Post()
    create(@Body() createAssetDto: CreateAssetDto) {
        return this.assetsService.create(createAssetDto);
    }

    @Get()
    findAll() {
        return this.assetsService.findAll();
    }

    @Get(':id')
    findById(@Param('id') id: string) {
        return this.assetsService.findById(id);
    }

    @Get('/id/:id')
    async findBySecId(@Param('id') id: string) {
        const asset = await this.assetsService.findBySecId(id);
        if (!asset) {
            return { message: "Asset no encontrado", data: null };
        }
        return asset;
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateAssetDto: any) {
        return this.assetsService.update(id, updateAssetDto);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.assetsService.delete(id);
    }

    @Post(':id/identify-threats')
    async identifyThreats(@Param('id') id: string): Promise<AssetDocument> {
        try {
        const asset = await this.assetsService.identifyVulnerableThreats(id);
        if (!asset) {
            throw new HttpException(
            `Asset with ID ${id} not found or could not be updated.`,
            HttpStatus.NOT_FOUND,
            );
        }
        return asset;
        } catch (error) {
            if (error instanceof Error) {
                throw new HttpException(
                    `Error identifying threats for asset ${id}: ${error.message}`,
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
            throw new HttpException(
                `Unexpected error identifying threats for asset ${id}.`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Endpoint para obtener las amenazas vulnerables de un activo (empresa).
     * @param id - ID del activo (empresa).
     * @returns {Promise<AssetDocument>} Activo con sus amenazas vulnerables.
     * @throws {HttpException} Si el activo no existe.
     */
    @Get(':id/threats')
    async getVulnerableThreats(@Param('id') id: string): Promise<AssetDocument> {
        const asset = await this.assetsService.findById(id);
        if (!asset) {
        throw new HttpException(
            `Asset with ID ${id} not found.`,
            HttpStatus.NOT_FOUND,
        );
        }
        return asset;
    }

    @Post(':id/identify-specific-vulnerabilities')
    async identifySpecificVulnerabilities(@Param('id') id: string) {
        return this.assetsService.identifySpecificVulnerabilities(id);
    }

    @Post(':id/identify-common-vulnerabilities')
    async identifyCommonVulnerabilities(@Param('id') id: string) {
        return this.assetsService.identifyCommonVulnerabilities(id);
    }

    @Post(':id/identify-vulnerabilities')
    async identifyAllVulnerabilities(@Param('id') id: string): Promise<AssetDocument> {
        await this.identifySpecificVulnerabilities(id);
        return this.identifyCommonVulnerabilities(id);
    }
}
