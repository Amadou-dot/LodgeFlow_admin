'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import { Switch } from '@heroui/switch';
import { Divider } from '@heroui/divider';
import { Chip } from '@heroui/chip';
import type { AppSettings } from '@/app/api/settings/route';
import { useUpdateSettings, useResetSettings } from '@/hooks/useSettings';

interface SettingsFormProps {
  settings: AppSettings;
  onSettingsUpdate: () => void;
}

export default function SettingsForm({ settings, onSettingsUpdate }: SettingsFormProps) {
  const [formData, setFormData] = useState<Partial<AppSettings>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const updateSettings = useUpdateSettings();
  const resetSettings = useResetSettings();

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  useEffect(() => {
    // Check if there are any changes
    const isChanged = Object.keys(formData).some(key => {
      const currentValue = formData[key as keyof AppSettings];
      const originalValue = settings[key as keyof AppSettings];
      return currentValue !== originalValue;
    });
    setHasChanges(isChanged);
  }, [formData, settings]);

  const handleInputChange = (field: keyof AppSettings, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync(formData);
      onSettingsUpdate();
      setHasChanges(false);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset all settings to default values? This action cannot be undone.')) {
      try {
        await resetSettings.mutateAsync();
        onSettingsUpdate();
        setHasChanges(false);
      } catch (error) {
        console.error('Error resetting settings:', error);
      }
    }
  };

  const handleDiscard = () => {
    setFormData(settings);
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      {/* Booking Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Booking Settings</h3>
            <Chip size="sm" color="primary" variant="flat">Core</Chip>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Minimum Booking Length"
              type="number"
              value={formData.minBookingLength?.toString() || ''}
              onChange={(e) => handleInputChange('minBookingLength', parseInt(e.target.value) || 1)}
              endContent="nights"
              min="1"
              max="30"
            />
            <Input
              label="Maximum Booking Length"
              type="number"
              value={formData.maxBookingLength?.toString() || ''}
              onChange={(e) => handleInputChange('maxBookingLength', parseInt(e.target.value) || 1)}
              endContent="nights"
              min="1"
              max="365"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Maximum Guests Per Booking"
              type="number"
              value={formData.maxGuestsPerBooking?.toString() || ''}
              onChange={(e) => handleInputChange('maxGuestsPerBooking', parseInt(e.target.value) || 1)}
              endContent="guests"
              min="1"
              max="20"
            />
            <Select
              label="Cancellation Policy"
              selectedKeys={formData.cancellationPolicy ? [formData.cancellationPolicy] : []}
              onSelectionChange={(keys: any) => {
                const value = Array.from(keys)[0] as string;
                handleInputChange('cancellationPolicy', value);
              }}
            >
              <SelectItem key="flexible">Flexible</SelectItem>
              <SelectItem key="moderate">Moderate</SelectItem>
              <SelectItem key="strict">Strict</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Check-in/Check-out Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Check-in & Check-out</h3>
            <Chip size="sm" color="secondary" variant="flat">Operations</Chip>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Check-in Time"
              type="time"
              value={formData.checkInTime || ''}
              onChange={(e) => handleInputChange('checkInTime', e.target.value)}
            />
            <Input
              label="Check-out Time"
              type="time"
              value={formData.checkOutTime || ''}
              onChange={(e) => handleInputChange('checkOutTime', e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Early Check-in Fee"
              type="number"
              value={formData.earlyCheckInFee?.toString() || ''}
              onChange={(e) => handleInputChange('earlyCheckInFee', parseInt(e.target.value) || 0)}
              startContent="$"
              min="0"
            />
            <Input
              label="Late Check-out Fee"
              type="number"
              value={formData.lateCheckOutFee?.toString() || ''}
              onChange={(e) => handleInputChange('lateCheckOutFee', parseInt(e.target.value) || 0)}
              startContent="$"
              min="0"
            />
          </div>
        </CardBody>
      </Card>

      {/* Pricing & Deposits */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Pricing & Deposits</h3>
            <Chip size="sm" color="success" variant="flat">Financial</Chip>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Breakfast Price"
              type="number"
              value={formData.breakfastPrice?.toString() || ''}
              onChange={(e) => handleInputChange('breakfastPrice', parseInt(e.target.value) || 0)}
              startContent="$"
              endContent="per person"
              min="0"
            />
            <Input
              label="Pet Fee"
              type="number"
              value={formData.petFee?.toString() || ''}
              onChange={(e) => handleInputChange('petFee', parseInt(e.target.value) || 0)}
              startContent="$"
              endContent="per night"
              min="0"
            />
          </div>

          <Divider />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Require Deposit</p>
                <p className="text-sm text-default-600">Require guests to pay a deposit when booking</p>
              </div>
              <Switch
                isSelected={formData.requireDeposit || false}
                onValueChange={(value) => handleInputChange('requireDeposit', value)}
              />
            </div>

            {formData.requireDeposit && (
              <Input
                label="Deposit Percentage"
                type="number"
                value={formData.depositPercentage?.toString() || ''}
                onChange={(e) => handleInputChange('depositPercentage', parseInt(e.target.value) || 0)}
                endContent="%"
                min="0"
                max="100"
              />
            )}
          </div>
        </CardBody>
      </Card>

      {/* Amenities & Policies */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Amenities & Policies</h3>
            <Chip size="sm" color="warning" variant="flat">Policies</Chip>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">WiFi Included</p>
                <p className="text-sm text-default-600">Free WiFi for all guests</p>
              </div>
              <Switch
                isSelected={formData.wifiIncluded || false}
                onValueChange={(value) => handleInputChange('wifiIncluded', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Parking Included</p>
                <p className="text-sm text-default-600">Free parking for guests</p>
              </div>
              <Switch
                isSelected={formData.parkingIncluded || false}
                onValueChange={(value) => handleInputChange('parkingIncluded', value)}
              />
            </div>

            {!formData.parkingIncluded && (
              <Input
                label="Parking Fee"
                type="number"
                value={formData.parkingFee?.toString() || ''}
                onChange={(e) => handleInputChange('parkingFee', parseInt(e.target.value) || 0)}
                startContent="$"
                endContent="per night"
                min="0"
              />
            )}

            <Divider />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Allow Pets</p>
                <p className="text-sm text-default-600">Pets are welcome (fee may apply)</p>
              </div>
              <Switch
                isSelected={formData.allowPets || false}
                onValueChange={(value) => handleInputChange('allowPets', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Smoking Allowed</p>
                <p className="text-sm text-default-600">Allow smoking in designated areas</p>
              </div>
              <Switch
                isSelected={formData.smokingAllowed || false}
                onValueChange={(value) => handleInputChange('smokingAllowed', value)}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <div className="flex gap-3">
              <Button
                color="primary"
                onPress={handleSave}
                isLoading={updateSettings.isPending}
                isDisabled={!hasChanges}
              >
                Save Changes
              </Button>
              {hasChanges && (
                <Button
                  color="default"
                  variant="bordered"
                  onPress={handleDiscard}
                >
                  Discard Changes
                </Button>
              )}
            </div>
            
            <Button
              color="danger"
              variant="bordered"
              onPress={handleReset}
              isLoading={resetSettings.isPending}
            >
              Reset to Defaults
            </Button>
          </div>

          {hasChanges && (
            <p className="text-sm text-warning mt-3">
              You have unsaved changes. Don't forget to save your settings.
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
