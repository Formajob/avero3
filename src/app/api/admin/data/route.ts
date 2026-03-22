import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  if (type === 'properties') {
    const { data: properties } = await supabaseAdmin
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });
    return NextResponse.json({ properties });
  }

  const { data: reservations } = await supabaseAdmin
    .from('reservations')
    .select('*, properties(titre, ville)')
    .order('created_at', { ascending: false });

  return NextResponse.json({ reservations });
}