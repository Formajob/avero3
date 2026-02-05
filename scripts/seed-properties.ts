import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const properties = [
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
        "WiFi",
        "Climatisation",
        "Cuisine équipée",
        "Linge de maison",
        "Parking",
        "Piscine"
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
        "WiFi",
        "Climatisation",
        "Piscine privée",
        "Jardin",
        "Garage",
        "Barbecue",
        "Cuisine équipée"
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
        "WiFi",
        "Climatisation",
        "Petit-déjeuner inclus",
        "Terrasse",
        "Hammam",
        "Cuisine marocaine",
        "Guide touristique disponible"
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
        "WiFi",
        "Vue mer",
        "Climatisation",
        "Télévision",
        "Cuisine équipée",
        "Proche de la plage"
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
        "WiFi",
        "Climatisation",
        "Terrasse privée",
        "Vue panoramique",
        "Parking sécurisé",
        "Gardiennage",
        "Proche des commerces"
      ]),
      isActive: true,
    },
  ];

  console.log('Creating properties...');

  for (const property of properties) {
    const existing = await prisma.property.findFirst({
      where: { title: property.title },
    });

    if (!existing) {
      await prisma.property.create({
        data: property,
      });
      console.log(`✓ Created: ${property.title}`);
    } else {
      console.log(`⊘ Already exists: ${property.title}`);
    }
  }

  console.log('\n✅ Properties seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding properties:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
