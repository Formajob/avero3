'use client';

import { useState, useEffect } from 'react';
import { Loader2, AlertTriangle, Clock, Home, FileWarning } from 'lucide-react';
import { GanttChart } from '@/components/admin/GanttChart';

interface Reservation {
  id: number;
  guest_name: string;
  check_in: string;
  check_out: string;
  total_price: number;
  statut: string;
  properties: { titre: string; ville: string } | null;
}

interface Property {
  id: number;
  titre: string;
  ville: string;
  statut: string;
}

interface Alert {
  type: 'warning' | 'info' | 'danger';
  message: string;
}

export default function AdminPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [resRes, propRes] = await Promise.all([
      fetch('/api/admin/data'),
      fetch('/api/admin/data?type=properties'),
    ]);
    const resData = await resRes.json();
    const propData = await propRes.json();
    const res = resData.reservations || [];
    const props = propData.properties || [];
    setReservations(res);
    setProperties(props);
    generateAlerts(res, props);
    setLoading(false);
  };

  const generateAlerts = (res: Reservation[], props: Property[]) => {
    const alertList: Alert[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    res.filter(r => r.statut !== 'cancelled').forEach(r => {
      const checkOut = new Date(r.check_out);
      const checkIn = new Date(r.check_in);
      const daysUntilCheckOut = Math.ceil((checkOut.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const daysUntilCheckIn = Math.ceil((checkIn.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilCheckOut === 0) {
        alertList.push({ type: 'danger', message: `🔴 Check-out aujourd'hui : ${r.guest_name} — ${r.properties?.titre}` });
      } else if (daysUntilCheckOut <= 2 && daysUntilCheckOut > 0) {
        alertList.push({ type: 'warning', message: `🟡 Check-out dans ${daysUntilCheckOut} jour(s) : ${r.guest_name} — ${r.properties?.titre}` });
      }

      if (daysUntilCheckIn === 0) {
        alertList.push({ type: 'info', message: `🟢 Check-in aujourd'hui : ${r.guest_name} — ${r.properties?.titre}` });
      } else if (daysUntilCheckIn <= 2 && daysUntilCheckIn > 0) {
        alertList.push({ type: 'info', message: `🔵 Check-in dans ${daysUntilCheckIn} jour(s) : ${r.guest_name} — ${r.properties?.titre}` });
      }
    });

    // Logements sans réservation dans les 7 prochains jours
    props.filter(p => p.statut === 'active').forEach(p => {
      const hasUpcoming = res.some(r => {
        if (r.statut === 'cancelled') return false;
        if (r.properties?.titre !== p.titre) return false;
        const checkIn = new Date(r.check_in);
        const daysUntil = Math.ceil((checkIn.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntil >= 0 && daysUntil <= 7;
      });
      if (!hasUpcoming) {
        alertList.push({ type: 'info', message: `⚪ Aucune réservation dans les 7 jours : ${p.titre} — ${p.ville}` });
      }
    });

    setAlerts(alertList);
  };

  const totalRevenue = reservations.filter(r => r.statut !== 'cancelled').reduce((sum, r) => sum + (r.total_price || 0), 0);
  const totalCommission = totalRevenue * 0.2;
  const totalReservations = reservations.filter(r => r.statut !== 'cancelled').length;
  const pendingCount = reservations.filter(r => r.statut === 'pending').length;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
    </div>
  );

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>

      {/* Alertes */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
              alert.type === 'danger' ? 'bg-red-50 text-red-800 border border-red-200' :
              alert.type === 'warning' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
              'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              {alert.message}
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-gray-500 text-sm">Total réservations</p>
          <p className="text-2xl font-bold text-blue-900">{totalReservations}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-gray-500 text-sm">En attente</p>
          <p className="text-2xl font-bold text-amber-500">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-gray-500 text-sm">Revenu total</p>
          <p className="text-2xl font-bold text-blue-900">{totalRevenue.toFixed(0)} MAD</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-gray-500 text-sm">Ma commission</p>
          <p className="text-2xl font-bold text-amber-600">{totalCommission.toFixed(0)} MAD</p>
        </div>
      </div>

      {/* Gantt */}
      <GanttChart reservations={reservations} properties={properties} />
    </div>
  );
}