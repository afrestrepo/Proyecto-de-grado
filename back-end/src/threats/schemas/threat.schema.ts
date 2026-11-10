import { HydratedDocument } from "mongoose";
import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ThreatDocument = HydratedDocument<Threat>;

@Schema()
export class Threat {
    @Prop({ required: true, unique: true })
    id: string;

    @Prop({ required: true })
    description: string;

    @Prop(raw({
        confidentiality: {type: Boolean},
        integrity: {type: Boolean},
        availability: {type: Boolean},
    }))
    affects: Record<string, any>;

    @Prop(raw({
        data: {type: Boolean},
        services: {type: Boolean},
    }))
    assets: Record<string, any>;

    @Prop({ type: Boolean, default: false })
    people: Boolean;

    @Prop(raw({
        accidental: { type: Boolean, default: false },
        deliberate: { type: Boolean, default: false },
        environmental: { type: Boolean, default: false },
    }))
    origin: Record<string, any>;

    @Prop(raw({
        dispositivos: { type: Boolean, default: false },
        software: {
            general: {
                navegador_internet: { type: Boolean, default: false },
                sistema_operativo: { type: Boolean, default: false },
                sistema_operativo_movil: { type: Boolean, default: false },
                administrador_correo_elec: { type: Boolean, default: false },
                software_ofimatico: { type: Boolean, default: false },
                antivirus: { type: Boolean, default: false },
                servidor_web: { type: Boolean, default: false },
                gestion_operacion: { type: Boolean, default: false }, 
                base_datos: { type: Boolean, default: false },  
                seguridad: { type: Boolean, default: false }, 
                gestion_red: { type: Boolean, default: false },
            },
            especifico: {
                erp: { type: Boolean, default: false },
                crm: { type: Boolean, default: false },
            },
        },
        servicios_web: {
            servicios_web_clientes: { type: Boolean, default: false },
            servicios_web_operacion: { type: Boolean, default: false },
        },
        acceso_personas: {
            apps_servicios_internet: { type: Boolean, default: false },
            admin_dispositivos: { type: Boolean, default: false },
            admin_redes_servidores: { type: Boolean, default: false },
            admin_apps: { type: Boolean, default: false },
            admin_servicio_web: { type: Boolean, default: false },
        },
        informacion_clientes: {
            personal: { type: Boolean, default: false },
            general: { type: Boolean, default: false },
        },
        datos_corporativos: { type: Boolean, default: false },
        datos_empleados: { type: Boolean, default: false },
    }))
    vulnerable_assets: Record<string, any>;

    @Prop({ type: String, required: true, default:"not_logged" })
    logging_level: string;
}

export const ThreatSchema = SchemaFactory.createForClass(Threat);