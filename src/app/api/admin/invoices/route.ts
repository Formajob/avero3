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
      .insert({ ...data, amount_paid: 0, remaining: data.total_revenue - data.commission })
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
  const { id, type, statut, payment_method, amount_paid } = await request.json();

  if (type === 'owner') {
    // Récupérer la facture actuelle
    const { data: current } = await supabaseAdmin
      .from('invoices_owner')
      .select('*')
      .eq('id', id)
      .single();

    if (!current) return NextResponse.json({ success: false, error: 'Facture introuvable' }, { status: 404 });

    const net = current.total_revenue - current.commission;
    const newAmountPaid = (current.amount_paid || 0) + (amount_paid || 0);
    const newRemaining = net - newAmountPaid;
    const newStatut = newRemaining <= 0 ? 'paid' : 'partial';

    const { error } = await supabaseAdmin
      .from('invoices_owner')
      .update({
        amount_paid: newAmountPaid,
        remaining: newRemaining,
        statut: newStatut,
        payment_method: payment_method || current.payment_method,
      })
      .eq('id', id);

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // Facture client
  const updates: any = { statut };
  if (payment_method) updates.payment_method = payment_method;

  const { error } = await supabaseAdmin
    .from('invoices_client')
    .update(updates)
    .eq('id', id);

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}