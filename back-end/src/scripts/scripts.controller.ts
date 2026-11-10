// src/scripts/scripts.controller.ts
import { Controller, Post, Param, Get } from '@nestjs/common';
import { ScriptsService } from './scripts.service';
import { AVAILABLE_MODELS } from './process-rules';

@Controller('scripts')
export class ScriptsController {
    constructor(private readonly scriptsService: ScriptsService) {}

    @Post('run-all-models')
    async runAllModels() {
        return this.scriptsService.runAllModels();
    }

    @Post('run-model/:model')
    async runModel(@Param('model') model: string) {
        if (!AVAILABLE_MODELS.includes(model as any)) {
            return { error: `Modelo no válido. Opciones: ${AVAILABLE_MODELS.join(', ')}` };
        }
        const outputFile = await this.scriptsService.runSingleModel(model as any);
        return { message: `Modelo ${model} procesado`, file: outputFile };
    }

    @Get('status')
    getStatus() {
        return { status: 'OK', message: 'El endpoint para ejecutar scripts disponible' };
    }
}