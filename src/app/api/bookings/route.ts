import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { propertyId, guestName, guestEmail, guestPhone, checkInDate, checkOutDate, guests, specialRequests } = body;

    if (!propertyId || !guestName || !guestEmail || !guestPhone || !checkInDate || !checkOutDate || !guests) {
      return NextResponse.json({ success: false, error: 'Tous les champs sont requis' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestEmail)) {
      return NextResponse.json({ success: false, error: 'Email invalide' }, { status: 400 });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      return NextResponse.json({ success: false, error: 'La date d\'arrivée ne peut pas être dans le passé' }, { status: 400 });
    }

    if (checkOut <= checkIn) {
      return NextResponse.json({ success: false, error: 'La date de départ doit être après l\'arrivée' }, { status: 400 });
    }

    // Récupérer la propriété
    const { data: property, error: propertyError } = await supabaseAdmin
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single();

    if (propertyError || !property) {
      return NextResponse.json({ success: false, error: 'Propriété introuvable' }, { status: 404 });
    }

    if (property.statut !== 'active') {
      return NextResponse.json({ success: false, error: 'Propriété non disponible' }, { status: 400 });
    }

    if (guests > property.max_guests) {
      return NextResponse.json({ success: false, error: `Maximum ${property.max_guests} voyageurs` }, { status: 400 });
    }

    // Vérifier les conflits de dates
    const { data: overlapping } = await supabaseAdmin
      .from('reservations')
      .select('id')
      .eq('property_id', propertyId)
      .or(`check_in.lte.${checkOut.toISOString()},check_out.gte.${checkIn.toISOString()}`);

    const conflicts = overlapping?.filter(b => b) || [];
    if (conflicts.length > 0) {
      return NextResponse.json({ success: false, error: 'Propriété non disponible pour ces dates' }, { status: 400 });
    }

    // Calculer le prix
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * property.prix_jour;

    // Créer la réservation
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('reservations')
      .insert({
        property_id: propertyId,
        guest_name: guestName,
        guest_email: guestEmail,
        guest_tel: guestPhone,
        check_in: checkIn.toISOString(),
        check_out: checkOut.toISOString(),
        nb_days: nights,
        total_price: totalPrice,
        statut: 'pending',
      })
      .select()
      .single();

    if (bookingError) {
      return NextResponse.json({ success: false, error: bookingError.message }, { status: 500 });
    }

    // Envoyer l'email via Resend
    try {
      await resend.emails.send({
        from: 'Avero <onboarding@resend.dev>',
        to: 'lr.jawad@gmail.com',
        subject: `Nouvelle réservation - ${property.titre}`,
        html: `
          <h2>🎉 Nouvelle Réservation</h2>
          <h3>${property.titre}</h3>
          <p><strong>Nom:</strong> ${guestName}</p>
          <p><strong>Email:</strong> ${guestEmail}</p>
          <p><strong>Téléphone:</strong> ${guestPhone}</p>
          <p><strong>Check-in:</strong> ${checkIn.toLocaleDateString('fr-FR')}</p>
          <p><strong>Check-out:</strong> ${checkOut.toLocaleDateString('fr-FR')}</p>
          <p><strong>Nuits:</strong> ${nights}</p>
          <p><strong>Total:</strong> ${totalPrice.toFixed(2)} MAD</p>
          ${specialRequests ? `<p><strong>Demandes spéciales:</strong> ${specialRequests}</p>` : ''}
        `,
      });
      console.log('Email envoyé avec succès');
    } catch (emailError: any) {
      console.error('Erreur email:', emailError.message);
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        propertyTitle: property.titre,
        checkInDate: booking.check_in,
        checkOutDate: booking.check_out,
        nights,
        totalPrice: booking.total_price,
        status: booking.statut,
      },
    });

  } catch (error: any) {
    console.error('Erreur:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}