'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Eye, Loader2, Pencil, Save, X } from 'lucide-react';

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
  properties: { titre: string; ville: string } | null;
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filtered, setFiltered] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Reservation | null>(null);
  const [editing, setEditing] = useState(false);
  const [updating, setUpdating] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ check_in: '', check_out: '', nb_days: 0, total_price: 0 });

  // Filtres
  const [filterStatut, setFilterStatut] = useState('all');
  const [filterProperty, setFilterProperty] = useState('');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    let result = [...reservations];
    if (filterStatut !== 'all') result = result.filter(r => r.statut === filterStatut);
    if (filterProperty) result = result.filter(r => r.properties?.titre.toLowerCase().includes(filterProperty.toLowerCase()));
    if (filterDateStart) result = result.filter(r => new Date(r.check_in) >= new Date(filterDateStart));
    if (filterDateEnd) result = result.filter(r => new Date(r.check_out) <= new Date(filterDateEnd));
    setFiltered(result);
  }, [reservations, filterStatut, filterProperty, filterDateStart, filterDateEnd]);

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/data');
    const data = await res.json();
    setReservations(data.reservations || []);
    setFiltered(data.reservations || []);
    setLoading(false);
  };

  const openDetails = (r: Reservation) => {
    setSelected(r);
    setEditing(false);
    setEditForm({
      check_in: r.check_in.split('T')[0],
      check_out: r.check_out.split('T')[0],
      nb_days: r.nb_days,
      total_price: r.total_price,
    });
  };

  const updateStatut = async (id: number, statut: string) => {
    setUpdating(id);
    await fetch('/api/admin/reservations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, statut }),
    });
    await fetchData();
    setUpdating(null);
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, statut } : null);
  };

  const saveEdit = async () => {
    if (!selected) return;
    setUpdating(selected.id);
    await fetch('/api/admin/reservations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selected.id, ...editForm }),
    });
    await fetchData();
    setUpdating(null);
    setEditing(false);
    setSelected(prev => prev ? { ...prev, ...editForm } : null);
  };

  const totalRevenue = filtered.reduce((sum, r) => sum + (r.total_price || 0), 0);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
    </div>
  );

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Réservations</h1>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Filtres</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <Label>Statut</Label>
            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm"
            >
              <option value="all">Tous</option>
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmées</option>
              <option value="cancelled">Annulées</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label>Propriété</Label>
            <Input placeholder="Nom de la propriété" value={filterProperty}
              onChange={(e) => setFilterProperty(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Du</Label>
            <Input type="date" value={filterDateStart}
              onChange={(e) => setFilterDateStart(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Au</Label>
            <Input type="date" value={filterDateEnd}
              onChange={(e) => setFilterDateEnd(e.target.value)} />
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-500">{filtered.length} réservation(s) — Total : <span className="font-bold text-blue-900">{totalRevenue.toFixed(0)} MAD</span> — Commission : <span className="font-bold text-amber-600">{(totalRevenue * 0.2).toFixed(0)} MAD</span></p>
          <Button variant="outline" size="sm" onClick={() => { setFilterStatut('all'); setFilterProperty(''); setFilterDateStart(''); setFilterDateEnd(''); }}>
            Réinitialiser
          </Button>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Propriété</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-in</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{r.guest_name}</p>
                    <p className="text-sm text-gray-500">{r.guest_email}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{r.properties?.titre} — {r.properties?.ville}</td>
                  <td className="px-6 py-4 text-gray-700">{new Date(r.check_in).toLocaleDateString('fr-FR')}</td>
                  <td className="px-6 py-4 text-gray-700">{new Date(r.check_out).toLocaleDateString('fr-FR')}</td>
                  <td className="px-6 py-4 font-medium text-blue-900">{r.total_price} MAD</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      r.statut === 'confirmed' ? 'bg-green-100 text-green-700' :
                      r.statut === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {r.statut === 'confirmed' ? 'Confirmée' : r.statut === 'cancelled' ? 'Annulée' : 'En attente'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => openDetails(r)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {r.statut !== 'confirmed' && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => updateStatut(r.id, 'confirmed')} disabled={updating === r.id}>
                          {updating === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                        </Button>
                      )}
                      {r.statut !== 'cancelled' && (
                        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => updateStatut(r.id, 'cancelled')} disabled={updating === r.id}>
                          {updating === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal détails */}
      <Dialog open={!!selected} onOpenChange={() => { setSelected(null); setEditing(false); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              Réservation #{selected?.id}
              {!editing && (
                <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                  <Pencil className="h-4 w-4 mr-1" /> Modifier
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              {editing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Check-in</Label>
                      <Input type="date" value={editForm.check_in}
                        onChange={(e) => setEditForm({ ...editForm, check_in: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label>Check-out</Label>
                      <Input type="date" value={editForm.check_out}
                        onChange={(e) => setEditForm({ ...editForm, check_out: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label>Nuits</Label>
                      <Input type="number" value={editForm.nb_days}
                        onChange={(e) => setEditForm({ ...editForm, nb_days: parseInt(e.target.value) })} />
                    </div>
                    <div className="space-y-1">
                      <Label>Prix total (MAD)</Label>
                      <Input type="number" value={editForm.total_price}
                        onChange={(e) => setEditForm({ ...editForm, total_price: parseFloat(e.target.value) })} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-blue-900 hover:bg-blue-800 text-white" onClick={saveEdit} disabled={!!updating}>
                      {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                      Enregistrer
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => setEditing(false)}>
                      <X className="h-4 w-4 mr-2" /> Annuler
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-sm text-gray-500">Client</p><p className="font-medium">{selected.guest_name}</p></div>
                    <div><p className="text-sm text-gray-500">Téléphone</p><p className="font-medium">{selected.guest_tel}</p></div>
                    <div><p className="text-sm text-gray-500">Email</p><p className="font-medium">{selected.guest_email}</p></div>
                    <div><p className="text-sm text-gray-500">Propriété</p><p className="font-medium">{selected.properties?.titre}</p></div>
                    <div><p className="text-sm text-gray-500">Check-in</p><p className="font-medium">{new Date(selected.check_in).toLocaleDateString('fr-FR')}</p></div>
                    <div><p className="text-sm text-gray-500">Check-out</p><p className="font-medium">{new Date(selected.check_out).toLocaleDateString('fr-FR')}</p></div>
                    <div><p className="text-sm text-gray-500">Nuits</p><p className="font-medium">{selected.nb_days}</p></div>
                    <div><p className="text-sm text-gray-500">Total</p><p className="font-medium text-blue-900">{selected.total_price} MAD</p></div>
                    <div><p className="text-sm text-gray-500">Commission (20%)</p><p className="font-medium text-amber-600">{(selected.total_price * 0.2).toFixed(0)} MAD</p></div>
                    <div>
                      <p className="text-sm text-gray-500">Statut</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selected.statut === 'confirmed' ? 'bg-green-100 text-green-700' :
                        selected.statut === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {selected.statut === 'confirmed' ? 'Confirmée' : selected.statut === 'cancelled' ? 'Annulée' : 'En attente'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    {selected.statut !== 'confirmed' && (
                      <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => updateStatut(selected.id, 'confirmed')}>
                        <CheckCircle className="mr-2 h-4 w-4" /> Confirmer
                      </Button>
                    )}
                    {selected.statut !== 'cancelled' && (
                      <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={() => updateStatut(selected.id, 'cancelled')}>
                        <XCircle className="mr-2 h-4 w-4" /> Annuler
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}