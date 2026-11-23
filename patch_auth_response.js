const fs = require('fs');
const file = 'backend/src/auth/auth.service.ts';
let ts = fs.readFileSync(file, 'utf8');

ts = ts.replace(
  `let userId = user ? user._id.toString() : null;
    let name = user ? user.name : null;`,
  `let userId = user ? user._id.toString() : null;
    let name = user ? user.name : null;
    let phone = user ? user.phone : null;`
);

ts = ts.replace(
  `userId = agent._id.toString();
        name = agent.name;`,
  `userId = agent._id.toString();
        name = agent.name;
        phone = agent.phone;`
);

ts = ts.replace(
  `user: {
        id: userId,
        name: name,
        email: loginDto.email,
        role: role,
      },`,
  `user: {
        id: userId,
        name: name,
        email: loginDto.email,
        role: role,
        phone: phone,
      },`
);

fs.writeFileSync(file, ts);
