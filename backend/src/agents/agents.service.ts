import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Agent, AgentDocument } from './schemas/agent.schema';

@Injectable()
export class AgentsService {
  constructor(@InjectModel(Agent.name) private agentModel: Model<AgentDocument>) {}

  async create(name: string, phone: string) {
    const created = new this.agentModel({ name, phone });
    return created.save();
  }

  async findAll() {
    return this.agentModel.find().exec();
  }

  async delete(id: string) {
    return this.agentModel.findByIdAndDelete(id).exec();
  }
}
