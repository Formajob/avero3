'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Plus, Trash2, Printer, FileText, Building2, CheckCircle, Eye } from 'lucide-react';

interface Reservation {
  id: number;
  guest_name: string;
  guest_email: string;
  guest_tel: string;
  check_in: string;
  check_out: string;
  nb_days: number;
  total_price: number;
  statut: string;
  property_id: number;
  properties: { titre: string; ville: string; adresse: string; owner_name: string; owner_tel: string } | null;
}

interface Extra {
  label: string;
  price: number;
}

interface InvoiceClient {
  id: number;
  guest_name: string;
  guest_email: string;
  property_titre: string;
  check_in: string;
  check_out: string;
  nb_days: number;
  total_sejour: number;
  extras: string;
  total_extras: number;
  total_facture: number;
  statut: string;
  payment_method: string | null;
  created_at: string;
}

interface InvoiceOwner {
  id: number;
  owner_name: string;
  owner_tel: string;
  periode_start: string;
  periode_end: string;
  reservations_ids: string;
  total_revenue: number;
  commission: number;
  statut: string;
  payment_method: string | null;
  created_at: string;
}

const EXTRA_TYPES = ['Ménage', 'Petit-déjeuner', 'Entretien', 'Transport', 'Autre service'];
const PAYMENT_METHODS = ['Espèces', 'Virement bancaire', 'Autre'];

export default function InvoicesPage() {
  const [tab, setTab] = useState<'client' | 'owner' | 'history'>('client');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [clientInvoices, setClientInvoices] = useState<InvoiceClient[]>([]);
  const [ownerInvoices, setOwnerInvoices] = useState<InvoiceOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Facture client
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [newExtra, setNewExtra] = useState({ label: 'Ménage', price: 0 });

  // Facture propriétaire
  const [periodeStart, setPeriodeStart] = useState('');
  const [periodeEnd, setPeriodeEnd] = useState('');
  const [selectedOwner, setSelectedOwner] = useState('');

  // Paiement
  const [payModal, setPayModal] = useState<{ id: number; type: 'client' | 'owner' } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('Espèces');

  // Affichage facture
  const [viewInvoice, setViewInvoice] = useState<any | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [resRes, clientRes, ownerRes] = await Promise.all([
      fetch('/api/admin/data'),
      fetch('/api/admin/invoices'),
      fetch('/api/admin/invoices?type=owner'),
    ]);
    const resData = await resRes.json();
    const clientData = await clientRes.json();
    const ownerData = await ownerRes.json();
    setReservations(resData.reservations?.filter((r: Reservation) => r.statut === 'confirmed') || []);
    setClientInvoices(clientData.invoices || []);
    setOwnerInvoices(ownerData.invoices || []);
    setLoading(false);
  };

  const openClientInvoice = (r: Reservation) => {
    setSelectedRes(r);
    setExtras([]);
  };

  const addExtra = () => {
    if (newExtra.price > 0) {
      setExtras([...extras, { ...newExtra }]);
      setNewExtra({ label: 'Ménage', price: 0 });
    }
  };

  const totalExtras = extras.reduce((sum, e) => sum + e.price, 0);
  const totalInvoice = (selectedRes?.total_price || 0) + totalExtras;

  const saveClientInvoice = async () => {
    if (!selectedRes) return;
    setSaving(true);
    await fetch('/api/admin/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'client',
        reservation_id: selectedRes.id,
        guest_name: selectedRes.guest_name,
        guest_email: selectedRes.guest_email,
        property_titre: selectedRes.properties?.titre,
        check_in: selectedRes.check_in,
        check_out: selectedRes.check_out,
        nb_days: selectedRes.nb_days,
        total_sejour: selectedRes.total_price,
        extras: JSON.stringify(extras),
        total_extras: totalExtras,
        total_facture: totalInvoice,
        statut: 'unpaid',
      }),
    });
    await fetchData();
    setSaving(false);
    window.print();
  };

  const owners = [...new Set(reservations.map(r => r.properties?.owner_name).filter(Boolean))];

  const getOwnerReservations = () => {
    return reservations.filter(r => {
      if (r.properties?.owner_name !== selectedOwner) return false;
      if (periodeStart && new Date(r.check_in) < new Date(periodeStart)) return false;
      if (periodeEnd && new Date(r.check_out) > new Date(periodeEnd)) return false;
      return true;
    });
  };

  const ownerRevenue = getOwnerReservations().reduce((sum, r) => sum + (r.total_price || 0), 0);
  const ownerCommission = ownerRevenue * 0.2;
  const ownerNet = ownerRevenue - ownerCommission;

  const saveOwnerInvoice = async () => {
    setSaving(true);
    const ownerRes = getOwnerReservations();
    await fetch('/api/admin/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'owner',
        owner_name: selectedOwner,
        owner_tel: ownerRes[0]?.properties?.owner_tel || '',
        periode_start: periodeStart,
        periode_end: periodeEnd,
        reservations_ids: JSON.stringify(ownerRes.map(r => r.id)),
        total_revenue: ownerRevenue,
        commission: ownerCommission,
        statut: 'unpaid',
      }),
    });
    await fetchData();
    setSaving(false);
    window.print();
  };

  const confirmPayment = async () => {
    if (!payModal) return;
    await fetch('/api/admin/invoices', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: payModal.id, type: payModal.type, statut: 'paid', payment_method: paymentMethod }),
    });
    setPayModal(null);
    setPaymentMethod('Espèces');
    await fetchData();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
    </div>
  );

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Factures</h1>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {[
          { key: 'client', label: 'Factures Clients', icon: FileText },
          { key: 'owner', label: 'Factures Propriétaires', icon: Building2 },
          { key: 'history', label: 'Historique', icon: CheckCircle },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key as any)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition ${
              tab === key ? 'border-blue-900 text-blue-900' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {/* Tab Factures Clients */}
      {tab === 'client' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Sélectionnez une réservation confirmée pour générer la facture client.</p>
          <div className="bg-white rounded-xl shadow-sm divide-y">
            {reservations.length === 0 && <p className="px-6 py-8 text-center text-gray-400">Aucune réservation confirmée.</p>}
            {reservations.map((r) => (
              <div key={r.id} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">{r.guest_name}</p>
                  <p className="text-sm text-gray-500">{r.properties?.titre} — {r.properties?.ville}</p>
                  <p className="text-sm text-gray-500">{new Date(r.check_in).toLocaleDateString('fr-FR')} → {new Date(r.check_out).toLocaleDateString('fr-FR')} · {r.nb_days} nuits</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-900">{r.total_price} MAD</p>
                  <Button size="sm" className="mt-2 bg-blue-900 hover:bg-blue-800 text-white" onClick={() => openClientInvoice(r)}>
                    <FileText className="h-4 w-4 mr-1" /> Facturer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Factures Propriétaires */}
      {tab === 'owner' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700">Générer une facture propriétaire</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label>Propriétaire</Label>
                <select value={selectedOwner} onChange={(e) => setSelectedOwner(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm">
                  <option value="">Sélectionner...</option>
                  {owners.map(o => <option key={o} value={o!}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Du</Label>
                <Input type="date" value={periodeStart} onChange={(e) => setPeriodeStart(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Au</Label>
                <Input type="date" value={periodeEnd} onChange={(e) => setPeriodeEnd(e.target.value)} />
              </div>
            </div>

            {selectedOwner && periodeStart && periodeEnd && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Revenu total</p>
                    <p className="text-lg font-bold text-blue-900">{ownerRevenue.toFixed(0)} MAD</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Commission Avero (20%)</p>
                    <p className="text-lg font-bold text-amber-600">{ownerCommission.toFixed(0)} MAD</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Net propriétaire</p>
                    <p className="text-lg font-bold text-green-600">{ownerNet.toFixed(0)} MAD</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {getOwnerReservations().map(r => (
                    <div key={r.id} className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2 text-sm">
                      <span className="font-medium">{r.guest_name}</span>
                      <span className="text-gray-500">{r.properties?.titre}</span>
                      <span className="text-gray-500">{new Date(r.check_in).toLocaleDateString('fr-FR')} → {new Date(r.check_out).toLocaleDateString('fr-FR')}</span>
                      <span className="font-medium text-blue-900">{r.total_price} MAD</span>
                    </div>
                  ))}
                </div>
                <Button className="w-full bg-blue-900 hover:bg-blue-800 text-white" onClick={saveOwnerInvoice} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Printer className="h-4 w-4 mr-2" />}
                  Enregistrer & Imprimer
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Historique */}
      {tab === 'history' && (
        <div className="space-y-6">
          {/* Factures clients */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Factures Clients</h2>
            </div>
            <div className="divide-y">
              {clientInvoices.length === 0 && <p className="px-6 py-4 text-gray-400 text-sm">Aucune facture.</p>}
              {clientInvoices.map(inv => (
                <div key={inv.id} className="px-6 py-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{inv.guest_name}</p>
                    <p className="text-sm text-gray-500">{inv.property_titre} · {new Date(inv.check_in).toLocaleDateString('fr-FR')} → {new Date(inv.check_out).toLocaleDateString('fr-FR')}</p>
                    <p className="text-xs text-gray-400">Créée le {new Date(inv.created_at).toLocaleDateString('fr-FR')}</p>
                    {inv.statut === 'paid' && inv.payment_method && (
                      <p className="text-xs text-green-600">Payé par : {inv.payment_method}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-blue-900">{inv.total_facture} MAD</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${inv.statut === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {inv.statut === 'paid' ? 'Payée' : 'En attente'}
                    </span>
                    <Button size="sm" variant="outline" onClick={() => setViewInvoice({ ...inv, type: 'client' })}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {inv.statut !== 'paid' && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => setPayModal({ id: inv.id, type: 'client' })}>
                        <CheckCircle className="h-4 w-4 mr-1" /> Payer
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Factures propriétaires */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Factures Propriétaires</h2>
            </div>
            <div className="divide-y">
              {ownerInvoices.length === 0 && <p className="px-6 py-4 text-gray-400 text-sm">Aucune facture.</p>}
              {ownerInvoices.map(inv => (
                <div key={inv.id} className="px-6 py-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{inv.owner_name}</p>
                    <p className="text-sm text-gray-500">{new Date(inv.periode_start).toLocaleDateString('fr-FR')} → {new Date(inv.periode_end).toLocaleDateString('fr-FR')}</p>
                    <p className="text-xs text-gray-400">Commission : {inv.commission} MAD · Créée le {new Date(inv.created_at).toLocaleDateString('fr-FR')}</p>
                    {inv.statut === 'paid' && inv.payment_method && (
                      <p className="text-xs text-green-600">Payé par : {inv.payment_method}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-blue-900">{inv.total_revenue} MAD</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${inv.statut === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {inv.statut === 'paid' ? 'Payée' : 'En attente'}
                    </span>
                    <Button size="sm" variant="outline" onClick={() => setViewInvoice({ ...inv, type: 'owner' })}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {inv.statut !== 'paid' && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => setPayModal({ id: inv.id, type: 'owner' })}>
                        <CheckCircle className="h-4 w-4 mr-1" /> Payer
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal facture client */}
      <Dialog open={!!selectedRes} onOpenChange={() => setSelectedRes(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Facture Client — {selectedRes?.guest_name}</DialogTitle>
          </DialogHeader>
          {selectedRes && (
            <div className="space-y-6">
              <div className="border rounded-xl p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-blue-900">Avero</h2>
                    <p className="text-sm text-gray-500">Conciergerie Airbnb au Maroc</p>
                    <p className="text-sm text-gray-500">averomaroc@outlook.com</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">FACTURE #{selectedRes.id}</p>
                    <p className="text-sm text-gray-500">Date : {new Date().toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                <hr />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Client</p>
                    <p className="font-medium">{selectedRes.guest_name}</p>
                    <p className="text-sm text-gray-500">{selectedRes.guest_email}</p>
                    <p className="text-sm text-gray-500">{selectedRes.guest_tel}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Propriété</p>
                    <p className="font-medium">{selectedRes.properties?.titre}</p>
                    <p className="text-sm text-gray-500">{selectedRes.properties?.adresse}, {selectedRes.properties?.ville}</p>
                  </div>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-3 py-2 font-semibold text-gray-700">Description</th>
                      <th className="text-right px-3 py-2 font-semibold text-gray-700">Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="px-3 py-2">Séjour du {new Date(selectedRes.check_in).toLocaleDateString('fr-FR')} au {new Date(selectedRes.check_out).toLocaleDateString('fr-FR')} ({selectedRes.nb_days} nuits)</td>
                      <td className="px-3 py-2 text-right font-medium">{selectedRes.total_price} MAD</td>
                    </tr>
                    {extras.map((e, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-3 py-2">{e.label}</td>
                        <td className="px-3 py-2 text-right font-medium">{e.price} MAD</td>
                      </tr>
                    ))}
                    <tr className="border-t bg-blue-50">
                      <td className="px-3 py-2 font-bold text-blue-900">Total</td>
                      <td className="px-3 py-2 text-right font-bold text-blue-900">{totalInvoice} MAD</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-xs text-gray-400 text-center">Merci pour votre confiance — Avero Conciergerie</p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700">Ajouter un extra</p>
                <div className="flex gap-3 items-end">
                  <div className="space-y-1 flex-1">
                    <Label>Type</Label>
                    <select value={newExtra.label} onChange={(e) => setNewExtra({ ...newExtra, label: e.target.value })}
                      className="w-full border rounded-md px-3 py-2 text-sm">
                      {EXTRA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1 w-32">
                    <Label>Prix (MAD)</Label>
                    <Input type="number" value={newExtra.price} onChange={(e) => setNewExtra({ ...newExtra, price: parseFloat(e.target.value) })} />
                  </div>
                  <Button onClick={addExtra} className="bg-blue-900 hover:bg-blue-800 text-white"><Plus className="h-4 w-4" /></Button>
                </div>
                {extras.map((e, i) => (
                  <div key={i} className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-sm">{e.label}</span>
                    <span className="text-sm font-medium">{e.price} MAD</span>
                    <Button size="sm" variant="outline" onClick={() => setExtras(extras.filter((_, j) => j !== i))}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button className="w-full bg-blue-900 hover:bg-blue-800 text-white" onClick={saveClientInvoice} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Printer className="h-4 w-4 mr-2" />}
                Enregistrer & Imprimer
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal affichage facture */}
      <Dialog open={!!viewInvoice} onOpenChange={() => setViewInvoice(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {viewInvoice?.type === 'client' ? `Facture Client — ${viewInvoice?.guest_name}` : `Facture Propriétaire — ${viewInvoice?.owner_name}`}
            </DialogTitle>
          </DialogHeader>
          {viewInvoice && (
            <div className="space-y-4">
              <div className="border rounded-xl p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-blue-900">Avero</h2>
                    <p className="text-sm text-gray-500">Conciergerie Airbnb au Maroc</p>
                    <p className="text-sm text-gray-500">averomaroc@outlook.com</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">FACTURE #{viewInvoice.id}</p>
                    <p className="text-sm text-gray-500">Créée le {new Date(viewInvoice.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                <hr />

                {viewInvoice.type === 'client' ? (
                  <>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">Client</p>
                      <p className="font-medium">{viewInvoice.guest_name}</p>
                      <p className="text-sm text-gray-500">{viewInvoice.guest_email}</p>
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="text-left px-3 py-2 font-semibold text-gray-700">Description</th>
                          <th className="text-right px-3 py-2 font-semibold text-gray-700">Montant</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t">
                          <td className="px-3 py-2">Séjour du {new Date(viewInvoice.check_in).toLocaleDateString('fr-FR')} au {new Date(viewInvoice.check_out).toLocaleDateString('fr-FR')} ({viewInvoice.nb_days} nuits)</td>
                          <td className="px-3 py-2 text-right font-medium">{viewInvoice.total_sejour} MAD</td>
                        </tr>
                        {viewInvoice.extras && JSON.parse(viewInvoice.extras).map((e: Extra, i: number) => (
                          <tr key={i} className="border-t">
                            <td className="px-3 py-2">{e.label}</td>
                            <td className="px-3 py-2 text-right font-medium">{e.price} MAD</td>
                          </tr>
                        ))}
                        <tr className="border-t bg-blue-50">
                          <td className="px-3 py-2 font-bold text-blue-900">Total</td>
                          <td className="px-3 py-2 text-right font-bold text-blue-900">{viewInvoice.total_facture} MAD</td>
                        </tr>
                      </tbody>
                    </table>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">Propriétaire</p>
                      <p className="font-medium">{viewInvoice.owner_name}</p>
                      <p className="text-sm text-gray-500">{viewInvoice.owner_tel}</p>
                      <p className="text-sm text-gray-500">Période : {new Date(viewInvoice.periode_start).toLocaleDateString('fr-FR')} → {new Date(viewInvoice.periode_end).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="text-left px-3 py-2 font-semibold text-gray-700">Description</th>
                          <th className="text-right px-3 py-2 font-semibold text-gray-700">Montant</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t">
                          <td className="px-3 py-2">Revenu total des réservations</td>
                          <td className="px-3 py-2 text-right font-medium">{viewInvoice.total_revenue} MAD</td>
                        </tr>
                        <tr className="border-t">
                          <td className="px-3 py-2 text-amber-600">Commission Avero (20%)</td>
                          <td className="px-3 py-2 text-right font-medium text-amber-600">- {viewInvoice.commission} MAD</td>
                        </tr>
                        <tr className="border-t bg-green-50">
                          <td className="px-3 py-2 font-bold text-green-700">Net à verser</td>
                          <td className="px-3 py-2 text-right font-bold text-green-700">{(viewInvoice.total_revenue - viewInvoice.commission).toFixed(0)} MAD</td>
                        </tr>
                      </tbody>
                    </table>
                  </>
                )}

                {viewInvoice.statut === 'paid' && viewInvoice.payment_method && (
                  <p className="text-sm text-green-600 font-medium">✅ Payé par : {viewInvoice.payment_method}</p>
                )}

                <p className="text-xs text-gray-400 text-center">Merci pour votre confiance — Avero Conciergerie</p>
              </div>

              <Button className="w-full bg-blue-900 hover:bg-blue-800 text-white" onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-2" /> Imprimer / Sauvegarder en PDF
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal paiement */}
      <Dialog open={!!payModal} onOpenChange={() => setPayModal(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmer le paiement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Mode de paiement</Label>
              {PAYMENT_METHODS.map(method => (
                <div
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 cursor-pointer transition ${
                    paymentMethod === method ? 'border-blue-900 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 ${paymentMethod === method ? 'border-blue-900 bg-blue-900' : 'border-gray-300'}`} />
                  <span className="text-sm font-medium">{method}</span>
                </div>
              ))}
            </div>
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={confirmPayment}>
              <CheckCircle className="h-4 w-4 mr-2" /> Confirmer le paiement
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}