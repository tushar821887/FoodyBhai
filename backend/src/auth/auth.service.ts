import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AgentsService } from '../agents/agents.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly agentsService: AgentsService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.createUser(
      registerDto.name,
      registerDto.email,
      registerDto.password,
      registerDto.phone,
    );

    this.logger.log(`User registered: ${user.email}`);

    return {
      success: true,
      message: 'Registration successful',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      role: user.role,
      },
    };
  }

  async login(loginDto: LoginDto) {
    let user = await this.usersService.findByEmail(loginDto.email);
    let role = user ? user.role : null;
    let passwordHash = user ? user.passwordHash : null;
    let userId = user ? user._id.toString() : null;
    let name = user ? user.name : null;

    if (!user) {
      const agent = await this.agentsService.findByEmail(loginDto.email);
      if (agent) {
        role = 'agent';
        passwordHash = agent.passwordHash || '';
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
      sub: userId as string,
      email: loginDto.email,
      role: role as string,
    };

    const accessToken = this.jwtService.sign(payload);

    this.logger.log(`User logged in: ${loginDto.email}`);

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
  }
}
