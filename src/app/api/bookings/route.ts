import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
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
    const {
      propertyId,
      guestName,
      guestEmail,
      guestPhone,
      checkInDate,
      checkOutDate,
      guests,
      specialRequests,
    } = body;

    // Validate required fields
    if (!propertyId || !guestName || !guestEmail || !guestPhone || !checkInDate || !checkOutDate || !guests) {
      return NextResponse.json(
        { success: false, error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      return NextResponse.json(
        { success: false, error: 'Check-in date cannot be in the past' },
        { status: 400 }
      );
    }

    if (checkOut <= checkIn) {
      return NextResponse.json(
        { success: false, error: 'Check-out date must be after check-in date' },
        { status: 400 }
      );
    }

    // Get property details
    const property = await db.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }

    if (!property.isActive) {
      return NextResponse.json(
        { success: false, error: 'Property is not available for booking' },
        { status: 400 }
      );
    }

    // Check if guests exceed max guests
    if (guests > property.maxGuests) {
      return NextResponse.json(
        { success: false, error: `This property can accommodate a maximum of ${property.maxGuests} guests` },
        { status: 400 }
      );
    }

    // Check for overlapping bookings
    const overlappingBookings = await db.booking.findMany({
      where: {
        propertyId,
        status: { in: ['pending', 'confirmed'] },
        OR: [
          {
            AND: [
              { checkInDate: { lte: checkIn } },
              { checkOutDate: { gt: checkIn } },
            ],
          },
          {
            AND: [
              { checkInDate: { lt: checkOut } },
              { checkOutDate: { gte: checkOut } },
            ],
          },
          {
            AND: [
              { checkInDate: { gte: checkIn } },
              { checkOutDate: { lte: checkOut } },
            ],
          },
        ],
      },
    });

    if (overlappingBookings.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Property is not available for these dates' },
        { status: 400 }
      );
    }

    // Calculate total price and nights
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * property.pricePerNight;

    // Create booking
    const booking = await db.booking.create({
      data: {
        propertyId,
        guestName,
        guestEmail,
        guestPhone,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guests,
        totalPrice,
        specialRequests,
        status: 'pending',
      },
    });

    // Send email notification
    if (process.env.SMTP_PASS) {
      try {
        const mailOptions = {
          from: process.env.SMTP_FROM || 'averomaroc@outlook.com',
          to: process.env.SMTP_TO || 'averomaroc@outlook.com',
          subject: `Nouvelle réservation - ${property.title}`,
          html: `
            <h2>🎉 Nouvelle Réservation</h2>
            <h3>${property.title}</h3>
            <hr>
            <h4>Informations sur le client</h4>
            <p><strong>Nom:</strong> ${guestName}</p>
            <p><strong>Email:</strong> ${guestEmail}</p>
            <p><strong>Téléphone:</strong> ${guestPhone}</p>
            
            <h4>Détails de la réservation</h4>
            <p><strong>Check-in:</strong> ${checkIn.toLocaleDateString('fr-FR')}</p>
            <p><strong>Check-out:</strong> ${checkOut.toLocaleDateString('fr-FR')}</p>
            <p><strong>Nombre de nuits:</strong> ${nights}</p>
            <p><strong>Nombre de voyageurs:</strong> ${guests}</p>
            <p><strong>Prix total:</strong> ${totalPrice.toFixed(2)} MAD</p>
            
            ${specialRequests ? `<h4>Demandes spéciales</h4><p>${specialRequests}</p>` : ''}
            
            <hr>
            <p><em>Statut: En attente de confirmation</em></p>
            <p><em>Date de la réservation: ${new Date().toLocaleString('fr-FR')}</em></p>
          `,
          text: `
            Nouvelle Réservation - ${property.title}
            
            Informations sur le client:
            Nom: ${guestName}
            Email: ${guestEmail}
            Téléphone: ${guestPhone}
            
            Détails de la réservation:
            Check-in: ${checkIn.toLocaleDateString('fr-FR')}
            Check-out: ${checkOut.toLocaleDateString('fr-FR')}
            Nombre de nuits: ${nights}
            Nombre de voyageurs: ${guests}
            Prix total: ${totalPrice.toFixed(2)} MAD
            
            ${specialRequests ? `Demandes spéciales:\n${specialRequests}\n\n` : ''}
            
            Statut: En attente de confirmation
            Date de la réservation: ${new Date().toLocaleString('fr-FR')}
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log('Booking email sent successfully');
      } catch (emailError) {
        console.error('Error sending booking email:', emailError);
        // Don't fail the booking if email fails
      }
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        propertyTitle: property.title,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        nights,
        totalPrice: booking.totalPrice,
        status: booking.status,
      },
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
