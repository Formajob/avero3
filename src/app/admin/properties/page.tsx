'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface Property {
  id: number;
  titre: string;
  ville: string;
  adresse: string;
  prix_jour: number;
  max_guests: number;
  statut: string;
  owner_name: string;
  owner_tel: string;
}

interface Reservation {
  id: number;
  check_in: string;
  check_out: string;
  total_price: number;
  statut: string;
  guest_name: string;
  property_id: number;
}

interface Task {
  id: number;
  type: string;
  date: string;
  price: number;
  statut: string;
  property_id: number;
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [propRes, resRes, taskRes] = await Promise.all([
      fetch('/api/admin/data?type=properties'),
      fetch('/api/admin/data'),
      fetch('/api/admin/data?type=tasks'),
    ]);
    const propData = await propRes.json();
    const resData = await resRes.json();
    const taskData = await taskRes.json();
    setProperties(propData.properties || []);
    setReservations(resData.reservations || []);
    setTasks(taskData.tasks || []);
    setLoading(false);
  };

  const getPropertyReservations = (propertyId: number) => {
    let res = reservations.filter(r => r.property_id === propertyId);
    if (filterDateStart) res = res.filter(r => new Date(r.check_in) >= new Date(filterDateStart));
    if (filterDateEnd) res = res.filter(r => new Date(r.check_out) <= new Date(filterDateEnd));
    return res;
  };

  const getPropertyTasks = (propertyId: number) => {
    let t = tasks.filter(t => t.property_id === propertyId);
    if (filterDateStart) t = t.filter(t => new Date(t.date) >= new Date(filterDateStart));
    if (filterDateEnd) t = t.filter(t => new Date(t.date) <= new Date(filterDateEnd));
    return t;
  };

  const getPropertyRevenue = (propertyId: number) => {
    return getPropertyReservations(propertyId)
      .filter(r => r.statut !== 'cancelled')
      .reduce((sum, r) => sum + (r.total_price || 0), 0);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
    </div>
  );

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Propriétés</h1>

      {/* Filtres période */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Filtrer par période</h2>
        <div className="flex gap-4 items-end">
          <div className="space-y-1">
            <Label>Du</Label>
            <Input type="date" value={filterDateStart} onChange={(e) => setFilterDateStart(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Au</Label>
            <Input type="date" value={filterDateEnd} onChange={(e) => setFilterDateEnd(e.target.value)} />
          </div>
          <Button variant="outline" onClick={() => { setFilterDateStart(''); setFilterDateEnd(''); }}>
            Réinitialiser
          </Button>
        </div>
      </div>

      {/* Liste des propriétés */}
      <div className="grid md:grid-cols-2 gap-6">
        {properties.map((property) => {
          const propRes = getPropertyReservations(property.id);
          const propTasks = getPropertyTasks(property.id);
          const revenue = getPropertyRevenue(property.id);
          const commission = revenue * 0.2;
          const confirmedRes = propRes.filter(r => r.statut === 'confirmed').length;
          const pendingRes = propRes.filter(r => r.statut === 'pending').length;

          return (
            <div key={property.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{property.titre}</h3>
                  <p className="text-sm text-gray-500">{property.ville} — {property.adresse}</p>
                  {property.owner_name && (
                    <p className="text-sm text-gray-500 mt-1">Propriétaire : {property.owner_name} · {property.owner_tel}</p>
                  )}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  property.statut === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {property.statut === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="px-6 py-4 grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Revenu total</p>
                  <p className="text-lg font-bold text-blue-900">{revenue.toFixed(0)} MAD</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Ma commission (20%)</p>
                  <p className="text-lg font-bold text-amber-600">{commission.toFixed(0)} MAD</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Réservations confirmées</p>
                  <p className="text-lg font-bold text-green-600">{confirmedRes}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">En attente</p>
                  <p className="text-lg font-bold text-gray-600">{pendingRes}</p>
                </div>
              </div>

              {/* Réservations */}
              {propRes.length > 0 && (
                <div className="px-6 pb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Réservations</p>
                  <div className="space-y-2">
                    {propRes.map(r => (
                      <div key={r.id} className="flex justify-between items-center text-sm bg-gray-50 rounded-lg px-3 py-2">
                        <span className="font-medium text-gray-900">{r.guest_name}</span>
                        <span className="text-gray-500">{new Date(r.check_in).toLocaleDateString('fr-FR')} → {new Date(r.check_out).toLocaleDateString('fr-FR')}</span>
                        <span className="font-medium text-blue-900">{r.total_price} MAD</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          r.statut === 'confirmed' ? 'bg-green-100 text-green-700' :
                          r.statut === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {r.statut === 'confirmed' ? 'Confirmée' : r.statut === 'cancelled' ? 'Annulée' : 'En attente'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks */}
              {propTasks.length > 0 && (
                <div className="px-6 pb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Tasks</p>
                  <div className="space-y-2">
                    {propTasks.map(t => (
                      <div key={t.id} className="flex justify-between items-center text-sm bg-gray-50 rounded-lg px-3 py-2">
                        <span className="font-medium text-gray-900">{t.type}</span>
                        <span className="text-gray-500">{new Date(t.date).toLocaleDateString('fr-FR')}</span>
                        <span className="font-medium text-blue-900">{t.price} MAD</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          t.statut === 'done' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {t.statut === 'done' ? 'Fait' : 'En cours'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}