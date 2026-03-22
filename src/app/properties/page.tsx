import { supabaseAdmin } from '@/lib/supabaseAdmin';
import Link from 'next/link';

export default async function PropertiesPage() {
  const { data: properties, error } = await supabaseAdmin
    .from('properties')
    .select('*')
    .eq('statut', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    return <p className="p-8 text-red-500">Erreur : {error.message}</p>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Nos propriétés</h1>

      {properties.length === 0 && (
        <p className="text-gray-500">Aucune propriété disponible.</p>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <div key={property.id} className="border rounded-xl shadow-sm p-6 bg-white hover:shadow-md transition">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{property.titre}</h2>
            <p className="text-gray-500 mb-1">{property.ville}</p>
            <p className="text-gray-500 mb-4">{property.adresse}</p>
            <p className="text-gray-700 mb-4">
              <span className="font-bold text-amber-600">{property.prix_jour} MAD</span> / nuit
            </p>
            <Link
              href={`/properties/${property.id}`}
              className="block text-center bg-blue-900 text-white py-2 px-4 rounded-lg hover:bg-blue-800 transition"
            >
              Voir & Réserver
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}