'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PropertyCard } from './PropertyCard';
import { BookingForm } from './BookingForm';
import { Search, Loader2, Home } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  city: string;
  pricePerNight: number;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  imageUrl: string;
  amenities: string[];
}

export function BookingSection() {
  const { t } = useLanguage();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
  const [cityFilter, setCityFilter] = useState('all');
  const [guestsFilter, setGuestsFilter] = useState('');

  const cities = ['Marrakech', 'Casablanca', 'Fès', 'Tanger', 'Rabat'];

  // Fetch au chargement uniquement
  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (cityFilter && cityFilter !== 'all') params.append('city', cityFilter);
      if (guestsFilter) params.append('maxGuests', guestsFilter);

      const response = await fetch(`/api/properties?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setProperties(data.properties);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (property: Property) => {
    setSelectedProperty(property);
    setIsBookingFormOpen(true);
  };

  const handleBookingClose = () => {
    setIsBookingFormOpen(false);
    setSelectedProperty(null);
  };

  return (
    <section id="booking" className="py-20 md:py-28 bg-gradient-to-b from-white to-amber-50/50">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <Badge className="bg-amber-500 hover:bg-amber-600 text-white">
              {t('badge.booking')}
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
              {t('booking.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('booking.subtitle')}
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t('booking.filterCity')}</Label>
                <Select value={cityFilter} onValueChange={setCityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('booking.allCities')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('booking.allCities')}</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('booking.filterGuests')}</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="2"
                  value={guestsFilter}
                  onChange={(e) => setGuestsFilter(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={fetchProperties}
                  className="w-full bg-blue-900 hover:bg-blue-800 text-white"
                >
                  <Search className="mr-2 h-4 w-4" />
                  {t('booking.search')}
                </Button>
              </div>
            </div>
          </div>

          {/* Properties Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-blue-900" />
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-20">
              <Home className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">{t('booking.noProperties')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onBook={handleBook}
                  t={t}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <BookingForm
        isOpen={isBookingFormOpen}
        onClose={handleBookingClose}
        property={selectedProperty}
        t={t}
      />
    </section>
  );
}