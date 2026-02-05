'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Bed, Bath, MapPin, Star } from 'lucide-react';

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

interface PropertyCardProps {
  property: Property;
  onBook: (property: Property) => void;
  t: (key: string) => string;
}

export function PropertyCard({ property, onBook, t }: PropertyCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-amber-300">
      <div className="relative h-48 overflow-hidden">
        <img
          src={property.imageUrl || '/images/hero.jpg'}
          alt={property.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        <Badge className="absolute top-3 right-3 bg-amber-500 hover:bg-amber-600 text-white">
          {property.city}
        </Badge>
        <div className="absolute bottom-3 left-3 bg-blue-900/90 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          {property.pricePerNight.toFixed(0)} MAD
          <span className="text-xs font-normal">/ nuit</span>
        </div>
      </div>

      <CardHeader>
        <CardTitle className="text-lg font-semibold line-clamp-2">{property.title}</CardTitle>
        <CardDescription className="flex items-start gap-2 text-sm">
          <MapPin className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <span className="line-clamp-2">{property.location}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4" />
            <span>{property.bedrooms} {property.bedrooms > 1 ? t('booking.bedrooms') : t('booking.bedroom')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4" />
            <span>{property.bathrooms} {property.bathrooms > 1 ? t('booking.bathrooms') : t('booking.bathroom')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{property.maxGuests} {t('booking.guests')}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {property.amenities.slice(0, 4).map((amenity, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {amenity}
            </Badge>
          ))}
          {property.amenities.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{property.amenities.length - 4}
            </Badge>
          )}
        </div>

        <Button
          onClick={() => onBook(property)}
          className="w-full bg-blue-900 hover:bg-blue-800 text-white"
        >
          <Calendar className="mr-2 h-4 w-4" />
          {t('booking.bookNow')}
        </Button>
      </CardContent>
    </Card>
  );
}
