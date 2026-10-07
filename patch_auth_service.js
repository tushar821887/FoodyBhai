const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'backend', 'src', 'auth', 'auth.service.ts');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  "import { UsersService } from '../users/users.service';",
  "import { UsersService } from '../users/users.service';\nimport { AgentsService } from '../agents/agents.service';\nimport * as bcrypt from 'bcryptjs';"
);

content = content.replace(
  "private readonly usersService: UsersService,",
  "private readonly usersService: UsersService,\n    private readonly agentsService: AgentsService,"
);

const loginBlock = `  async login(loginDto: LoginDto) {
    let user = await this.usersService.findByEmail(loginDto.email);
    let role = user ? user.role : null;
    let passwordHash = user ? user.passwordHash : null;
    let userId = user ? user._id.toString() : null;
    let name = user ? user.name : null;

    if (!user) {
      const agent = await this.agentsService.findByEmail(loginDto.email);
      if (agent) {
        role = 'agent';
        passwordHash = agent.passwordHash;
        userId = agent._id.toString();
        name = agent.name;
        user = agent as any;
      }
    }

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, passwordHash || '');
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload: JwtPayload = {
      sub: userId,
      email: loginDto.email,
      role: role,
    };

    const accessToken = this.jwtService.sign(payload);

    this.logger.log(\`User logged in: \${loginDto.email}\`);

    return {
      success: true,
      message: 'Login successful',
      accessToken,
      user: {
        id: userId,
        name: name,
        email: loginDto.email,
        role: role,
      },
    };
  }`;

content = content.replace(/  async login\(loginDto: LoginDto\) \{[\s\S]*?    \};\n  \}/, loginBlock);
fs.writeFileSync(filePath, content);
console.log('Patched auth service');
