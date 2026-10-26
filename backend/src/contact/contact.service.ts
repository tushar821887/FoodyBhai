import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contact, ContactDocument } from './schemas/contact.schema';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    @InjectModel(Contact.name) private contactModel: Model<ContactDocument>,
    private readonly settingsService: SettingsService,
  ) {}

  async create(contactData: any): Promise<ContactDocument> {
    const newContact = new this.contactModel(contactData);
    const saved = await newContact.save();

    // Trigger email notification asynchronously
    this.sendNotificationEmails(contactData).catch((err) => {
      this.logger.error('Failed to send contact inquiry notification emails:', err);
    });

    return saved;
  }

  async findAll(): Promise<ContactDocument[]> {
    return this.contactModel.find().sort({ createdAt: -1 }).exec();
  }

  private async sendNotificationEmails(contactData: any): Promise<void> {
    const smtpHost = process.env.SMTP_HOST || (await this.settingsService.getSetting('smtp_host'));
    const smtpUser = process.env.SMTP_USER || (await this.settingsService.getSetting('smtp_user'));
    const smtpPass = process.env.SMTP_PASS || (await this.settingsService.getSetting('smtp_pass'));
    const smtpPort = Number(process.env.SMTP_PORT || (await this.settingsService.getSetting('smtp_port'))) || 465;
    let smtpFrom = process.env.SMTP_FROM || (await this.settingsService.getSetting('smtp_from'));

    if (!smtpHost || !smtpUser || !smtpPass) {
      this.logger.warn('SMTP settings not configured. Contact inquiry email notification skipped.');
      return;
    }

    // Hostinger and most SMTP providers require the sender address to match the authenticated mailbox
    if (!smtpFrom || !smtpFrom.includes(smtpUser)) {
      smtpFrom = `"Foody Bhai" <${smtpUser}>`;
    }

    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const customerName = contactData.name || 'Website Visitor';
    const customerEmail = contactData.email || 'Not provided';
    const customerPhone = contactData.phone || 'Not provided';
    const customerMessage = contactData.message || '';
    const dateFormatted = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    // 1. Email notification to Admin (sent to smtpUser e.g. tushar@foodybhai.in)
    const adminHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); padding: 24px 28px; color: #ffffff;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">Foody Bhai</h1>
          <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.95;">New Customer Contact Inquiry Received</p>
        </div>

        <div style="padding: 28px;">
          <div style="margin-bottom: 20px;">
            <span style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Inquiry Details</span>
            <div style="margin-top: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #1e293b;">
                <strong style="color: #475569;">Customer Name:</strong> ${customerName}
              </p>
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #1e293b;">
                <strong style="color: #475569;">Email:</strong> 
                ${customerEmail !== 'Not provided' ? `<a href="mailto:${customerEmail}" style="color: #0284c7; text-decoration: none; font-weight: 600;">${customerEmail}</a>` : '<span style="color: #94a3b8;">Not provided</span>'}
              </p>
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #1e293b;">
                <strong style="color: #475569;">Phone Number:</strong> 
                ${customerPhone !== 'Not provided' ? `<a href="tel:${customerPhone}" style="color: #0284c7; text-decoration: none; font-weight: 600;">${customerPhone}</a>` : '<span style="color: #94a3b8;">Not provided</span>'}
              </p>
              <p style="margin: 0; font-size: 14px; color: #64748b;">
                <strong style="color: #475569;">Date & Time:</strong> ${dateFormatted}
              </p>
            </div>
          </div>

          <div style="margin-bottom: 24px;">
            <span style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Customer Message</span>
            <div style="margin-top: 8px; background: #fffbeb; border: 1px solid #fef08a; border-radius: 8px; padding: 16px; font-size: 14px; line-height: 1.6; color: #78350f; white-space: pre-wrap;">${customerMessage}</div>
          </div>

          ${customerEmail !== 'Not provided' ? `
            <div style="text-align: center; margin: 25px 0 10px 0;">
              <a href="mailto:${customerEmail}?subject=Re: Your Foody Bhai Inquiry" style="display: inline-block; background: #ea580c; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 8px;">Reply to ${customerName}</a>
            </div>
          ` : ''}
        </div>

        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 28px; text-align: center; font-size: 12px; color: #94a3b8;">
          This is an automated notification from your Foody Bhai website portal.
        </div>
      </div>
    `;

    try {
      await transporter.sendMail({
        from: smtpFrom,
        to: smtpUser,
        replyTo: customerEmail !== 'Not provided' ? customerEmail : undefined,
        subject: `📩 New Contact Inquiry from ${customerName} - Foody Bhai`,
        html: adminHtml,
      });
      this.logger.log(`Admin contact inquiry notification email sent to ${smtpUser}`);
    } catch (err) {
      this.logger.error('Failed to send admin notification email:', err);
    }

    // 2. Confirmation email to the customer (if they provided their email)
    if (customerEmail && customerEmail !== 'Not provided' && customerEmail.includes('@')) {
      const customerHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: #ea580c; padding: 22px 26px; color: #ffffff;">
            <h1 style="margin: 0; font-size: 20px; font-weight: 800;">Foody Bhai</h1>
            <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.95;">Thank you for contacting us!</p>
          </div>

          <div style="padding: 26px;">
            <p style="margin: 0 0 12px 0; font-size: 15px; color: #1e293b;">Hi <strong>${customerName}</strong>,</p>
            <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #475569;">
              Thank you for reaching out to Foody Bhai. We have received your inquiry and our team will get back to you as soon as possible.
            </p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; font-size: 13px; color: #64748b; line-height: 1.5;">
              <strong style="color: #334155;">Your Message:</strong><br>
              ${customerMessage}
            </div>
            <p style="margin: 20px 0 0 0; font-size: 13px; color: #64748b;">
              Have an urgent food order query? You can also reach us directly via WhatsApp or call at our helpline.
            </p>
          </div>

          <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 26px; text-align: center; font-size: 12px; color: #94a3b8;">
            Foody Bhai - Fresh & Authentic Taste | Meerut, India
          </div>
        </div>
      `;

      try {
        await transporter.sendMail({
          from: smtpFrom,
          to: customerEmail,
          subject: 'We received your message! - Foody Bhai',
          html: customerHtml,
        });
        this.logger.log(`Customer confirmation email sent to ${customerEmail}`);
      } catch (err) {
        this.logger.warn(`Failed to send customer confirmation email to ${customerEmail}:`, err.message);
      }
    }
  }
}
