import { Document } from 'mongoose';

export interface Asset extends Document {
    readonly id: string;
    readonly name: string;
    readonly description: string;

    readonly dispositivos: {
        computador_escritorio?: boolean;
        laptop?: boolean;
        celular_convencional?: boolean;
        celular_inteligente?: boolean;
        telefono_fijo?: boolean;
        captura_dmc?: boolean;
        datafono?: boolean;
        radiotelefono?: boolean;
        lector_codigos?: boolean;
        agenda_personal?: boolean;
        wearables?: boolean;
        dispositivos_red?: boolean;
    };

    readonly software: {
        general: {
            sistema_operativo?: boolean;
            sistema_operativo_movil?: boolean;
            navegador_internet?: boolean;
            administrador_correo_elec?: boolean;
            software_ofimatico?: boolean;
            antivirus?: boolean;
            servidor_web?: boolean;
            gestion_operacion?: boolean;
            base_datos?: boolean;
            seguridad?: boolean;
            gestion_red?: boolean;
            cuales_aplicaciones?: string[];
        };
        especifico: {
            erp?: boolean;
            crm?: boolean;
            cuales_aplicaciones?: string[];
        };
    };

    readonly servicios_web: {
        servicios_web_clientes?: string[];
        servicios_web_operacion?: string[];
    };

    readonly acceso_personas: {
        apps_servicios_internet?: number;
        admin_dispositivos?: number;
        admin_redes_servidores?: number;
        admin_apps?: number;
        admin_servicio_web?: number;
    };

    readonly informacion_clientes: {
        personal: {
            nombre?: boolean;
            identificacion?: boolean;
            direccion?: boolean;
            telefono?: boolean;
        };
        general: {
            id_req_compra?: boolean;
            id_recibo_pago?: boolean;
        };
    };

    readonly datos_corporativos: {
        nombre?: boolean;
        nit?: boolean;
        direccion?: boolean;
        telefono?: boolean;
        redes_sociales?: boolean;
        medios_comunicacion?: boolean;
    };

    readonly datos_empleados: {
        nombre?: boolean;
        nit?: boolean;
        direccion?: boolean;
        telefono?: boolean;
        redes_sociales?: boolean;
        medios_comunicacion?: boolean;
    };

    readonly createdAt?: Date;
    readonly updatedAt?: Date;
}