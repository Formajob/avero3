import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Sample properties data
const SAMPLE_PROPERTIES = [
  {
    title: "Appartement de Luxe à Marrakech - Médina",
    description: "Magnifique appartement au cœur de la Médina, avec vue sur les jardins Majorelle. Décoration traditionnelle marocaine avec tout le confort moderne.",
    location: "Médina, Marrakech",
    city: "Marrakech",
    pricePerNight: 150.0,
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    imageUrl: "/images/hero.jpg",
    amenities: JSON.stringify([
      "WiFi", "Climatisation", "Cuisine équipée", "Linge de maison", "Parking", "Piscine"
    ]),
    isActive: true,
  },
  {
    title: "Villa Moderne à Casablanca - Anfa",
    description: "Superbe villa contemporaine avec piscine privée, idéale pour les familles. Située dans le quartier prisé d'Anfa, proche de la corniche.",
    location: "Anfa, Casablanca",
    city: "Casablanca",
    pricePerNight: 250.0,
    bedrooms: 4,
    bathrooms: 3,
    maxGuests: 8,
    imageUrl: "/images/about.jpg",
    amenities: JSON.stringify([
      "WiFi", "Climatisation", "Piscine privée", "Jardin", "Garage", "Barbecue", "Cuisine équipée"
    ]),
    isActive: true,
  },
  {
    title: "Riad Traditionnel à Fès - Batha",
    description: "Authentique riad marocain restauré avec soin, patios intérieurs et terrasse panoramique sur la vieille ville de Fès.",
    location: "Quartier Batha, Fès",
    city: "Fès",
    pricePerNight: 120.0,
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    imageUrl: "/images/services.jpg",
    amenities: JSON.stringify([
      "WiFi", "Climatisation", "Petit-déjeuner inclus", "Terrasse", "Hammam", "Cuisine marocaine", "Guide touristique disponible"
    ]),
    isActive: true,
  },
  {
    title: "Studio avec Vue Mer à Tanger - Malabata",
    description: "Charmant studio moderne avec vue imprenable sur l'océan Atlantique et la plage. Parfait pour les couples.",
    location: "Malabata, Tanger",
    city: "Tanger",
    pricePerNight: 80.0,
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    imageUrl: "/images/morocco.jpg",
    amenities: JSON.stringify([
      "WiFi", "Vue mer", "Climatisation", "Télévision", "Cuisine équipée", "Proche de la plage"
    ]),
    isActive: true,
  },
  {
    title: "Penthouse Luxueux à Rabat - Agdal",
    description: "Pentage spacieux avec terrasse privée et vue sur la ville. Quartier résidentiel calme et sécurisé d'Agdal.",
    location: "Agdal, Rabat",
    city: "Rabat",
    pricePerNight: 300.0,
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    imageUrl: "/images/hero.jpg",
    amenities: JSON.stringify([
      "WiFi", "Climatisation", "Terrasse privée", "Vue panoramique", "Parking sécurisé", "Gardiennage", "Proche des commerces"
    ]),
    isActive: true,
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { force = false } = body;

    // Check if properties already exist
    const existingCount = await db.property.count();
    
    if (existingCount > 0 && !force) {
      return NextResponse.json({
        success: true,
        message: `Database already contains ${existingCount} properties`,
        count: existingCount,
        properties: await db.property.findMany(),
      });
    }

    // If force is true, delete existing properties first
    if (force) {
      console.log('Force re-seeding: deleting existing properties...');
      await db.booking.deleteMany({});
      await db.property.deleteMany({});
    }

    // Create properties
    console.log('Creating properties...');
    const createdProperties = [];
    
    for (const propertyData of SAMPLE_PROPERTIES) {
      const existing = await db.property.findFirst({
        where: { title: propertyData.title },
      });

      if (!existing || force) {
        const property = await db.property.create({
          data: propertyData,
        });
        createdProperties.push(property);
        console.log(`✓ Created: ${property.title}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully ${force ? 're-seeded' : 'seeded'} ${createdProperties.length} properties`,
      count: createdProperties.length,
      properties: await db.property.findMany(),
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to initialize database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const count = await db.property.count();
    const properties = await db.property.findMany({
      take: 5,
    });

    return NextResponse.json({
      success: true,
      message: `Database contains ${count} properties`,
      count,
      sampleProperties: properties,
    });
  } catch (error) {
    console.error('Error checking database:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
