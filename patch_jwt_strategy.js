const fs = require('fs');
const file = 'backend/src/auth/strategies/jwt.strategy.ts';
let ts = fs.readFileSync(file, 'utf8');

ts = ts.replace(
  `import { UsersService } from '../../users/users.service';`,
  `import { UsersService } from '../../users/users.service';\nimport { AgentsService } from '../../agents/agents.service';`
);

ts = ts.replace(
  `private readonly usersService: UsersService,`,
  `private readonly usersService: UsersService,\n    private readonly agentsService: AgentsService,`
);

ts = ts.replace(
  `async validate(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }`,
  `async validate(payload: JwtPayload) {
    if (payload.role === 'agent') {
      const agent = await this.agentsService.findById(payload.sub);
      if (!agent) throw new UnauthorizedException('Agent not found');
      return { ...agent.toObject(), id: agent._id.toString(), role: 'agent' };
    }
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }`
);

fs.writeFileSync(file, ts);
