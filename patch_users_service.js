const fs = require('fs');
const path = require('path');

const servicePath = path.join(__dirname, 'backend', 'src', 'users', 'users.service.ts');
let content = fs.readFileSync(servicePath, 'utf8');

const newMethods = `
  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().select('-passwordHash').exec();
  }

  async updateUser(id: string, updateData: any): Promise<UserDocument | null> {
    if (updateData.password) {
      const salt = await bcrypt.genSalt(12);
      updateData.passwordHash = await bcrypt.hash(updateData.password, salt);
      delete updateData.password;
    }
    return this.userModel.findByIdAndUpdate(id, updateData, { new: true }).select('-passwordHash');
  }

  async deleteUser(id: string): Promise<any> {
    return this.userModel.findByIdAndDelete(id);
  }
`;

content = content.replace('async addAddress', newMethods + '\n  async addAddress');
fs.writeFileSync(servicePath, content);
console.log('users.service.ts updated');
