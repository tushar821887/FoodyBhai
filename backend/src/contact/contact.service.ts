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

    // Trigger email notifications (Admin alert + Customer in-progress confirmation)
    this.sendNotificationEmails(contactData, saved._id.toString()).catch((err) => {
      this.logger.error('Failed to send contact inquiry notification emails:', err);
    });

    return saved;
  }

  async findAll(): Promise<ContactDocument[]> {
    return this.contactModel.find().sort({ createdAt: -1 }).exec();
  }

  private async sendNotificationEmails(contactData: any, contactId: string): Promise<void> {
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

    const shortRef = contactId ? contactId.slice(-6).toUpperCase() : Math.random().toString(36).substring(2, 8).toUpperCase();
    const customerName = contactData.name || 'Website Visitor';
    const customerEmail = contactData.email && contactData.email !== 'Not provided' ? contactData.email.trim() : null;
    const customerPhone = contactData.phone && contactData.phone !== 'Not provided' ? contactData.phone.trim() : 'Not provided';
    const customerMessage = contactData.message || '';
    const dateFormatted = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    // 1. Email notification to Admin (sent to smtpUser e.g. tushar@foodybhai.in)
    const adminHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06);">
        <div style="background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); padding: 24px 28px; color: #ffffff;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">Foody Bhai</h1>
            <span style="background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700;">#FB-${shortRef}</span>
          </div>
          <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.95;">New Customer Contact Inquiry Received</p>
        </div>

        <div style="padding: 28px;">
          <div style="margin-bottom: 20px;">
            <span style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Customer Details</span>
            <div style="margin-top: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #1e293b;">
                <strong style="color: #475569;">Name:</strong> ${customerName}
              </p>
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #1e293b;">
                <strong style="color: #475569;">Email:</strong> 
                ${customerEmail ? `<a href="mailto:${customerEmail}" style="color: #0284c7; text-decoration: none; font-weight: 600;">${customerEmail}</a>` : '<span style="color: #94a3b8;">Not provided</span>'}
              </p>
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #1e293b;">
                <strong style="color: #475569;">Phone Number:</strong> 
                ${customerPhone !== 'Not provided' ? `<a href="tel:${customerPhone}" style="color: #0284c7; text-decoration: none; font-weight: 600;">${customerPhone}</a>` : '<span style="color: #94a3b8;">Not provided</span>'}
              </p>
              <p style="margin: 0; font-size: 14px; color: #64748b;">
                <strong style="color: #475569;">Received At:</strong> ${dateFormatted}
              </p>
            </div>
          </div>

          <div style="margin-bottom: 24px;">
            <span style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Inquiry / Message</span>
            <div style="margin-top: 8px; background: #fffbeb; border: 1px solid #fef08a; border-radius: 10px; padding: 18px; font-size: 14px; line-height: 1.6; color: #78350f; white-space: pre-wrap;">${customerMessage}</div>
          </div>

          ${customerEmail ? `
            <div style="text-align: center; margin: 25px 0 10px 0;">
              <a href="mailto:${customerEmail}?subject=Re: Your Foody Bhai Inquiry (#FB-${shortRef})" style="display: inline-block; background: #ea580c; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 8px;">Reply Directly to ${customerName}</a>
            </div>
          ` : ''}
        </div>

        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 28px; text-align: center; font-size: 12px; color: #94a3b8;">
          Foody Bhai Admin Notification • Meerut, Uttar Pradesh
        </div>
      </div>
    `;

    try {
      await transporter.sendMail({
        from: smtpFrom,
        to: smtpUser,
        replyTo: customerEmail || undefined,
        subject: `📩 New Contact Inquiry from ${customerName} (#FB-${shortRef}) - Foody Bhai`,
        html: adminHtml,
      });
      this.logger.log(`Admin contact inquiry notification email sent to ${smtpUser}`);
    } catch (err) {
      this.logger.error('Failed to send admin notification email:', err);
    }

    // 2. Confirmation email to the customer: "Request successfully submitted and is in progress"
    if (customerEmail && customerEmail.includes('@')) {
      const customerHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06);">
          <div style="background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); padding: 26px 30px; color: #ffffff;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 800;">Foody Bhai</h1>
              <span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700;">Reference #FB-${shortRef}</span>
            </div>
            <p style="margin: 8px 0 0 0; font-size: 15px; opacity: 0.95;">Your Request is Received & In Progress</p>
          </div>

          <div style="padding: 30px;">
            <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 14px 18px; margin-bottom: 22px; display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 22px; line-height: 1;">⏳</span>
              <div>
                <strong style="color: #065f46; font-size: 14px; display: block;">Status: Request In Progress</strong>
                <span style="color: #047857; font-size: 13px;">Our support and kitchen team has received your message and is actively reviewing it.</span>
              </div>
            </div>

            <p style="margin: 0 0 14px 0; font-size: 15px; color: #1e293b;">
              Hi <strong>${customerName}</strong>,
            </p>
            <p style="margin: 0 0 18px 0; font-size: 14px; line-height: 1.6; color: #475569;">
              Thank you for reaching out to <strong>Foody Bhai</strong>. We have successfully logged your inquiry under ticket reference <strong>#FB-${shortRef}</strong>. We usually respond within <strong>2 to 4 business hours</strong>.
            </p>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin-bottom: 22px;">
              <span style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 10px;">Summary of Your Submission</span>
              <p style="margin: 0 0 6px 0; font-size: 13px; color: #334155;"><strong>Name:</strong> ${customerName}</p>
              <p style="margin: 0 0 6px 0; font-size: 13px; color: #334155;"><strong>Contact Phone:</strong> ${customerPhone}</p>
              <p style="margin: 0 0 10px 0; font-size: 13px; color: #334155;"><strong>Submitted At:</strong> ${dateFormatted}</p>
              <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #cbd5e1; font-size: 13px; color: #475569; line-height: 1.5;">
                <strong style="color: #1e293b;">Your Message:</strong><br>
                ${customerMessage}
              </div>
            </div>

            <div style="background: #fffbeb; border: 1px solid #fef08a; border-radius: 10px; padding: 14px 18px; font-size: 13px; color: #854d0e; line-height: 1.5; margin-bottom: 25px;">
              <strong>Need Immediate Assistance with an Ongoing Food Order?</strong><br>
              Call us directly at <a href="tel:8218870579" style="color: #ea580c; font-weight: 700; text-decoration: none;">+91 8218870579</a> or visit us at Bagh Wali Gali, Meerut.
            </div>

            <div style="text-align: center;">
              <a href="https://foodybhai.in/menu" style="display: inline-block; background: #ea580c; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 8px;">Explore Our Fresh Menu 🍕</a>
            </div>
          </div>

          <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 28px; text-align: center; font-size: 12px; color: #94a3b8;">
            Foody Bhai - Fresh & Authentic Taste • Meerut, Uttar Pradesh • <a href="https://foodybhai.in" style="color: #64748b; text-decoration: none;">foodybhai.in</a>
          </div>
        </div>
      `;

      try {
        await transporter.sendMail({
          from: smtpFrom,
          to: customerEmail,
          subject: `✅ Request Successfully Submitted & In Progress (#FB-${shortRef}) - Foody Bhai`,
          html: customerHtml,
        });
        this.logger.log(`Customer 'in-progress' confirmation email sent to ${customerEmail}`);
      } catch (err) {
        this.logger.warn(`Failed to send customer confirmation email to ${customerEmail}:`, err.message);
      }
    }
  }
}
