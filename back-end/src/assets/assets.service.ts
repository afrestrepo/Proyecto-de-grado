import { Injectable } from '@nestjs/common';
import mongoose, { ClientSession, Connection, Model } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Asset, AssetDocument } from './schemas/asset.schema';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { ThreatsService } from '../threats/threats.service';
import { Vulnerability, VulnerabilityDocument } from '../vulnerabilities/schemas/vulnerability.schema';

function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

@Injectable()
export class AssetsService {
    constructor(
        @InjectConnection() private readonly connection: Connection,
        @InjectModel(Asset.name) private readonly assetModel: Model<AssetDocument>,
        @InjectModel(Vulnerability.name) private readonly vulnerabilityModel: Model<VulnerabilityDocument>, 
        private readonly threatsService: ThreatsService,
    ) {}
    // helpers
    async startTransaction() {
        const session = await this.connection.startSession();
        session.startTransaction();
        return session;
    }

    async commitTransaction(session: ClientSession): Promise<void> {
        await session.commitTransaction();
        session.endSession();
    }

    async abortTransaction(session: ClientSession): Promise<void> {
        await session.abortTransaction();
        session.endSession();
    }
    // end of helpers

    // crud
    async create(
        createAssetDto: CreateAssetDto,
        session?: ClientSession,
    ): Promise<AssetDocument> {
        const createdAsset = new this.assetModel(createAssetDto);
        if (session) {
        return createdAsset.save({ session });
        }
        return createdAsset.save();
    }

    async findAll(): Promise<AssetDocument[]> {
        return this.assetModel.find().exec();
    }

    async findById(id: string): Promise<AssetDocument | null> {
        return this.assetModel.findById(id).exec();
    }

    async findBySecId(id: string): Promise<AssetDocument | null> {
        return this.assetModel.findOne({ id }).exec();
    }

    async findByName(name: string): Promise<AssetDocument | null> {
        return this.assetModel.findOne({ name }).exec();
    }

    async update(
        id: string,
        updateAssetDto: UpdateAssetDto,
        session?: ClientSession,
    ): Promise<AssetDocument | null> {
        const options = { new: true };
        if (session) {
        return this.assetModel
            .findByIdAndUpdate(id, updateAssetDto, { ...options, session })
            .exec();
        }
        return this.assetModel
        .findByIdAndUpdate(id, updateAssetDto, options)
        .exec();
    }

    async delete(id: string, session?: ClientSession): Promise<AssetDocument | null> {
        if (session) {
        return this.assetModel.findByIdAndDelete(id, { session }).exec();
        }
        return this.assetModel.findByIdAndDelete(id).exec();
    }
    // end of crud

    // THREATS
    async identifyVulnerableThreats(assetId: string): Promise<AssetDocument> {
        const asset = await this.assetModel.findById(assetId).exec();
        if (!asset) {
            throw new Error(`Asset with ID ${assetId} not found`);
        }

        const threats = await this.threatsService.findAll();
        const vulnerableThreats = [];

        for (const threat of threats) {
            if (this.doesAssetMatchThreat(asset, threat.vulnerable_assets)) {
                vulnerableThreats.push({
                    threatId: threat.id,
                    threatMongoId: threat._id,
                    affectedFields: this.getAffectedFields(asset, threat.vulnerable_assets),
                    description: threat.description,
                });
            }
        }

        return this.assetModel.findByIdAndUpdate(assetId, { vulnerableThreats }, { new: true }).exec();
    }

    private doesAssetMatchThreat(asset: AssetDocument, vulnerableAssets: any): boolean {
        console.log('[DEBUG] Comparando asset con vulnerableAssets:');
        console.log('Asset:', JSON.stringify(asset, null, 2));
        console.log('VulnerableAssets:', JSON.stringify(vulnerableAssets, null, 2));

        return this.checkCategoryMatch(asset, vulnerableAssets);
    }

    private checkCategoryMatch(asset: any, vulnerableCategory: any): boolean {
        if (typeof vulnerableCategory !== 'object' || vulnerableCategory === null) {
            return false;
        }

        for (const [key, value] of Object.entries(vulnerableCategory)) {
            // Caso 1: Valor booleano en vulnerableCategory (ej: "dispositivos": true)
            if (value === true) {
                const assetValue = this.getNestedValue(asset, key);

                // Si el campo en el asset es un objeto (ej: dispositivos, datos_corporativos)
                if (typeof assetValue === 'object' && assetValue !== null) {
                    // Verificar si AL MENOS UN campo en el objeto es true
                    if (Object.values(assetValue).some((v: any) => v === true)) {
                        return true;
                    }
                }
                // Si el campo en el asset es un booleano directo
                else if (assetValue === true) {
                    return true;
                }
            }
            // Caso 2: Objeto anidado en vulnerableCategory (ej: "software": { general: { ... } })
            else if (typeof value === 'object' && value !== null) {
                const assetValue = this.getNestedValue(asset, key);
                if (assetValue && this.checkCategoryMatch(assetValue, value)) {
                    return true;
                }
            }
        }
        return false;
    }

    private getNestedValue(obj: any, path: string): any {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    private getAffectedFields(asset: Asset, vulnerableAssets: any): Record<string, any> {
        const affectedFields: Record<string, any> = {};

        for (const [category, value] of Object.entries(vulnerableAssets)) {
            // Caso 1: Valor booleano en vulnerableAssets (ej: "dispositivos": true)
            if (value === true) {
                const assetValue = this.getNestedValue(asset, category);
                if (typeof assetValue === 'object' && assetValue !== null) {
                    // Incluir todos los campos que son true en esta categoría
                    affectedFields[category] = Object.fromEntries(
                        Object.entries(assetValue).filter(([_, v]) => v === true)
                    );
                }
            }
            // Caso 2: Objeto anidado en vulnerableAssets (ej: "software": { general: { ... } })
            else if (typeof value === 'object' && value !== null) {
                const assetValue = this.getNestedValue(asset, category);
                if (assetValue) {
                    affectedFields[category] = this.getAffectedNestedFields(assetValue, value);
                }
            }
        }

        return affectedFields;
    }

    /**
     * Obtiene los campos afectados anidados.
     */
    private getAffectedNestedFields(assetCategory: any, vulnerableCategory: any): Record<string, any> {
        const affected: Record<string, any> = {};

        for (const [key, value] of Object.entries(vulnerableCategory)) {
            if (value === true) {
                const assetValue = assetCategory[key];
                if (typeof assetValue === 'object' && assetValue !== null) {
                    affected[key] = Object.fromEntries(
                        Object.entries(assetValue).filter(([_, v]) => v === true)
                    );
                } else if (assetValue === true) {
                    affected[key] = true;
                }
            } else if (typeof value === 'object' && value !== null) {
                const nestedAffected = this.getAffectedNestedFields(assetCategory[key] || {}, value);
                if (Object.keys(nestedAffected).length > 0) {
                    affected[key] = nestedAffected;
                }
            }
        }

        return affected;
    }

    // VULNERABILITIES
    /**
     * Identifica vulnerabilidades para software ESPECÍFICO (cuales_aplicaciones).
     * @param assetId - ID del activo.
     * @returns Asset con vulnerabilidades específicas en `vulnerabilities`.
     */
    async identifySpecificVulnerabilities(assetId: string): Promise<AssetDocument> {
        const asset = await this.assetModel.findById(assetId).exec();
        if (!asset) {
            throw new Error(`Asset with ID ${assetId} not found`);
        }

        const specificSoftware = this.extractSpecificSoftware(asset);

        if (specificSoftware.length === 0) {
            console.log('[DEBUG] No hay software específico para buscar vulnerabilidades.');
            return asset;
        }

        const regexPattern = new RegExp(`.*(${specificSoftware.map(escapeRegExp).join('|')}).*`,'i');

        const vulnerabilities = await this.vulnerabilityModel.find(
            {
                $or: [
                    { 'affected.product': { $in: specificSoftware } },
                    { 'affected.vendor': { $in: specificSoftware } },
                    { 'affected.product': regexPattern },
                    { 'affected.vendor': regexPattern },
                ],
                state: 'PUBLISHED',
            },
            {
                _id: 1,
                cveId: 1,
                metrics: 1,
                problemTypes: 1,
                lastUpdatedDate: 1,
            }
        ).exec();

        const mappedVulnerabilities = vulnerabilities.map(cve => ({
            _id: cve._id,
            cveId: cve.cveId,
            metrics: cve.metrics,
            problemTypes: cve.problemTypes,
            lastUpdatedDate: cve.lastUpdatedDate,
        }));

        return this.assetModel.findByIdAndUpdate(
            assetId,
            { vulnerabilities: mappedVulnerabilities },
            { new: true }
        ).exec();
    }

    /**
     * Identifica vulnerabilidades para software COMÚN (campos booleanos).
     * @param assetId - ID del activo.
     * @returns Asset con vulnerabilidades comunes (opcional: puedes guardarlas en otro campo).
     */
    async identifyCommonVulnerabilities(assetId: string): Promise<AssetDocument> {
        const asset = await this.assetModel.findById(assetId).exec();
        if (!asset) {
        throw new Error(`Asset with ID ${assetId} not found`);
        }

        const commonSoftware = this.extractCommonSoftware(asset);

        if (commonSoftware.length === 0) {
        console.log('[DEBUG] No hay software común para buscar vulnerabilidades.');
        return asset;
        }

        const regexPattern = new RegExp(
            `.*(${commonSoftware.map(escapeRegExp).join('|')}).*`,
            'i'
        );

        const vulnerabilities = await this.vulnerabilityModel.find(
            {
                $or: [
                    { 'affected.product': { $in: commonSoftware } },
                    { 'affected.vendor': { $in: commonSoftware } },
                    { 'affected.product': regexPattern },
                    { 'affected.vendor': regexPattern },
                ],
                state: 'PUBLISHED',
            },
            {
                _id: 1,
                cveId: 1,
                metrics: 1,
                problemTypes: 1,
                lastUpdatedDate: 1,
            }
        ).exec();

        const mappedVulnerabilities = vulnerabilities.map(cve => ({
            _id: cve._id,
            cveId: cve.cveId,
            metrics: cve.metrics,
            problemTypes: cve.problemTypes,
            lastUpdatedDate: cve.lastUpdatedDate,
        }));

        return this.assetModel.findByIdAndUpdate(
            assetId,
            { commonVulnerabilities: mappedVulnerabilities },
            { new: true }
        ).exec();
    }

    /**
     * Extrae software específico del activo
     * @returns Lista de nombres de software específico
     */
    private extractSpecificSoftware(asset: AssetDocument): string[] {
        const specificSoftware: string[] = [];

        if (asset.software?.general?.cuales_aplicaciones?.length > 0) {
            specificSoftware.push(...asset.software.general.cuales_aplicaciones);
        }

        if (asset.software?.especifico?.cuales_aplicaciones?.length > 0) {
            specificSoftware.push(...asset.software.especifico.cuales_aplicaciones);
        }

        return [...new Set(specificSoftware)];
    }

    /**
     * Extrae software comuun del activo (de campos booleanos).
     * @returns Lista de nombres de software común (ej: ["Google Chrome", "Windows"]).
     */
    private extractCommonSoftware(asset: AssetDocument): string[] {
        const commonSoftware: string[] = [];

        const softwareMap: Record<string, string[]> = {

            sistema_operativo: ["Windows", "Linux", "MacOS", "Unix"],
            sistema_operativo_movil: ["Android", "iOS"],

            navegador_internet: ["Google Chrome", "Mozilla Firefox", "Microsoft Edge", "Safari"],
            administrador_correo_elec: ["Microsoft Outlook", "Gmail", "Thunderbird"],
            software_ofimatico: ["Microsoft Office", "LibreOffice", "Google Workspace"],
            antivirus: ["Norton", "McAfee", "Windows Defender", "Kaspersky"],
            servidor_web: ["Apache", "Nginx", "IIS", "Tomcat"],
            gestion_operacion: ["Splunk", "Nagios", "Zabbix"],
            base_datos: ["MySQL", "PostgreSQL", "MongoDB", "Oracle"],
            seguridad: ["Firewall", "VPN", "SIEM"],
            gestion_red: ["Cisco IOS", "Juniper JunOS"],

            erp: ["SAP ERP", "Oracle ERP"],
            crm: ["Salesforce", "HubSpot"],
        };

        for (const [key, value] of Object.entries(asset.software?.general || {})) {
            if (value === true && softwareMap[key]) {
                commonSoftware.push(...softwareMap[key]);
            }
        }

        for (const [key, value] of Object.entries(asset.software?.especifico || {})) {
            if (value === true && softwareMap[key]) {
                commonSoftware.push(...softwareMap[key]);
            }
        }

        return [...new Set(commonSoftware)]; 
    }
}