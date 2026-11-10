import { IsArray, IsBoolean, IsOptional, IsString, Matches } from "class-validator";

export class CreateThreatDto {
    @IsString()
    @Matches(/^[A-Za-z]+\d*$/, {
        message: 'El ID debe ser un código alfanumérico (ej: A1, THREAT-001)',
    })
    readonly id: string;

    @IsString()
    readonly description: string;

    @IsOptional()
    readonly affects?: {
        confidentiality?: boolean;
        integrity?: boolean;
        availability?: boolean;
    };

    @IsOptional()
    readonly assets?: {
        data?: boolean;
        services?: boolean;
    };

    @IsOptional()
    @IsBoolean()
    readonly people?: boolean;

    @IsOptional()
    readonly origin?: {
        accidental?: boolean;
        deliberate?: boolean;
        environmental?: boolean;
    };
}