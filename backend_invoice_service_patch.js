const fs = require('fs');
const path = require('path');

const servicePath = path.join(__dirname, 'backend', 'src', 'orders', 'orders.service.ts');
let serviceContent = fs.readFileSync(servicePath, 'utf8');

const importPdfkit = `import * as PDFDocument from 'pdfkit';\nimport { Injectable, NotFoundException } from '@nestjs/common';`;
serviceContent = serviceContent.replace(/import \{ Injectable, NotFoundException \} from '@nestjs\/common';/, importPdfkit);

const newMethod = `
  async generateInvoice(id: string): Promise<any> {
    const order = await this.orderModel.findById(id).populate('items.recipe').exec();
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const doc = new PDFDocument({ margin: 50 });
    
    // Header
    doc.fontSize(20).text('FOODY BHAI', { align: 'center' });
    doc.fontSize(10).text('127, Bhatwara, Meerut - 250002', { align: 'center' });
    doc.text('+91 8218870579 | support@foodybhai.com', { align: 'center' });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Order Info
    doc.fontSize(14).text('TAX INVOICE', { align: 'center' }).moveDown();
    doc.fontSize(10);
    doc.text(\`Order ID: \${order._id.toString().slice(-6).toUpperCase()}\`);
    doc.text(\`Date: \${order.createdAt ? new Date(order.createdAt).toLocaleString() : new Date().toLocaleString()}\`);
    doc.text(\`Status: \${order.status.toUpperCase()}\`);
    doc.moveDown();

    // Customer Info
    doc.text('Billed To:');
    doc.text(order.deliveryDetails.name);
    doc.text(order.deliveryDetails.phone);
    doc.text(order.deliveryDetails.address);
    doc.moveDown();

    // Items Table Header
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);
    const tableTop = doc.y;
    doc.text('Item', 50, tableTop, { width: 250 });
    doc.text('Qty', 300, tableTop, { width: 50, align: 'center' });
    doc.text('Price', 350, tableTop, { width: 100, align: 'right' });
    doc.text('Total', 450, tableTop, { width: 100, align: 'right' });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    // Items
    let subtotal = 0;
    order.items.forEach(item => {
      const y = doc.y;
      const title = item.recipe ? (item.recipe as any).title : 'Unknown Item';
      const price = item.recipe ? (item.recipe as any).price : 0;
      const qty = item.quantity;
      const total = price * qty;
      subtotal += total;

      doc.text(title, 50, y, { width: 250 });
      doc.text(qty.toString(), 300, y, { width: 50, align: 'center' });
      doc.text(\`Rs. \${price}\`, 350, y, { width: 100, align: 'right' });
      doc.text(\`Rs. \${total}\`, 450, y, { width: 100, align: 'right' });
      doc.moveDown();
    });

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Summary
    const gst = order.gst || (subtotal * 0.05);
    const platformFee = order.platformFee || 5;
    const finalTotal = subtotal + gst + platformFee;

    doc.text(\`Subtotal:\`, 350, doc.y, { width: 100, align: 'right' });
    doc.text(\`Rs. \${subtotal.toFixed(2)}\`, 450, doc.y, { width: 100, align: 'right' }).moveDown(0.5);
    
    doc.text(\`GST (5%):\`, 350, doc.y, { width: 100, align: 'right' });
    doc.text(\`Rs. \${gst.toFixed(2)}\`, 450, doc.y, { width: 100, align: 'right' }).moveDown(0.5);
    
    doc.text(\`Platform Fee:\`, 350, doc.y, { width: 100, align: 'right' });
    doc.text(\`Rs. \${platformFee.toFixed(2)}\`, 450, doc.y, { width: 100, align: 'right' }).moveDown(0.5);

    doc.moveTo(350, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    doc.fontSize(12).font('Helvetica-Bold');
    doc.text(\`Total Amount:\`, 350, doc.y, { width: 100, align: 'right' });
    doc.text(\`Rs. \${finalTotal.toFixed(2)}\`, 450, doc.y, { width: 100, align: 'right' });
    doc.font('Helvetica');

    doc.moveDown(3);
    doc.fontSize(10).text('Thank you for ordering from Foody Bhai!', { align: 'center', color: 'grey' });

    doc.end();
    return doc;
  }
`;

serviceContent = serviceContent.replace(/\}\s*$/, newMethod + '\n}');
fs.writeFileSync(servicePath, serviceContent);

console.log('Fixed service');
