import { Injectable } from '@nestjs/common';
import { ClientSession, Connection, Model } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Threat, ThreatDocument } from './schemas/threat.schema';
import { CreateThreatDto } from './dto/create-threat.dto';
import { UpdateThreatDto } from './dto/update-threat.dto';
import { TasksService } from '../tasks/services/tasks.service';

@Injectable()
export class ThreatsService {
    constructor(
        @InjectConnection() private readonly connection: Connection,
        @InjectModel(Threat.name) private readonly threatModel: Model<ThreatDocument>,
        private readonly tasksService: TasksService,
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
        createThreatDto: CreateThreatDto,
        session?: ClientSession,
    ): Promise<ThreatDocument> {
        const createdThreat = new this.threatModel(createThreatDto);
        const threat = session
            ? await createdThreat.save({ session })
            : await createdThreat.save();

        await this.tasksService.create({
            nombre: `Gestionar amenaza - ${threat.description}`,
            amenazaId: threat.id,
            responsableId: 'unassigned',
        });

        return threat;
    }

    async findAll(): Promise<ThreatDocument[]> {
        return this.threatModel.find().exec();
    }

    async findById(id: string): Promise<ThreatDocument | null> {
        return this.threatModel.findById(id).exec();
    }

    async findByThreatId(id: string): Promise<ThreatDocument | null> {
        return this.threatModel.findOne({ id: id }).exec();
    }

    async findByCode(code: string): Promise<ThreatDocument | null> {
        return this.threatModel.findOne({ code }).exec();
    }

    async update(
        id: string,
        updateThreatDto: UpdateThreatDto,
        session?: ClientSession,
    ): Promise<ThreatDocument | null> {
        const options = { new: true };
        if (session) {
        return this.threatModel
            .findByIdAndUpdate(id, updateThreatDto, { ...options, session })
            .exec();
        }
        return this.threatModel
        .findByIdAndUpdate(id, updateThreatDto, options)
        .exec();
    }

    async delete(
        id: string,
        session?: ClientSession,
    ): Promise<ThreatDocument | null> {
        if (session) {
        return this.threatModel.findByIdAndDelete(id, { session }).exec();
        }
        return this.threatModel.findByIdAndDelete(id).exec();
    }

    async updateVulnerableAssets(
        id: string,
        vulnerableAssets: Record<string, any>,
    ): Promise<Threat | null> {
        return this.threatModel
        .findOneAndUpdate(
            { id },
            { $set: { vulnerable_assets: vulnerableAssets } },
            { new: true, upsert: true } // upsert: true crea la amenaza si no existe
        )
        .exec();
  }
}