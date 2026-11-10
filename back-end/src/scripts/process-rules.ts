import * as fs from 'fs';
import csv from 'csv-parser';
import { exec } from 'child_process';
import { promisify } from 'util';
import { ThreatsService } from '../threats/threats.service';
import axios from 'axios';

const execAsync = promisify(exec);

const NUM_ITERATIONS = 501;
const INPUT_FILE = './data/RULES.csv';
const OUTPUT_FILE_PREFIX = './data/NEW_RULES_NUM';
const LLM_URL = 'http://localhost:11434';

export const AVAILABLE_MODELS = ['mistral:7b','llama3.2:3b','mixtral:8x7b','gemma3:12b'] as const;
// export const AVAILABLE_MODELS = ['mixtral:8x7b','gemma3:12b'] as const;
export type ModelName = typeof AVAILABLE_MODELS[number];

const fewShotExamples = `
**Ejemplos de respuestas correctas**:

- Ejemplo correcto 1:
  1,-1,1,-1,1,-1,1,-1,1,-1,1,-1,1,-1,1,-1,1,-1,1,-1,1,-1,1,-1

- Ejemplo correcto 2:
  1,1,-1,-1,-1,1,1,-1,1,1,-1,-1,1,-1,1,-1,1,1,-1,1,1,-1,1,-1

- Ejemplo correcto 3:
  -1,1,-1,1,-1,-1,1,-1,1,1,-1,-1,1,-1,-1,1,-1,1,-1,1,-1,1,-1,1
`;

const PROMPT_TEMPLATE = `
    **Contexto**:
    Evalúa si los siguientes campos de activos de una PYME son afectados por la amenaza "{threatId}".

    **Descripción de la amenaza**:
    "{threatDescription}"

    **Contexto de la PYME**:
    - Presupuesto ajustado: Soluciones prácticas y económicas.
    - Prioridad: Cumplir con regulaciones básicas sin invertir en costos elevados.
    - Enfoque: Solo lo esencial para cumplir con regulaciones básicas.

    **Campos a evaluar (responde con EXACTAMENTE 24 valores separados por comas, usando "1" o "-1")**:
    "{fieldsList}"

    **Instrucciones CRÍTICAS**:
    1. **Responde SIEMPRE con 24 valores numéricos**, separados por comas.
    2. Cada valor debe ser "1" (relevante) o "-1" (no relevante).
    3. **NO** incluyas texto, explicaciones, puntos y comas, ni caracteres adicionales.
    4. Si un campo no aplica, usa "-1".
    5. ${fewShotExamples}
    6. **Ejemplo incorrecto**: 1,-1,1 o v1:1, v2:-1, ...

    **Verificación**:
    - Cuenta los valores separados por comas en tu respuesta. Deben ser exactamente 24.
    - Si no lo son, la respuesta será inválida y se ignorará.
`.trim();

export async function getThreatDescription(threatsService: ThreatsService, threatId: string): Promise<string> {
    const threat = await threatsService.findByThreatId(threatId);
    return threat?.description || `Descripción no encontrada para ${threatId}`;
}

async function startOllamaDocker(): Promise<void> {
  try {
        await axios.get('http://localhost:11434/api/tags');
    } catch (error) {
        console.log('Ollama no se encuentra en ejecución. Iniciando...');
        try {
            // await execAsync('sudo docker start ollama');
            await execAsync('docker start ollama');
        } catch (startError) {
        console.log('Contenedor no existe. Creando uno nuevo...');
            // await execAsync('sudo docker run -d -v ollama_data:/root/.ollama -p 11434:11434 --name ollama ollama/ollama');
            await execAsync('docker run -d -v ollama_data:/root/.ollama -p 11434:11434 --name ollama ollama/ollama');
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
}

export async function queryModel(model: ModelName, prompt: string): Promise<string> {
    try {
        const response = await axios.post(`${LLM_URL}/api/generate`, {
            model,
            prompt,
            stream: false,
        });
        const output = response.data.response.trim().toLowerCase();
        return output;
    } catch (error: any) {
        if (error.response?.status === 404) {
            console.error(`Modelo ${model} no encontrado. Descargando...`);
            // await execAsync(`sudo docker exec ollama ollama pull ${model} 2>/dev/null`);
            await execAsync(`docker exec ollama ollama pull ${model} 2>/dev/null`);
            return await queryModel(model, prompt);
        }
        console.error(`Error al consultar ${model}:`, error.message);
        return "-1";
    }
}

export async function generateSumsCSV(model: ModelName, threatsService: ThreatsService, inputFile: string = INPUT_FILE, outputFilePrefix: string = OUTPUT_FILE_PREFIX): Promise<string> {
    await startOllamaDocker();

    const metrics = {
        totalThreats: 0,
        avgResponseTime: 0,
        validResponses: 0,
        response23Errors: 0,
        responseLessThan23Errors: 0,
        responseMoreThan24Errors: 0,
        totalErrors: 0
    };

    const logFileName = `${outputFilePrefix}_${model.replace(':', '_').replace('/', '_')}.log`;
    let executionCount = 0;
    if (fs.existsSync(logFileName)) {
        const logContent = fs.readFileSync(logFileName, 'utf8');
        const firstLine = logContent.split('\n')[0];
        if (firstLine.startsWith('Ejecuciones:')) {
            executionCount = parseInt(firstLine.split(':')[1].trim(), 10);
        }
    }
    executionCount++;

    const threats: Record<string, any> = {};
    const fields: string[] = [];

    await new Promise((resolve, reject) => {
        fs.createReadStream(inputFile)
            .pipe(csv())
            .on('data', (row) => {
                const threatId = row.Codigo;
                delete row.Codigo;
                threats[threatId] = row;
                if (fields.length === 0) {
                    fields.push(...Object.keys(row));
                }
            })
            .on('end', resolve)
            .on('error', reject);
    });

    if (Object.keys(threats).length === 0) {
        throw new Error('No se encontraron amenazas en el archivo CSV.');
    }

    console.log(`Procesando ${Object.keys(threats).length} amenazas...`);

    metrics.totalThreats = Object.keys(threats).length;

    const results: Record<string, Record<string, number>> = {};

    for (const [threatId, threatData] of Object.entries(threats)) {
        const threatDescription = await getThreatDescription(threatsService, threatId);
        results[threatId] = {};

        console.log(`\nProcesando amenaza ${threatId}: ${threatDescription.substring(0, 50)}...`);

        const fieldsList = fields.join(', ');

        const prompt = PROMPT_TEMPLATE
            .replace('{threatId}', threatId)
            .replace('{threatDescription}', threatDescription)
            .replace('{fieldsList}', fieldsList);

        const fieldSums: number[] = new Array(fields.length).fill(0);
        let totalIterationTime = 0;

        for (let j = 0; j < NUM_ITERATIONS; j++) {
            const startTime = performance.now();
            const rawResponse = await queryModel(model, prompt);
            const endTime = performance.now();
            totalIterationTime += (endTime - startTime);
            console.log(`Respuesta del modelo (${threatId} iteración ${j + 1}):`, rawResponse);

            const cleanedResponse = rawResponse.trim().replace(/\s+/g, '');
            let responseArray = cleanedResponse.split(',').map(Number);

            // console.log('Array procesado:', responseArray);

            if (responseArray.length === fields.length) {
                responseArray.forEach((value, index) => {
                    fieldSums[index] += value;
                });
                metrics.validResponses++;
            } else {
                metrics.totalErrors++;
                if (responseArray.length === 23) {
                    responseArray = [...responseArray, responseArray[22]];
                    metrics.response23Errors++;
                } else if (responseArray.length < fields.length) {
                    responseArray = [...responseArray, ...new Array(fields.length - responseArray.length).fill(-1)];
                    metrics.responseLessThan23Errors++;
                } else if (responseArray.length > fields.length) {
                    responseArray = responseArray.slice(0, fields.length);
                    metrics.responseMoreThan24Errors++;
                }

                responseArray.forEach((value, index) => {
                    fieldSums[index] += value;
                });
            }

            process.stdout.write(responseArray.join(', ') + ' ');
        }

        metrics.avgResponseTime = totalIterationTime / NUM_ITERATIONS;

        process.stdout.write(`(Sumas: [${fieldSums.join(', ')}]) `);
        fields.forEach((field, index) => {
            results[threatId][field] = fieldSums[index];
        });
    }

    const headers = ['Codigo', ...fields];
    const outputFile = `${outputFilePrefix}_${model.replace(':', '_').replace('/', '_')}.csv`;
    const csvRows: string[] = [headers.join(',')];
    for (const [threatId, fieldSums] of Object.entries(results)) {
        const row = [threatId, ...fields.map(field => fieldSums[field]?.toString() || '')];
        csvRows.push(row.join(','));
    }

    fs.writeFileSync(outputFile, csvRows.join('\n'));
    console.log(`\nCSV guardado en ${outputFile}`);

    const metricsLog = `
    === MÉTRICAS PARA MODELO: ${model} ===
    Ejecución #${executionCount}
    Iteraciones de Prompt: ${NUM_ITERATIONS}
    - Amenazas procesadas: ${metrics.totalThreats}
    - Tiempo promedio por iteración: ${(metrics.avgResponseTime).toFixed(2)} ms
    - Respuestas válidas: ${metrics.validResponses}/${metrics.totalThreats * executionCount} (${((metrics.validResponses / (metrics.totalThreats * executionCount) ) * 100).toFixed(2)}%)
    - Errores totales: ${metrics.totalErrors}
    - Arrays de 23: ${metrics.response23Errors}
    - Arrays <23: ${metrics.responseLessThan23Errors}
    - Arrays >24: ${metrics.responseMoreThan24Errors} \n
    `.trim();

    if (fs.existsSync(logFileName)) {
        fs.appendFileSync(logFileName, '\n' + metricsLog);
    } else {
        fs.writeFileSync(logFileName, metricsLog);
    }

    console.log(`Métricas guardadas en ${logFileName}`);

    return outputFile;
}

export async function testAllModels(threatsService: ThreatsService, inputFile: string = './data/RULES.csv', outputFilePrefix: string = './data/NEW_RULES_NUM'): Promise<{ message: string; files: string[] }> {
    const files: string[] = [];
    for (const model of AVAILABLE_MODELS) {
        console.log(`\n=== PROBANDO MODELO: ${model} ===`);
        const outputFile = await generateSumsCSV(model, threatsService, inputFile, outputFilePrefix);
        files.push(outputFile);
    }
    return { message: 'Todos los modelos procesados', files };

}
