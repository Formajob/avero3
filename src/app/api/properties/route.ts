import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const maxGuests = searchParams.get('maxGuests');

    let query = supabaseAdmin
      .from('properties')
      .select('*')
      .eq('statut', 'active')
      .order('prix_jour', { ascending: true });

    if (city && city !== 'all') {
      query = query.eq('ville', city);
    }

    if (maxGuests) {
      query = query.gte('max_guests', parseInt(maxGuests));
    }

    const { data: properties, error } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Adapter les noms de colonnes pour le frontend
    const formatted = properties.map((p) => ({
      id: String(p.id),
      title: p.titre,
      description: p.description || '',
      location: p.adresse,
      city: p.ville,
      pricePerNight: p.prix_jour,
      bedrooms: p.bedrooms || 1,
      bathrooms: p.bathrooms || 1,
      maxGuests: p.max_guests || 2,
      imageUrl: p.image_url || '/images/hero.jpg',
      amenities: p.amenities ? JSON.parse(p.amenities) : [],
    }));

    return NextResponse.json({ success: true, properties: formatted });

  } catch (error: any) {
    console.error('Erreur:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}