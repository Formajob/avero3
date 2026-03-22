import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, statut, check_in, check_out, nb_days, total_price } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID manquant' }, { status: 400 });
    }

    const updates: any = {};
    if (statut) updates.statut = statut;
    if (check_in) updates.check_in = check_in;
    if (check_out) updates.check_out = check_out;
    if (nb_days) updates.nb_days = nb_days;
    if (total_price) updates.total_price = total_price;

    const { error } = await supabaseAdmin
      .from('reservations')
      .update(updates)
      .eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
