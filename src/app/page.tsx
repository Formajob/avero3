  'use client';

  import { useState } from 'react';
  import { useLanguage } from '@/contexts/LanguageContext';
  import { Navigation } from '@/components/Navigation';
  import { BookingSection } from '@/components/booking/BookingSection';
  import { Button } from '@/components/ui/button';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
  import { Input } from '@/components/ui/input';
  import { Label } from '@/components/ui/label';
  import { Textarea } from '@/components/ui/textarea';
  import { Separator } from '@/components/ui/separator';
  import { Badge } from '@/components/ui/badge';
  import { 
    MessageCircle, 
    Phone, 
    Mail, 
    MapPin, 
    CheckCircle, 
    ArrowRight,
    Calendar,
    Clock,
    Home,
    TrendingUp,
    Shield,
    Heart,
    Star
  } from 'lucide-react';

  export default function AveroPage() {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      propertyLocation: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          setSubmitMessage(t('contact.success'));
          setFormData({ name: '', email: '', phone: '', propertyLocation: '' });
        } else {
          setSubmitMessage(t('contact.error'));
        }
      } catch (error) {
        setSubmitMessage(t('contact.error'));
      } finally {
        setIsSubmitting(false);
      }
    };

    const whatsappNumber = '212634232006';

    return (
      <div className="min-h-screen flex flex-col bg-white">
        {/* Navigation */}
        <Navigation />

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/hero.jpg"
              alt="Luxury Apartment in Morocco"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
          </div>

          {/* Content */}
          <div className="relative z-10 container mx-auto px-4 text-center text-white">
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
              <Badge className="mb-4 bg-amber-500 hover:bg-amber-600 text-white px-4 py-1 text-sm">
                {t('badge.premier')}
              </Badge>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                {t('hero.headline')}
              </h1>
              <p className="text-xl md:text-2xl text-gray-100 max-w-2xl mx-auto">
                {t('hero.subheadline')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                <Button
                  size="lg"
                  className="bg-amber-500 hover:bg-amber-600 text-white text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  {t('hero.btn.consultation')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  className="bg-green-500 hover:bg-green-600 text-white text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  onClick={() => window.open(`https://wa.me/${whatsappNumber}`, '_blank')}
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  {t('hero.btn.whatsapp')}
                </Button>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
            <ArrowRight className="h-8 w-8 text-white rotate-90" />
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 md:py-28 bg-gradient-to-b from-white to-amber-50/50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <Badge className="bg-blue-900 hover:bg-blue-800 text-white">
                    {t('badge.about')}
                  </Badge>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                    {t('about.title')}
                  </h2>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {t('about.p1')}
                  </p>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {t('about.p2')}
                  </p>
                  <div className="flex flex-wrap gap-4 pt-4">
                    <div className="flex items-center gap-2 text-gray-900">
                      <CheckCircle className="h-5 w-5 text-amber-600" />
                      <span className="font-medium">{t('about.trusted')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-900">
                      <CheckCircle className="h-5 w-5 text-amber-600" />
                      <span className="font-medium">{t('about.local')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-900">
                      <CheckCircle className="h-5 w-5 text-amber-600" />
                      <span className="font-medium">{t('about.support')}</span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <img
                    src="/images/about.jpg"
                    alt="Professional property manager"
                    className="rounded-2xl shadow-2xl w-full"
                  />
                  <div className="absolute -bottom-6 -right-6 bg-blue-900 text-white p-6 rounded-xl shadow-xl hidden md:block">
                    <div className="text-4xl font-bold">24/7</div>
                    <div className="text-sm text-gray-200">{t('about.support')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center space-y-4 mb-16">
                <Badge className="bg-amber-500 hover:bg-amber-600 text-white">
                  {t('badge.services')}
                </Badge>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                  {t('services.title')}
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  {t('services.subtitle')}
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Service 1 */}
                <Card className="border-2 border-gray-100 hover:border-amber-300 transition-all duration-300 hover:shadow-xl group">
                  <CardHeader>
                    <div className="w-14 h-14 bg-blue-900 rounded-lg flex items-center justify-center mb-4 group-hover:bg-amber-500 transition-colors">
                      <MessageCircle className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-xl text-gray-900">{t('services.communication.title')}</CardTitle>
                    <CardDescription className="text-gray-600 text-base">
                      {t('services.communication.desc')}
                    </CardDescription>
                  </CardHeader>
                </Card>

                {/* Service 2 */}
                <Card className="border-2 border-gray-100 hover:border-amber-300 transition-all duration-300 hover:shadow-xl group">
                  <CardHeader>
                    <div className="w-14 h-14 bg-blue-900 rounded-lg flex items-center justify-center mb-4 group-hover:bg-amber-500 transition-colors">
                      <Calendar className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-xl text-gray-900">{t('services.checkin.title')}</CardTitle>
                    <CardDescription className="text-gray-600 text-base">
                      {t('services.checkin.desc')}
                    </CardDescription>
                  </CardHeader>
                </Card>

                {/* Service 3 */}
                <Card className="border-2 border-gray-100 hover:border-amber-300 transition-all duration-300 hover:shadow-xl group">
                  <CardHeader>
                    <div className="w-14 h-14 bg-blue-900 rounded-lg flex items-center justify-center mb-4 group-hover:bg-amber-500 transition-colors">
                      <Home className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-xl text-gray-900">{t('services.cleaning.title')}</CardTitle>
                    <CardDescription className="text-gray-600 text-base">
                      {t('services.cleaning.desc')}
                    </CardDescription>
                  </CardHeader>
                </Card>

                {/* Service 4 */}
                <Card className="border-2 border-gray-100 hover:border-amber-300 transition-all duration-300 hover:shadow-xl group">
                  <CardHeader>
                    <div className="w-14 h-14 bg-blue-900 rounded-lg flex items-center justify-center mb-4 group-hover:bg-amber-500 transition-colors">
                      <Clock className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-xl text-gray-900">{t('services.maintenance.title')}</CardTitle>
                    <CardDescription className="text-gray-600 text-base">
                      {t('services.maintenance.desc')}
                    </CardDescription>
                  </CardHeader>
                </Card>

                {/* Service 5 */}
                <Card className="border-2 border-gray-100 hover:border-amber-300 transition-all duration-300 hover:shadow-xl group md:col-span-2 lg:col-span-2">
                  <CardHeader>
                    <div className="w-14 h-14 bg-blue-900 rounded-lg flex items-center justify-center mb-4 group-hover:bg-amber-500 transition-colors">
                      <TrendingUp className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-xl text-gray-900">{t('services.optimization.title')}</CardTitle>
                    <CardDescription className="text-gray-600 text-base">
                      {t('services.optimization.desc')}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Section */}
        <section id="why" className="py-20 md:py-28 bg-gradient-to-b from-amber-50/50 to-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center space-y-4 mb-16">
                <Badge className="bg-blue-900 hover:bg-blue-800 text-white">
                  {t('badge.why')}
                </Badge>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                  {t('why.title')}
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  {t('why.subtitle')}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Advantage 1 */}
                <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-6 w-6 text-white" />
                      </div>
                      <div className="space-y-2">
                        <CardTitle className="text-xl text-gray-900">{t('why.local.title')}</CardTitle>
                        <CardDescription className="text-gray-600 text-base">
                          {t('why.local.desc')}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Advantage 2 */}
                <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <div className="space-y-2">
                        <CardTitle className="text-xl text-gray-900">{t('why.pricing.title')}</CardTitle>
                        <CardDescription className="text-gray-600 text-base">
                          {t('why.pricing.desc')}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Advantage 3 */}
                <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="h-6 w-6 text-white" />
                      </div>
                      <div className="space-y-2">
                        <CardTitle className="text-xl text-gray-900">{t('why.revenue.title')}</CardTitle>
                        <CardDescription className="text-gray-600 text-base">
                          {t('why.revenue.desc')}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Advantage 4 */}
                <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Heart className="h-6 w-6 text-white" />
                      </div>
                      <div className="space-y-2">
                        <CardTitle className="text-xl text-gray-900">{t('why.peace.title')}</CardTitle>
                        <CardDescription className="text-gray-600 text-base">
                          {t('why.peace.desc')}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 md:py-28 bg-blue-900 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center space-y-4 mb-16">
                <Badge className="bg-amber-500 hover:bg-amber-600 text-white">
                  {t('badge.process')}
                </Badge>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                  {t('how.title')}
                </h2>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  {t('how.subtitle')}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {/* Step 1 */}
                <div className="relative text-center space-y-4">
                  <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center mx-auto text-3xl font-bold shadow-xl">
                    1
                  </div>
                  <h3 className="text-2xl font-bold">{t('how.step1.title')}</h3>
                  <p className="text-gray-300 text-lg">
                    {t('how.step1.desc')}
                  </p>
                  <div className="hidden md:block absolute top-10 right-0 w-1/2 h-0.5 bg-gradient-to-r from-amber-500 to-transparent"></div>
                </div>

                {/* Step 2 */}
                <div className="relative text-center space-y-4">
                  <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center mx-auto text-3xl font-bold shadow-xl">
                    2
                  </div>
                  <h3 className="text-2xl font-bold">{t('how.step2.title')}</h3>
                  <p className="text-gray-300 text-lg">
                    {t('how.step2.desc')}
                  </p>
                  <div className="hidden md:block absolute top-10 right-0 w-1/2 h-0.5 bg-gradient-to-r from-amber-500 to-transparent"></div>
                </div>

                {/* Step 3 */}
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center mx-auto text-3xl font-bold shadow-xl">
                    3
                  </div>
                  <h3 className="text-2xl font-bold">{t('how.step3.title')}</h3>
                  <p className="text-gray-300 text-lg">
                    {t('how.step3.desc')}
                  </p>
                </div>
              </div>

              <div className="text-center mt-12">
                <Button
                  size="lg"
                  className="bg-amber-500 hover:bg-amber-600 text-white text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  {t('how.btn')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Booking Section */}
        <BookingSection />

        {/* Contact Section */}
        <section id="contact" className="py-20 md:py-28 bg-gradient-to-b from-white to-amber-50/50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-start">
                <div className="space-y-6">
                  <Badge className="bg-blue-900 hover:bg-blue-800 text-white">
                    {t('badge.contact')}
                  </Badge>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                    {t('contact.title')}
                  </h2>
                  <p className="text-lg text-gray-700">
                    {t('contact.subtitle')}
                  </p>

                  <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-4 text-gray-900">
                      <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold">{t('contact.whatsapp')}</div>
                        <div className="text-gray-600">+212 634 232 006</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-gray-900">
                      <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mail className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold">{t('contact.email')}</div>
                        <div className="text-gray-600">averomaroc@outlook.com</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-gray-900">
                      <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold">{t('contact.location_label')}</div>
                        <div className="text-gray-600">{t('contact.morocco')}</div>
                      </div>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full md:w-auto bg-green-500 hover:bg-green-600 text-white text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 mt-6"
                    onClick={() => window.open(`https://wa.me/${whatsappNumber}`, '_blank')}
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    {t('contact.whatsapp')}
                  </Button>
                </div>

                <Card className="shadow-xl border-2 border-gray-100">
                  <CardHeader>
                    <CardTitle className="text-2xl text-gray-900">{t('contact.form.title')}</CardTitle>
                    <CardDescription className="text-gray-600 text-base">
                      {t('contact.form.subtitle')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-900">{t('contact.name')}</Label>
                        <Input
                          id="name"
                          required
                          placeholder={t('contact.name.placeholder')}
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="border-gray-300 focus:border-amber-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-900">{t('contact.email')}</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          placeholder={t('contact.email.placeholder')}
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="border-gray-300 focus:border-amber-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-gray-900">{t('contact.phone')}</Label>
                        <Input
                          id="phone"
                          type="tel"
                          required
                          placeholder={t('contact.phone.placeholder')}
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="border-gray-300 focus:border-amber-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="propertyLocation" className="text-gray-900">{t('contact.location')}</Label>
                        <Textarea
                          id="propertyLocation"
                          required
                          placeholder={t('contact.location.placeholder')}
                          value={formData.propertyLocation}
                          onChange={(e) => setFormData({ ...formData, propertyLocation: e.target.value })}
                          rows={3}
                          className="border-gray-300 focus:border-amber-500"
                        />
                      </div>

                      {submitMessage && (
                        <div className={`p-4 rounded-lg ${submitMessage.includes(t('contact.success')) ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                          {submitMessage}
                        </div>
                      )}

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-900 hover:bg-blue-800 text-white text-lg py-6 rounded-lg transition-all duration-300"
                      >
                        {isSubmitting ? t('contact.sending') : t('contact.submit')}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-blue-900 text-white py-12 mt-auto">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8 items-center">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Avero</h3>
                  <p className="text-gray-300">{t('footer.tagline')}</p>
                </div>

                <div className="text-center space-y-4">
                  <div className="flex justify-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/30 text-white hover:bg-white/10"
                      onClick={() => window.open(`https://wa.me/${whatsappNumber}`, '_blank')}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      {t('contact.whatsapp')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/30 text-white hover:bg-white/10"
                      onClick={() => window.location.href = 'mailto:averomaroc@outlook.com'}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      {t('contact.email')}
                    </Button>
                  </div>
                </div>

                <div className="text-right space-y-2">
                  <p className="text-gray-300">{t('footer.copyright')}</p>
                  <p className="text-sm text-gray-400">{t('footer.tagline2')}</p>
                </div>
              </div>

              <Separator className="my-8 bg-white/20" />

              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Star className="h-4 w-4" />
                  <span>{t('footer.trusted')}</span>
                </div>
                <p className="text-sm text-gray-400">
                  {t('footer.rights')}
                </p>
              </div>
            </div>
          </div>
        </footer>

        <style jsx global>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-fade-in {
            animation: fadeIn 0.8s ease-out;
          }

          /* Custom scrollbar */
          ::-webkit-scrollbar {
            width: 10px;
          }

          ::-webkit-scrollbar-track {
            background: #f1f1f1;
          }

          ::-webkit-scrollbar-thumb {
            background: #2C5282;
            border-radius: 5px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: #1E3A5F;
          }
        `}</style>
      </div>
    );
  }
