import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.office365.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'averomaroc@outlook.com',
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, propertyLocation } = body;

    // Validate required fields
    if (!name || !email || !phone || !propertyLocation) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Log the contact form submission
    console.log('New contact form submission:', {
      name,
      email,
      phone,
      propertyLocation,
      timestamp: new Date().toISOString()
    });

    // Send email
    if (process.env.SMTP_PASS) {
      try {
        const mailOptions = {
          from: process.env.SMTP_FROM || 'averomaroc@outlook.com',
          to: process.env.SMTP_TO || 'averomaroc@outlook.com',
          subject: `Nouvelle demande de consultation - ${name}`,
          html: `
            <h2>Nouvelle demande de consultation</h2>
            <p><strong>Nom:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Téléphone:</strong> ${phone}</p>
            <p><strong>Emplacement de la propriété:</strong></p>
            <p>${propertyLocation}</p>
            <hr>
            <p><em>Envoyé depuis le formulaire de contact Avero</em></p>
            <p><em>Date: ${new Date().toLocaleString('fr-FR')}</em></p>
          `,
          text: `
            Nouvelle demande de consultation
            
            Nom: ${name}
            Email: ${email}
            Téléphone: ${phone}
            Emplacement de la propriété:
            ${propertyLocation}
            
            ---
            Envoyé depuis le formulaire de contact Avero
            Date: ${new Date().toLocaleString('fr-FR')}
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully to:', mailOptions.to);
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Don't fail the request if email fails, just log the error
      }
    } else {
      console.warn('SMTP credentials not configured. Email will not be sent.');
      console.warn('Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env file');
    }

    return NextResponse.json(
      { 
        message: 'Contact form submitted successfully',
        data: { name, email }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Contact API endpoint is ready' },
    { status: 200 }
  );
}
