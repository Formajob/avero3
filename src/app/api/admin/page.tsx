import { supabaseAdmin } from '@/lib/supabaseAdmin';
import Link from 'next/link';

export default async function AdminPage() {
  // Récupérer les réservations
  const { data: reservations } = await supabaseAdmin
    .from('reservations')
    .select('*, properties(titre, ville)')
    .order('created_at', { ascending: false });

  // Récupérer les propriétés
  const { data: properties } = await supabaseAdmin
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false });

  // Calculs
  const totalRevenue = reservations?.reduce((sum, r) => sum + (r.total_price || 0), 0) || 0;
  const pendingCount = reservations?.filter(r => r.statut === 'pending').length || 0;
  const confirmedCount = reservations?.filter(r => r.statut === 'confirmed').length || 0;
  const activeProperties = properties?.filter(p => p.statut === 'active').length || 0;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-blue-900 text-white px-8 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Avero Admin</h1>
        <Link href="/" className="text-sm text-gray-300 hover:text-white">
          Voir le site →
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-gray-500 text-sm">Revenu total</p>
            <p className="text-2xl font-bold text-blue-900">{totalRevenue.toFixed(0)} MAD</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-gray-500 text-sm">Réservations en attente</p>
            <p className="text-2xl font-bold text-amber-500">{pendingCount}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-gray-500 text-sm">Réservations confirmées</p>
            <p className="text-2xl font-bold text-green-600">{confirmedCount}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-gray-500 text-sm">Propriétés actives</p>
            <p className="text-2xl font-bold text-blue-900">{activeProperties}</p>
          </div>
        </div>

        {/* Réservations */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Réservations</h2>
          </div>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reservations?.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{r.guest_name}</p>
                      <p className="text-sm text-gray-500">{r.guest_email}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {r.properties?.titre} — {r.properties?.ville}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {new Date(r.check_in).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {new Date(r.check_out).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 font-medium text-blue-900">
                      {r.total_price} MAD
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        r.statut === 'confirmed' ? 'bg-green-100 text-green-700' :
                        r.statut === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {r.statut === 'confirmed' ? 'Confirmée' :
                         r.statut === 'cancelled' ? 'Annulée' : 'En attente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Propriétés */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Propriétés</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Titre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ville</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix/nuit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {properties?.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{p.titre}</td>
                    <td className="px-6 py-4 text-gray-700">{p.ville}</td>
                    <td className="px-6 py-4 text-gray-700">{p.prix_jour} MAD</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        p.statut === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {p.statut === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
