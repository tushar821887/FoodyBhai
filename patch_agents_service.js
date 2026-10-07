const fs = require('fs');
const path = require('path');

const servicePath = path.join(__dirname, 'backend', 'src', 'agents', 'agents.service.ts');
let content = fs.readFileSync(servicePath, 'utf8');

content = `import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Agent, AgentDocument } from './schemas/agent.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AgentsService {
  constructor(@InjectModel(Agent.name) private agentModel: Model<AgentDocument>) {}

  async create(name: string, phone: string, email?: string, password?: string) {
    let passwordHash;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(password, salt);
    }
    const created = new this.agentModel({ name, phone, email, passwordHash });
    return created.save();
  }

  async findAll() {
    return this.agentModel.find().select('-passwordHash').exec();
  }

  async findByEmail(email: string) {
    return this.agentModel.findOne({ email }).exec();
  }

  async delete(id: string) {
    return this.agentModel.findByIdAndDelete(id).exec();
  }
}
`;

fs.writeFileSync(servicePath, content);
console.log('Patched agents service');
