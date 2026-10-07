const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'backend', 'src', 'agents', 'schemas', 'agent.schema.ts');
let schemaContent = fs.readFileSync(schemaPath, 'utf8');

const newProps = `  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: false, unique: true, sparse: true })
  email?: string;

  @Prop({ required: false })
  passwordHash?: string;
`;

schemaContent = schemaContent.replace(/  @Prop.*name: string;\n\n  @Prop.*phone: string;/s, newProps);
fs.writeFileSync(schemaPath, schemaContent);
console.log('Patched agent schema');
