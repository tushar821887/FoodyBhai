const fs = require('fs');
const path = 'backend/src/auth/auth.service.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  'async login(loginDto: LoginDto) {',
  'async login(loginDto: LoginDto) {\n    loginDto.email = loginDto.email.toLowerCase().trim();'
);

fs.writeFileSync(path, code);
