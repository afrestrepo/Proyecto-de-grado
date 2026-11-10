import { ThreatsService } from '../threats/threats.service';
import * as XLSX from 'xlsx';
import * as path from 'path';

export async function seedThreats(threatsService: ThreatsService,) {

    const filePath = path.resolve(__dirname, '../../data/Templates_v1.xlsx');
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[1];
    const worksheet = workbook.Sheets[sheetName];

    const jsonData: Array<Record<string, any>> = XLSX.utils.sheet_to_json(worksheet);

    for (const row of jsonData) {
        // console.log(row);
        try {
            const threatId = row.__EMPTY_5;

            if  (threatId.toLowerCase() === 'código'.toLowerCase()) {
                //console.warn(`Fila con código "${threatId}" se omitirá.`);
                continue;
            }

            const description = row.__EMPTY_6 || '';

            if (!description) {
                // console.warn(`La amenaza con código "${threatId}" no tiene descripción. Se omitirá.`);
                continue;
            }
            
            const threatDto: any = {
                id: threatId,
                description: description,
                affects: {
                    confidentiality: (row.__EMPTY_7 === 'x' || row.__EMPTY_7 === 'S') || false,
                    integrity: (row.__EMPTY_8 === 'x' || row.__EMPTY_8 === 'S') || false,
                    availability: (row.__EMPTY_9 === 'x' || row.__EMPTY_9 === 'S') || false,
                },
                assets: {
                    data: (row.__EMPTY_10 === 'x' || row.__EMPTY_10 === 'S') || false,
                    services: (row.__EMPTY_11 === 'x' || row.__EMPTY_11 === 'S') || false,
                },
                people: (row.__EMPTY_12 === 'x' || row.__EMPTY_12 === 'S') || false,
                
                origin: {
                    accidental: false,
                    deliberate: false,
                    environmental: false,
                },
                
            };

            const originColumn = row.__EMPTY_13 || '';
            if (typeof originColumn === 'string' && originColumn.trim() !== '') {
                const originInitials: string[] = originColumn
                    .split(',')
                    .map((initial: string) => initial.trim().toUpperCase())
                    .filter((initial: string) => initial !== '');

                for (const initial of originInitials) {
                    switch (initial) {
                        case 'A':
                        threatDto.origin.accidental = true;
                        break;
                        case 'D':
                        threatDto.origin.deliberate = true;
                        break;
                        case 'E':
                        threatDto.origin.environmental = true;
                        break;
                        default:
                        console.warn(`Inicial de origen no reconocida: "${initial}" en la amenaza "${threatId}".`);
                    }
                }
                
            }

        const threat = await threatsService.create(threatDto);
        // console.log(`Amenaza "${threat.id}" creada: ${threat.description}.`);
    } catch (error) {
      // console.error(`Error procesando la amenaza con ID ${row.ID}:`, error);
    }
  }
  console.log('Todas las amenazas han sido procesadas.');
}