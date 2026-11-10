import mongoose, { HydratedDocument } from "mongoose";
import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';

export type AssetDocument = HydratedDocument<Asset>;
// This schema itselft would represent a company, which in our model it is just represented by its assets. No more information would be needed.
@Schema()
export class Asset {
    @Prop({ required: true, unique: true })
    id: string;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    description: string;

    @Prop(raw({
        computador_escritorio: { type: Boolean, default: false },
        laptop: { type: Boolean, default: false },
        celular_convencional: { type: Boolean, default: false },
        celular_inteligente: { type: Boolean, default: false },
        telefono_fijo: { type: Boolean, default: false },
        captura_dmc: { type: Boolean, default: false },
        datafono: { type: Boolean, default: false },  // candidato a lista
        radiotelefono: { type: Boolean, default: false },
        lector_codigos: { type: Boolean, default: false },
        agenda_personal: { type: Boolean, default: false },
        wearables: { type: Boolean, default: false },
        dispositivos_red: { type: Boolean, default: false },  // candidato a lista
        // cuales_dispositivos: { type: [String], default: [] },
    }))
    dispositivos: Record<string, any>;

    @Prop(raw({
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
            cuales_aplicaciones: { type: [String], default: [] },
        },
        especifico: {
            erp: { type: Boolean, default: false },
            crm: { type: Boolean, default: false },
            cuales_aplicaciones: { type: [String], default: [] },
        }
    }))
    software: Record<string, any>;

    @Prop(raw({
        servicios_web_clientes: { type: [String], default: [] },
        servicios_web_operacion: { type: [String], default: [] },
    }))
    servicios_web: Record<string, any>;

    @Prop(raw({
        apps_servicios_internet: { type: Boolean, default: false },
        admin_dispositivos: { type: Boolean, default: false },
        admin_redes_servidores: { type: Boolean, default: false },
        admin_apps: { type: Boolean, default: false },
        admin_servicio_web: { type: Boolean, default: false },
    }))
    acceso_personas: Record<string, any>;

    @Prop(raw({
        personal: {
            nombre: { type: Boolean, default: false },
            identificacion: { type: Boolean, default: false },
            direccion: { type: Boolean, default: false },
            telefono: { type: Boolean, default: false },
        },
        general: {
            id_req_compra: { type: Boolean, default: false },
            id_recibo_pago: { type: Boolean, default: false },
        }
    }))
    informacion_clientes: Record<string, any>;

    @Prop(raw({
        nombre: { type: Boolean, default: false },
        nit: { type: Boolean, default: false },
        direccion: { type: Boolean, default: false },
        telefono: { type: Boolean, default: false },
        redes_sociales: { type: Boolean, default: false },
        medios_comunicacion: { type: Boolean, default: false },
    }))
    datos_corporativos: Record<string, any>;

    @Prop(raw({
        nombre: { type: Boolean, default: false },
        nit: { type: Boolean, default: false },
        direccion: { type: Boolean, default: false },
        telefono: { type: Boolean, default: false },
        redes_sociales: { type: Boolean, default: false },
        medios_comunicacion: { type: Boolean, default: false },
    }))
    datos_empleados: Record<string, any>;

     @Prop([{
        threatId: { type: String, required: true },
        threatMongoId: { type: mongoose.Types.ObjectId, required: true, ref: 'Threat' },
        affectedFields: { type: mongoose.Schema.Types.Mixed, default: {} },
        description: { type: String },
        // severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] }
    }])
    vulnerableThreats: {
        threatId: string;
        threatMongoId: mongoose.Types.ObjectId;
        affectedFields: Record<string, any>;
        description?: string;
        // severity?: string;
    } [];

    @Prop([
        {
            _id: {
                type: mongoose.Types.ObjectId,
                required: true,
            },
            cveId: {
                type: String,
            },
            metrics: {
                type: mongoose.Schema.Types.Mixed,
            },
            problemTypes: {
                type: mongoose.Schema.Types.Mixed,
            },
            lastUpdatedDate: {
                type: Date,
            },
        },
    ])
    vulnerabilities?: Array<{
        _id: mongoose.Types.ObjectId;
        cveId?: string;
        metrics?: any;
        problemTypes?: any;
        lastUpdatedDate?: Date;
    }>;

    @Prop([
        {
            _id: {
                type: mongoose.Types.ObjectId,
                required: true,
            },
            cveId: {
                type: String,
            },
            metrics: {
                type: mongoose.Schema.Types.Mixed,
            },
            problemTypes: {
                type: mongoose.Schema.Types.Mixed,
            },
            lastUpdatedDate: {
                type: Date,
            },
        },
    ])
    commonVulnerabilities?: Array<{
        _id: mongoose.Types.ObjectId;
        cveId?: string;
        metrics?: any;
        problemTypes?: any;
        lastUpdatedDate?: Date;
    }>;

    @Prop({ type: Date, default: Date.now })
    createdAt?: Date;

    @Prop({ type: Date, default: Date.now })
    updatedAt?: Date;


}

export const AssetSchema = SchemaFactory.createForClass(Asset);