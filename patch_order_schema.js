const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'backend', 'src', 'orders', 'schemas', 'order.schema.ts');
let content = fs.readFileSync(schemaPath, 'utf8');

const oldEnd = `  @Prop({ type: Object, required: false })
  deliveryAgent?: { name: string; phone: string };


}`;

const newEnd = `  @Prop({ type: Object, required: false })
  deliveryAgent?: { name: string; phone: string };

  @Prop({ required: false })
  itemTotal?: number;
  
  @Prop({ required: false })
  discount?: number;
  
  @Prop({ required: false })
  gst?: number;
  
  @Prop({ required: false })
  platformFee?: number;

  @Prop({ required: false })
  rating?: number;

  @Prop({ required: false })
  review?: string;
}`;

content = content.replace(oldEnd, newEnd);
fs.writeFileSync(schemaPath, content);
console.log('Fixed order.schema.ts');
