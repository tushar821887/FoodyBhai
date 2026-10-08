const fs = require('fs');
const file = 'backend/src/agents/agents.service.ts';
let ts = fs.readFileSync(file, 'utf8');

ts = ts.replace(
  `async findByEmail(email: string) {`,
  `async findById(id: string) {
    return this.agentModel.findById(id).exec();
  }

  async findByEmail(email: string) {`
);

fs.writeFileSync(file, ts);
