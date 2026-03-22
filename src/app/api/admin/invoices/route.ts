import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  if (type === 'owner') {
    const { data } = await supabaseAdmin
      .from('invoices_owner')
      .select('*')
      .order('created_at', { ascending: false });
    return NextResponse.json({ invoices: data });
  }

  const { data } = await supabaseAdmin
    .from('invoices_client')
    .select('*')
    .order('created_at', { ascending: false });
  return NextResponse.json({ invoices: data });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { type, ...data } = body;

  if (type === 'owner') {
    const { data: invoice, error } = await supabaseAdmin
      .from('invoices_owner')
      .insert(data)
      .select()
      .single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, invoice });
  }

  const { data: invoice, error } = await supabaseAdmin
    .from('invoices_client')
    .insert(data)
    .select()
    .single();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, invoice });
}

export async function PATCH(request: NextRequest) {
  const { id, type, statut, payment_method } = await request.json();
  const table = type === 'owner' ? 'invoices_owner' : 'invoices_client';

  const updates: any = { statut };
  if (payment_method) updates.payment_method = payment_method;

  const { error } = await supabaseAdmin
    .from(table)
    .update(updates)
    .eq('id', id);

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}