import 'reflect-metadata';
import { ThreatsService } from '../threats/threats.service';
import * as XLSX from 'xlsx';
import * as path from 'path';

function toBoolean(value: any): boolean {
    return value === true ||
           value === 'TRUE' ||
           value === 'true' ||
           value === 1 ||
           value === '1';
}

function setNestedValue(obj: any, path: string[], value: boolean) {
    let current = obj;

    for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];

        if (!current[key]) {
            current[key] = {};
        }

        current = current[key];
    }

    current[path[path.length - 1]] = value;
}

export async function loadRulesXlsx(threatsService: ThreatsService) {

    const filePath = path.resolve(__dirname, '../../data/RULES.xlsx');

    const workbook = XLSX.readFile(filePath);

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const jsonData: Array<Record<string, any>> =
        XLSX.utils.sheet_to_json(worksheet);

    const columnMap: Record<string, string[]> = {

        dispositivos: ['dispositivos'],

        navegador_internet: ['software', 'general', 'navegador_internet',],

        sistema_operativo: ['software', 'general', 'sistema_operativo',],

        sistema_operativo_movil: ['software', 'general', 'sistema_operativo_movil',],

        software_ofimatico: ['software',  'general', 'software_ofimatico',],

        antivirus: ['software', 'general', 'antivirus',],

        servidor_web: ['software', 'general', 'servidor_web',],

        gestion_operacion: ['software', 'general', 'gestion_operacion',],

        base_datos: ['software', 'general', 'base_datos',],

        seguridad: ['software', 'general', 'seguridad',],

        gestion_red: ['software', 'general', 'gestion_red',],

        erp: ['software', 'especifico', 'erp'],

        crm: ['software', 'especifico', 'crm'],

        servicios_web_clientes: ['servicios_web', 'servicios_web_clientes'],

        servicios_web_operacion: ['servicios_web', 'servicios_web_operacion'],

        apps_servicios_internet: ['acceso_personas', 'apps_servicios_internet'],

        admin_dispositivos: ['acceso_personas', 'admin_dispositivos'],
        
        admin_redes_servidores: ['acceso_personas', 'admin_redes_servidores'],

        admin_apps: ['acceso_personas', 'admin_apps'],

        admin_servicio_web: ['acceso_personas', 'admin_servicio_web'],

        personal: ['informacion_clientes', 'personal'],

        general: ['informacion_clientes', 'general'],

        datos_corporativos: ['datos_corporativos'],

        datos_empleados: ['datos_empleados'],
    };

    for (const row of jsonData) {
        try {
            const threatId = row['Código'];
            // console.log(threatId);
            if ( !threatId || threatId.toLowerCase() === 'codigo' ) {
                continue;
            }
            // console.log(row)
            const vulnerableAssets: Record<string, any> = {};

            for (const [columnName, pathArray] of Object.entries(columnMap)) {

                const rawValue = row[columnName];

                const value = toBoolean(rawValue);

                setNestedValue(
                    vulnerableAssets,
                    pathArray,
                    value,
                );
            }

            await threatsService.updateVulnerableAssets(
                threatId,
                vulnerableAssets,
            );

            console.log(`Reglas para la amenaza "${threatId}" cargadas.`,);

        } catch (error: any) {

            console.error(
                `Error procesando la amenaza ${row['Código']}:`,
                error.message,
            );
        }
    }

    console.log('Todas las reglas han sido cargadas.');
}