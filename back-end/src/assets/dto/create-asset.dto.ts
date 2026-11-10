import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";

export class ServiciosWebDto {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  servicios_web_clientes?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  servicios_web_operacion?: string[];
}

export class CreateAssetDto {
    @IsString()
    @IsNotEmpty()
    readonly id?: string; // Si no se proporciona, se generará en el servicio

    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @IsString()
    @IsNotEmpty()
    readonly description: string;

    // --- Dispositivos ---
    @IsOptional()
    readonly dispositivos?: {
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
        // cuales_dispositivos?: string[];
    };

    // --- Software ---
    @IsOptional()
    readonly software?: {
        general?: {
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
        especifico?: {
        erp?: boolean;
        crm?: boolean;
        cuales_aplicaciones?: string[];
        };
    };

    @IsOptional()
    @ValidateNested()
    @Type(() => ServiciosWebDto)
    readonly servicios_web?: ServiciosWebDto;

    // --- Acceso de Personas ---
    @IsOptional()
    readonly acceso_personas?: {
        apps_servicios_internet?: boolean;
        admin_dispositivos?: boolean;
        admin_redes_servidores?: boolean;
        admin_apps?: boolean;
        admin_servicio_web?: boolean;
    };

    // --- Información de Clientes ---
    @IsOptional()
    readonly informacion_clientes?: {
        personal?: {
        nombre?: boolean;
        identificacion?: boolean;
        direccion?: boolean;
        telefono?: boolean;
        };
        general?: {
        id_req_compra?: boolean;
        id_recibo_pago?: boolean;
        };
    };

    // --- Datos Corporativos ---
    @IsOptional()
    readonly datos_corporativos?: {
        nombre?: boolean;
        nit?: boolean;
        direccion?: boolean;
        telefono?: boolean;
        redes_sociales?: boolean;
        medios_comunicacion?: boolean;
    };

    // --- Datos de Empleados ---
    @IsOptional()
    readonly datos_empleados?: {
        nombre?: boolean;
        nit?: boolean;
        direccion?: boolean;
        telefono?: boolean;
        redes_sociales?: boolean;
        medios_comunicacion?: boolean;
    };
}