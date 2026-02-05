'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, X, Loader2, CheckCircle } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  pricePerNight: number;
  maxGuests: number;
  location: string;
}

interface BookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  t: (key: string) => string;
}

export function BookingForm({ isOpen, onClose, property, t }: BookingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [nights, setNights] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    checkInDate: '',
    checkOutDate: '',
    guests: 1,
    specialRequests: '',
  });

  // Calculate nights and total price
  useEffect(() => {
    if (formData.checkInDate && formData.checkOutDate && property) {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setNights(diffDays);
      setTotalPrice(diffDays * property.pricePerNight);
    } else {
      setNights(0);
      setTotalPrice(0);
    }
  }, [formData.checkInDate, formData.checkOutDate, property]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        guestName: '',
        guestEmail: '',
        guestPhone: '',
        checkInDate: '',
        checkOutDate: '',
        guests: 1,
        specialRequests: '',
      });
      setSubmitStatus('idle');
      setNights(0);
      setTotalPrice(0);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          ...formData,
          guests: parseInt(formData.guests.toString()),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus('success');
        // Close dialog after 2 seconds
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setSubmitStatus('error');
        alert(result.error || t('booking.error'));
      }
    } catch (error) {
      setSubmitStatus('error');
      alert(t('booking.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestsChange = (value: number) => {
    const newValue = Math.max(1, Math.min(value, property?.maxGuests || 10));
    setFormData({ ...formData, guests: newValue });
  };

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  if (!property) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl mb-2">{t('booking.formTitle')}</DialogTitle>
              <DialogDescription className="text-base">
                {property.title}
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="flex-shrink-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Property Info */}
          <div className="bg-amber-50 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm text-gray-600">{t('booking.location')}</p>
                <p className="font-medium">{property.location}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">{t('booking.pricePerNight')}</p>
                <p className="font-bold text-blue-900">{property.pricePerNight} MAD</p>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkIn">{t('booking.checkIn')} *</Label>
              <Input
                id="checkIn"
                type="date"
                min={today}
                required
                value={formData.checkInDate}
                onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                className="border-gray-300 focus:border-amber-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkOut">{t('booking.checkOut')} *</Label>
              <Input
                id="checkOut"
                type="date"
                min={formData.checkInDate || today}
                required
                value={formData.checkOutDate}
                onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
                className="border-gray-300 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Price Summary */}
          {nights > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>{t('booking.nights')}: {nights}</span>
                <span className="font-medium">{nights * property.pricePerNight} MAD</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-lg font-bold">
                <span>{t('booking.total')}</span>
                <span className="text-blue-900">{totalPrice.toFixed(2)} MAD</span>
              </div>
            </div>
          )}

          {/* Number of Guests */}
          <div className="space-y-2">
            <Label htmlFor="guests">{t('booking.numberOfGuests')} *</Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleGuestsChange(formData.guests - 1)}
                disabled={formData.guests <= 1}
              >
                -
              </Button>
              <Input
                id="guests"
                type="number"
                min="1"
                max={property.maxGuests}
                value={formData.guests}
                onChange={(e) => handleGuestsChange(parseInt(e.target.value) || 1)}
                className="w-20 text-center"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleGuestsChange(formData.guests + 1)}
                disabled={formData.guests >= property.maxGuests}
              >
                +
              </Button>
              <span className="text-sm text-gray-600">
                {t('booking.maxGuests')}: {property.maxGuests}
              </span>
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t('booking.personalInfo')}</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="guestName">{t('booking.fullName')} *</Label>
                <Input
                  id="guestName"
                  required
                  value={formData.guestName}
                  onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                  placeholder={t('booking.fullNamePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guestEmail">{t('booking.email')} *</Label>
                <Input
                  id="guestEmail"
                  type="email"
                  required
                  value={formData.guestEmail}
                  onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                  placeholder={t('booking.emailPlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guestPhone">{t('booking.phone')} *</Label>
                <Input
                  id="guestPhone"
                  type="tel"
                  required
                  value={formData.guestPhone}
                  onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                  placeholder={t('booking.phonePlaceholder')}
                />
              </div>
            </div>
          </div>

          {/* Special Requests */}
          <div className="space-y-2">
            <Label htmlFor="specialRequests">{t('booking.specialRequests')}</Label>
            <Textarea
              id="specialRequests"
              value={formData.specialRequests}
              onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
              placeholder={t('booking.specialRequestsPlaceholder')}
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || submitStatus === 'success'}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white py-6 text-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {t('booking.sending')}
              </>
            ) : submitStatus === 'success' ? (
              <>
                <CheckCircle className="mr-2 h-5 w-5" />
                {t('booking.success')}
              </>
            ) : (
              `${t('booking.confirm')} - ${totalPrice.toFixed(2)} MAD`
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
