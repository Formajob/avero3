'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation & UI
    'badge.premier': 'Morocco\'s Premier Airbnb Concierge',
    'badge.about': 'About Us',
    'badge.services': 'Our Services',
    'badge.why': 'Why Avero',
    'badge.process': 'Process',
    'badge.contact': 'Contact Us',
    
    // Hero Section
    'hero.headline': 'Stress-free Airbnb management in Morocco',
    'hero.subheadline': 'Your property, our expertise.',
    'hero.btn.consultation': 'Get a free consultation',
    'hero.btn.whatsapp': 'Contact us on WhatsApp',
    
    // About Section
    'about.title': 'Your Trusted Partner in Morocco',
    'about.p1': 'Avero is a premium Airbnb concierge service dedicated to maximizing your rental income while eliminating the stress of property management. Based in Morocco, we combine local expertise with international standards to deliver exceptional service.',
    'about.p2': 'We understand the Moroccan market, guest expectations, and the nuances of short-term rentals. Our team of professionals handles everything from guest communication to maintenance, so you can focus on what matters most.',
    'about.trusted': 'Trusted by 50+ owners',
    'about.local': 'Local expertise',
    'about.support': '24/7 support',
    
    // Services Section
    'services.title': 'Complete Property Management',
    'services.subtitle': 'We handle every aspect of your Airbnb rental, from listing to checkout',
    'services.communication.title': 'Guest Communication',
    'services.communication.desc': '24/7 guest inquiries, booking management, and professional communication in multiple languages',
    'services.checkin.title': 'Check-in & Check-out',
    'services.checkin.desc': 'Seamless guest welcome and departure coordination, including key exchange and property inspection',
    'services.cleaning.title': 'Cleaning & Linens',
    'services.cleaning.desc': 'Professional cleaning services and high-quality linen management for every guest stay',
    'services.maintenance.title': 'Maintenance Coordination',
    'services.maintenance.desc': 'Prompt response to maintenance issues, regular inspections, and preventive care',
    'services.optimization.title': 'Airbnb Listing Optimization',
    'services.optimization.desc': 'Professional photography, compelling descriptions, dynamic pricing strategies, and continuous performance monitoring to maximize your occupancy and revenue',
    
    // Why Choose Section
    'why.title': 'The Avero Advantage',
    'why.subtitle': 'Discover why property owners trust us with their valuable investments',
    'why.local.title': 'Local Expertise',
    'why.local.desc': 'Deep knowledge of the Moroccan market, regulations, and guest preferences. We know what works in each region.',
    'why.pricing.title': 'Transparent Pricing',
    'why.pricing.desc': 'Clear, upfront pricing with no hidden fees. You always know what you\'re paying and what you\'re earning.',
    'why.revenue.title': 'Increased Revenue',
    'why.revenue.desc': 'Data-driven pricing strategies and professional optimization that consistently increase occupancy rates and rental income.',
    'why.peace.title': 'Peace of Mind',
    'why.peace.desc': 'Relax knowing your property is in expert hands. Regular updates, detailed reports, and complete transparency.',
    
    // How It Works Section
    'how.title': 'How It Works',
    'how.subtitle': 'Three simple steps to start earning passive income from your property',
    'how.step1.title': 'Property Analysis',
    'how.step1.desc': 'We assess your property\'s potential, market position, and rental income opportunities. Free of charge.',
    'how.step2.title': 'Setup & Optimization',
    'how.step2.desc': 'Professional photography, listing creation, pricing strategy, and everything needed to launch successfully.',
    'how.step3.title': 'Full Management',
    'how.step3.desc': 'We handle everything from guest bookings to maintenance, while providing detailed monthly reports.',
    'how.btn': 'Start Earning Today',
    
    // Contact Section
    'contact.title': 'Let\'s Get Started',
    'contact.subtitle': 'Ready to maximize your rental income? Get in touch for a free consultation and discover how Avero can transform your property investment.',
    'contact.form.title': 'Get Your Free Consultation',
    'contact.form.subtitle': 'Fill out the form and we\'ll get back to you within 24 hours',
    'contact.name': 'Full Name',
    'contact.name.placeholder': 'Your name',
    'contact.email': 'Email Address',
    'contact.email.placeholder': 'your@email.com',
    'contact.phone': 'Phone Number',
    'contact.phone.placeholder': '+212 634 232 006',
    'contact.location': 'Property Location',
    'contact.location.placeholder': 'City, neighborhood, and any details about your property',
    'contact.submit': 'Request Free Consultation',
    'contact.success': 'Thank you! We\'ll contact you soon.',
    'contact.error': 'Something went wrong. Please try again.',
    'contact.sending': 'Sending...',
    
    // Footer
    'footer.tagline': 'Votre bien, notre expertise',
    'footer.copyright': '© 2026 Avero',
    'footer.tagline2': 'Airbnb Concierge Services in Morocco',
    'footer.trusted': 'Trusted by property owners across Morocco',
    'footer.rights': 'All rights reserved',
    
    // Contact Info
    'contact.whatsapp': 'WhatsApp',
    'contact.email': 'Email',
    'contact.location_label': 'Location',
    'contact.morocco': 'Morocco',

    // Booking Section
    'badge.booking': 'Our Properties',
    'booking.title': 'Book Your Stay',
    'booking.subtitle': 'Discover our exceptional properties across Morocco',
    'booking.filterCity': 'Filter by City',
    'booking.filterGuests': 'Guests',
    'booking.allCities': 'All Cities',
    'booking.search': 'Search',
    'booking.bookNow': 'Book Now',
    'booking.bedroom': 'bedroom',
    'booking.bedrooms': 'bedrooms',
    'booking.bathroom': 'bathroom',
    'booking.bathrooms': 'bathrooms',
    'booking.guests': 'guests',
    'booking.formTitle': 'Complete Your Booking',
    'booking.location': 'Location',
    'booking.pricePerNight': 'Price per Night',
    'booking.checkIn': 'Check-in Date',
    'booking.checkOut': 'Check-out Date',
    'booking.nights': 'Nights',
    'booking.total': 'Total Price',
    'booking.numberOfGuests': 'Number of Guests',
    'booking.maxGuests': 'Max Guests',
    'booking.personalInfo': 'Personal Information',
    'booking.fullName': 'Full Name',
    'booking.fullNamePlaceholder': 'Your full name',
    'booking.email': 'Email Address',
    'booking.emailPlaceholder': 'your@email.com',
    'booking.phone': 'Phone Number',
    'booking.phonePlaceholder': '+212 634 232 006',
    'booking.specialRequests': 'Special Requests (Optional)',
    'booking.specialRequestsPlaceholder': 'Any special requests or requirements...',
    'booking.confirm': 'Confirm Booking',
    'booking.sending': 'Processing...',
    'booking.success': 'Booking Confirmed!',
    'booking.error': 'Error processing booking. Please try again.',
    'booking.noProperties': 'No properties match your criteria.',
  },
  fr: {
    // Navigation & UI
    'badge.premier': 'Le Premier Concierge Airbnb au Maroc',
    'badge.about': 'À Propos',
    'badge.services': 'Nos Services',
    'badge.why': 'Pourquoi Avero',
    'badge.process': 'Processus',
    'badge.contact': 'Contactez-nous',
    
    // Hero Section
    'hero.headline': 'Gestion Airbnb sans stress au Maroc',
    'hero.subheadline': 'Votre bien, notre expertise.',
    'hero.btn.consultation': 'Obtenez une consultation gratuite',
    'hero.btn.whatsapp': 'Contactez-nous sur WhatsApp',
    
    // About Section
    'about.title': 'Votre Partenaire de Confiance au Maroc',
    'about.p1': 'Avero est un service premium de concierge Airbnb dédié à maximiser vos revenus locatifs tout en éliminant le stress de la gestion immobilière. Basé au Maroc, nous combinons une expertise locale avec des normes internationales pour offrir un service exceptionnel.',
    'about.p2': 'Nous comprenons le marché marocain, les attentes des voyageurs et les nuances des locations à court terme. Notre équipe de professionnels gère tout, de la communication avec les invités à l\'entretien, afin que vous puissiez vous concentrer sur l\'essentiel.',
    'about.trusted': 'Approuvé par +50 propriétaires',
    'about.local': 'Expertise locale',
    'about.support': 'Support 24/7',
    
    // Services Section
    'services.title': 'Gestion Complète de Propriété',
    'services.subtitle': 'Nous gérons chaque aspect de votre location Airbnb, de l\'annonce au départ des invités',
    'services.communication.title': 'Communication avec les Invités',
    'services.communication.desc': 'Réponse 24h/24 aux demandes des invités, gestion des réservations et communication professionnelle en plusieurs langues',
    'services.checkin.title': 'Check-in & Check-out',
    'services.checkin.desc': 'Coordination fluide de l\'accueil et du départ des invités, incluant l\'échange des clés et l\'inspection de la propriété',
    'services.cleaning.title': 'Nettoyage & Linge',
    'services.cleaning.desc': 'Services de nettoyage professionnels et gestion de linge de haute qualité pour chaque séjour',
    'services.maintenance.title': 'Coordination de l\'Entretien',
    'services.maintenance.desc': 'Réponse rapide aux problèmes d\'entretien, inspections régulières et entretien préventif',
    'services.optimization.title': 'Optimisation de l\'Annonce Airbnb',
    'services.optimization.desc': 'Photographie professionnelle, descriptions convaincantes, stratégies de tarification dynamique et surveillance continue des performances pour maximiser votre occupation et vos revenus',
    
    // Why Choose Section
    'why.title': 'L\'Avantage Avero',
    'why.subtitle': 'Découvrez pourquoi les propriétaires nous confient leurs investissements précieux',
    'why.local.title': 'Expertise Locale',
    'why.local.desc': 'Connaissance approfondie du marché marocain, des réglementations et des préférences des voyageurs. Nous savons ce qui fonctionne dans chaque région.',
    'why.pricing.title': 'Tarification Transparente',
    'why.pricing.desc': 'Tarification claire et transparente sans frais cachés. Vous savez toujours ce que vous payez et ce que vous gagnez.',
    'why.revenue.title': 'Revenus Accrus',
    'why.revenue.desc': 'Stratégies de tarification basées sur les données et optimisation professionnelle qui augmentent constamment les taux d\'occupation et les revenus locatifs.',
    'why.peace.title': 'Sérénité d\'Esprit',
    'why.peace.desc': 'Détendez-vous en sachant que votre propriété est entre des mains expertes. Mises à jour régulières, rapports détaillés et transparence totale.',
    
    // How It Works Section
    'how.title': 'Comment Ça Fonctionne',
    'how.subtitle': 'Trois étapes simples pour commencer à générer des revenus passifs avec votre propriété',
    'how.step1.title': 'Analyse de la Propriété',
    'how.step1.desc': 'Nous évaluons le potentiel de votre propriété, sa position sur le marché et les opportunités de revenus locatifs. Gratuitement.',
    'how.step2.title': 'Configuration & Optimisation',
    'how.step2.desc': 'Photographie professionnelle, création d\'annonce, stratégie de tarification et tout ce qu\'il faut pour un lancement réussi.',
    'how.step3.title': 'Gestion Complète',
    'how.step3.desc': 'Nous gérons tout, des réservations des invités à l\'entretien, tout en fournissant des rapports mensuels détaillés.',
    'how.btn': 'Commencez à Gagner Aujourd\'hui',
    
    // Contact Section
    'contact.title': 'Commençons',
    'contact.subtitle': 'Prêt à maximiser vos revenus locatifs? Contactez-nous pour une consultation gratuite et découvrez comment Avero peut transformer votre investissement immobilier.',
    'contact.form.title': 'Obtenez Votre Consultation Gratuite',
    'contact.form.subtitle': 'Remplissez le formulaire et nous vous répondrons dans les 24 heures',
    'contact.name': 'Nom Complet',
    'contact.name.placeholder': 'Votre nom',
    'contact.email': 'Adresse Email',
    'contact.email.placeholder': 'votre@email.com',
    'contact.phone': 'Numéro de Téléphone',
    'contact.phone.placeholder': '+212 634 232 006',
    'contact.location': 'Emplacement de la Propriété',
    'contact.location.placeholder': 'Ville, quartier et détails sur votre propriété',
    'contact.submit': 'Demander une Consultation Gratuite',
    'contact.success': 'Merci! Nous vous contacterons bientôt.',
    'contact.error': 'Une erreur s\'est produite. Veuillez réessayer.',
    'contact.sending': 'Envoi en cours...',
    
    // Footer
    'footer.tagline': 'Votre concierge de confiance Airbnb au Maroc',
    'footer.copyright': '© 2026 Avero',
    'footer.tagline2': 'Services de Concierge Airbnb au Maroc',
    'footer.trusted': 'Approuvé par les propriétaires à travers le Maroc',
    'footer.rights': 'Tous droits réservés',
    
    // Contact Info
    'contact.whatsapp': 'WhatsApp',
    'contact.email': 'Email',
    'contact.location_label': 'Emplacement',
    'contact.morocco': 'Maroc',

    // Booking Section
    'badge.booking': 'Nos Propriétés',
    'booking.title': 'Réservez Votre Séjour',
    'booking.subtitle': 'Découvrez nos propriétés exceptionnelles à travers le Maroc',
    'booking.filterCity': 'Filtrer par Ville',
    'booking.filterGuests': 'Voyageurs',
    'booking.allCities': 'Toutes les Villes',
    'booking.search': 'Rechercher',
    'booking.bookNow': 'Réserver',
    'booking.bedroom': 'chambre',
    'booking.bedrooms': 'chambres',
    'booking.bathroom': 'salle de bain',
    'booking.bathrooms': 'salles de bain',
    'booking.guests': 'voyageurs',
    'booking.formTitle': 'Complétez Votre Réservation',
    'booking.location': 'Emplacement',
    'booking.pricePerNight': 'Prix par Nuit',
    'booking.checkIn': 'Date d\'Arrivée',
    'booking.checkOut': 'Date de Départ',
    'booking.nights': 'Nuits',
    'booking.total': 'Prix Total',
    'booking.numberOfGuests': 'Nombre de Voyageurs',
    'booking.maxGuests': 'Max Voyageurs',
    'booking.personalInfo': 'Informations Personnelles',
    'booking.fullName': 'Nom Complet',
    'booking.fullNamePlaceholder': 'Votre nom complet',
    'booking.email': 'Adresse Email',
    'booking.emailPlaceholder': 'votre@email.com',
    'booking.phone': 'Numéro de Téléphone',
    'booking.phonePlaceholder': '+212 634 232 006',
    'booking.specialRequests': 'Demandes Spéciales (Optionnel)',
    'booking.specialRequestsPlaceholder': 'Toutes demandes spéciales ou exigences...',
    'booking.confirm': 'Confirmer la Réservation',
    'booking.sending': 'Traitement en cours...',
    'booking.success': 'Réservation Confirmée!',
    'booking.error': 'Erreur lors du traitement. Veuillez réessayer.',
    'booking.noProperties': 'Aucune propriété ne correspond à vos critères.',
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Initialize language from localStorage or default to 'en'
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language') as Language;
      if (saved && (saved === 'en' || saved === 'fr')) {
        return saved;
      }
    }
    return 'en';
  });

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
