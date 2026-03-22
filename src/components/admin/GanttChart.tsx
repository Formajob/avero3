'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Reservation {
  id: number;
  guest_name: string;
  check_in: string;
  check_out: string;
  statut: string;
  properties: { titre: string; ville: string } | null;
}

interface Props {
  reservations: Reservation[];
  properties: { id: number; titre: string; ville: string }[];
}

export function GanttChart({ reservations, properties }: Props) {
  const today = new Date();
  const [monthOffset, setMonthOffset] = useState(0);

  const startDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const endDate = new Date(today.getFullYear(), today.getMonth() + monthOffset + 1, 0);

  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const days = useMemo(() => {
    const d = [];
    for (let i = 0; i < totalDays; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      d.push(date);
    }
    return d;
  }, [monthOffset]);

  const getBarStyle = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);

    const startOffset = Math.max(0, Math.ceil((start.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const endOffset = Math.min(totalDays, Math.ceil((end.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const width = endOffset - startOffset;

    if (width <= 0) return null;

    return {
      left: `${(startOffset / totalDays) * 100}%`,
      width: `${(width / totalDays) * 100}%`,
    };
  };

  const getStatusColor = (statut: string) => {
    if (statut === 'confirmed') return 'bg-green-500';
    if (statut === 'cancelled') return 'bg-red-400';
    return 'bg-amber-400';
  };

  const todayOffset = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  const monthLabel = startDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Calendrier des réservations</h2>
          <div className="flex gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500 inline-block"></span> Confirmée</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-400 inline-block"></span> En attente</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-400 inline-block"></span> Annulée</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setMonthOffset(prev => prev - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium capitalize w-36 text-center">{monthLabel}</span>
          <Button variant="outline" size="sm" onClick={() => setMonthOffset(prev => prev + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          {monthOffset !== 0 && (
            <Button variant="outline" size="sm" onClick={() => setMonthOffset(0)}>
              Aujourd'hui
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: '800px' }}>
          <div className="flex border-b bg-gray-50">
            <div className="w-48 flex-shrink-0 px-4 py-2 text-xs font-medium text-gray-500 border-r">Propriété</div>
            <div className="flex-1 relative h-8">
              {days.filter((_, i) => i % 5 === 0).map((day, i) => (
                <div
                  key={i}
                  className="absolute text-xs text-gray-400 top-2"
                  style={{ left: `${(days.indexOf(day) / totalDays) * 100}%` }}
                >
                  {day.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                </div>
              ))}
            </div>
          </div>

          {properties.map((property) => {
            const propReservations = reservations.filter(
              r => r.properties?.titre === property.titre
            );

            return (
              <div key={property.id} className="flex border-b hover:bg-gray-50 transition">
                <div className="w-48 flex-shrink-0 px-4 py-3 border-r">
                  <p className="text-sm font-medium text-gray-900 truncate">{property.titre}</p>
                  <p className="text-xs text-gray-500">{property.ville}</p>
                </div>
                <div className="flex-1 relative" style={{ height: '52px' }}>
                  {todayOffset >= 0 && todayOffset <= totalDays && (
                    <div
                      className="absolute top-0 bottom-0 w-px bg-red-400 z-10"
                      style={{ left: `${(todayOffset / totalDays) * 100}%` }}
                    />
                  )}
                  {propReservations.map((r) => {
                    const style = getBarStyle(r.check_in, r.check_out);
                    if (!style) return null;
                    return (
                      <div
                        key={r.id}
                        className={`absolute top-2 bottom-2 rounded-md ${getStatusColor(r.statut)} opacity-80 hover:opacity-100 transition flex items-center px-2 overflow-hidden`}
                        style={style}
                        title={`${r.guest_name} — ${new Date(r.check_in).toLocaleDateString('fr-FR')} → ${new Date(r.check_out).toLocaleDateString('fr-FR')}`}
                      >
                        <span className="text-white text-xs font-medium truncate">{r.guest_name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}