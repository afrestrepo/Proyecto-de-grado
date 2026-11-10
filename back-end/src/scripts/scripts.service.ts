// src/scripts/scripts.service.ts
import { Injectable } from '@nestjs/common';
import { ThreatsService } from '../threats/threats.service';
import { testAllModels, generateSumsCSV, ModelName, AVAILABLE_MODELS } from './process-rules';

@Injectable()
export class ScriptsService {
    constructor(private readonly threatsService: ThreatsService) {}

    async runAllModels(): Promise<{ message: string; files: string[] }> {
        return testAllModels(
            this.threatsService,
            './data/RULES.csv',
            './data/NEW_RULES_NUM'
        );
    }

    async runSingleModel(model: ModelName): Promise<string> {
        return generateSumsCSV(
        model,
        this.threatsService,
        './data/RULES.csv',
        './data/NEW_RULES_NUM'
        );
    }
}