'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-1">
      <Button
        variant={language === 'en' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLanguage('en')}
        className={`${
          language === 'en'
            ? 'bg-amber-500 text-white hover:bg-amber-600'
            : 'text-white hover:bg-white/20'
        }`}
      >
        EN
      </Button>
      <div className="w-px h-4 bg-white/30" />
      <Button
        variant={language === 'fr' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLanguage('fr')}
        className={`${
          language === 'fr'
            ? 'bg-amber-500 text-white hover:bg-amber-600'
            : 'text-white hover:bg-white/20'
        }`}
      >
        FR
      </Button>
    </div>
  );
}
