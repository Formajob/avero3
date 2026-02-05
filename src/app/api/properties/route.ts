import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Sample properties data (fallback if database is empty)
const SAMPLE_PROPERTIES = [
  {
    id: 'sample-1',
    title: "Appartement de Luxe à Marrakech - Médina",
    description: "Magnifique appartement au cœur de la Médina, avec vue sur les jardins Majorelle. Décoration traditionnelle marocaine avec tout le confort moderne.",
    location: "Médina, Marrakech",
    city: "Marrakech",
    pricePerNight: 150.0,
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    imageUrl: "/images/hero.jpg",
    amenities: ["WiFi", "Climatisation", "Cuisine équipée", "Linge de maison", "Parking", "Piscine"],
  },
  {
    id: 'sample-2',
    title: "Villa Moderne à Casablanca - Anfa",
    description: "Superbe villa contemporaine avec piscine privée, idéale pour les familles. Située dans le quartier prisé d'Anfa, proche de la corniche.",
    location: "Anfa, Casablanca",
    city: "Casablanca",
    pricePerNight: 250.0,
    bedrooms: 4,
    bathrooms: 3,
    maxGuests: 8,
    imageUrl: "/images/about.jpg",
    amenities: ["WiFi", "Climatisation", "Piscine privée", "Jardin", "Garage", "Barbecue", "Cuisine équipée"],
  },
  {
    id: 'sample-3',
    title: "Riad Traditionnel à Fès - Batha",
    description: "Authentique riad marocain restauré avec soin, patios intérieurs et terrasse panoramique sur la vieille ville de Fès.",
    location: "Quartier Batha, Fès",
    city: "Fès",
    pricePerNight: 120.0,
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    imageUrl: "/images/services.jpg",
    amenities: ["WiFi", "Climatisation", "Petit-déjeuner inclus", "Terrasse", "Hammam", "Cuisine marocaine", "Guide touristique disponible"],
  },
  {
    id: 'sample-4',
    title: "Studio avec Vue Mer à Tanger - Malabata",
    description: "Charmant studio moderne avec vue imprenable sur l'océan Atlantique et la plage. Parfait pour les couples.",
    location: "Malabata, Tanger",
    city: "Tanger",
    pricePerNight: 80.0,
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    imageUrl: "/images/morocco.jpg",
    amenities: ["WiFi", "Vue mer", "Climatisation", "Télévision", "Cuisine équipée", "Proche de la plage"],
  },
  {
    id: 'sample-5',
    title: "Penthouse Luxueux à Rabat - Agdal",
    description: "Pentage spacieux avec terrasse privée et vue sur la ville. Quartier résidentiel calme et sécurisé d'Agdal.",
    location: "Agdal, Rabat",
    city: "Rabat",
    pricePerNight: 300.0,
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    imageUrl: "/images/hero.jpg",
    amenities: ["WiFi", "Climatisation", "Terrasse privée", "Vue panoramique", "Parking sécurisé", "Gardiennage", "Proche des commerces"],
  },
];

// Function to seed properties if none exist
async function ensurePropertiesExist() {
  try {
    const count = await db.property.count();
    if (count === 0) {
      console.log('No properties found, seeding sample properties...');
      
      const propertiesToCreate = SAMPLE_PROPERTIES.map((prop) => ({
        title: prop.title,
        description: prop.description,
        location: prop.location,
        city: prop.city,
        pricePerNight: prop.pricePerNight,
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms,
        maxGuests: prop.maxGuests,
        imageUrl: prop.imageUrl,
        amenities: JSON.stringify(prop.amenities),
        isActive: true,
      }));

      await db.property.createMany({
        data: propertiesToCreate,
      });
      
      console.log(`✓ Seeded ${propertiesToCreate.length} properties`);
    }
  } catch (error) {
    console.error('Error seeding properties:', error);
  }
}

export async function GET(request: NextRequest) {
  try {
    // Ensure properties exist
    await ensurePropertiesExist();

    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const maxGuests = searchParams.get('maxGuests');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    const where: any = {
      isActive: true,
    };

    if (city) {
      where.city = city;
    }

    if (maxGuests) {
      where.maxGuests = { gte: parseInt(maxGuests) };
    }

    if (minPrice || maxPrice) {
      where.pricePerNight = {};
      if (minPrice) where.pricePerNight.gte = parseFloat(minPrice);
      if (maxPrice) where.pricePerNight.lte = parseFloat(maxPrice);
    }

    console.log('Fetching properties with filters:', { city, maxGuests, minPrice, maxPrice });

    const properties = await db.property.findMany({
      where,
      orderBy: { pricePerNight: 'asc' },
    });

    console.log(`Found ${properties.length} properties`);

    // Parse amenities JSON
    const propertiesWithParsedAmenities = properties.map((property) => ({
      ...property,
      amenities: property.amenities ? JSON.parse(property.amenities) : [],
    }));

    // If still no properties after seeding, use sample data as fallback
    if (propertiesWithParsedAmenities.length === 0) {
      console.log('No properties in database, using sample data as fallback');
      let filteredSamples = SAMPLE_PROPERTIES;
      
      if (city && city !== 'all') {
        filteredSamples = filteredSamples.filter(p => p.city === city);
      }
      if (maxGuests) {
        filteredSamples = filteredSamples.filter(p => p.maxGuests >= parseInt(maxGuests));
      }
      if (minPrice) {
        filteredSamples = filteredSamples.filter(p => p.pricePerNight >= parseFloat(minPrice));
      }
      if (maxPrice) {
        filteredSamples = filteredSamples.filter(p => p.pricePerNight <= parseFloat(maxPrice));
      }

      return NextResponse.json({
        success: true,
        properties: filteredSamples,
        usingFallback: true,
      });
    }

    return NextResponse.json({
      success: true,
      properties: propertiesWithParsedAmenities,
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    
    // Return sample data as fallback on error
    console.log('Using sample data as fallback due to error');
    return NextResponse.json({
      success: true,
      properties: SAMPLE_PROPERTIES,
      usingFallback: true,
      error: 'Using sample data due to database error',
    });
  }
}
