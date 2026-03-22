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

  if (type === 'tasks') {
    const { data: tasks } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .order('date', { ascending: false });
    return NextResponse.json({ tasks });
  }

  const { data: reservations } = await supabaseAdmin
    .from('reservations')
    .select('*, properties(titre, ville, adresse, owner_name, owner_tel)')
    .order('created_at', { ascending: false });

  return NextResponse.json({ reservations });
}