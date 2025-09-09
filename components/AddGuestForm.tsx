'use client';

import { useCreateCustomer, useUpdateCustomer } from '@/hooks/useCustomers';
import { Form } from '@heroui/form';
import { useEffect, useState } from 'react';
import {
  AddressSection,
  BasicInformationSection,
  EmergencyContactSection,
  FormActionsSection,
  type FormData,
  initialFormData,
  PreferencesSection,
} from './AddGuestForm/';

interface AddGuestFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: any;
  isEditing?: boolean;
}

export default function AddGuestForm({
  onSuccess,
  onCancel,
  initialData,
  isEditing = false,
}: AddGuestFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createCustomerMutation = useCreateCustomer();
  const updateCustomerMutation = useUpdateCustomer();

  // Update form data when initialData changes (for editing mode)
  useEffect(() => {
    if (isEditing && initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        nationality: initialData.nationality || '',
        nationalId: initialData.nationalId || '',
        address: {
          street: initialData.address?.street || '',
          city: initialData.address?.city || '',
          state: initialData.address?.state || '',
          country: initialData.address?.country || '',
          zipCode: initialData.address?.zipCode || '',
        },
        emergencyContact: {
          name: initialData.emergencyContact?.name || '',
          phone: initialData.emergencyContact?.phone || '',
          relationship: initialData.emergencyContact?.relationship || '',
        },
        preferences: {
          smokingPreference:
            initialData.preferences?.smokingPreference || 'no-preference',
          dietaryRestrictions: Array.isArray(
            initialData.preferences?.dietaryRestrictions
          )
            ? initialData.preferences.dietaryRestrictions.join(', ')
            : initialData.preferences?.dietaryRestrictions || '',
          accessibilityNeeds: Array.isArray(
            initialData.preferences?.accessibilityNeeds
          )
            ? initialData.preferences.accessibilityNeeds.join(', ')
            : initialData.preferences?.accessibilityNeeds || '',
        },
      });
    }
  }, [isEditing, initialData]);

  const handleInputChange = (field: string, value: string) => {
    const keys = field.split('.');
    setFormData(prev => {
      const updated = { ...prev };
      let current: any = updated;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return updated;
    });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Clear mutation error when user starts typing
    if (createCustomerMutation.error) {
      createCustomerMutation.reset();
    }
    if (updateCustomerMutation.error) {
      updateCustomerMutation.reset();
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.nationality.trim())
      newErrors.nationality = 'Nationality is required';
    if (!formData.nationalId.trim())
      newErrors.nationalId = 'National ID is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const submitData = {
        ...formData,
        preferences: {
          ...formData.preferences,
          dietaryRestrictions: formData.preferences.dietaryRestrictions
            ? formData.preferences.dietaryRestrictions
                .split(',')
                .map(s => s.trim())
            : [],
          accessibilityNeeds: formData.preferences.accessibilityNeeds
            ? formData.preferences.accessibilityNeeds
                .split(',')
                .map(s => s.trim())
            : [],
        },
      };

      if (isEditing && initialData) {
        // Include the ID for updating
        const updateData = { ...submitData, _id: initialData._id };
        await updateCustomerMutation.mutateAsync(updateData);
      } else {
        await createCustomerMutation.mutateAsync(submitData);
      }

      // Reset form on success (only for create mode)
      if (!isEditing) {
        setFormData(initialFormData);
      }
      setErrors({});
      onSuccess?.();
    } catch (error: any) {
      setErrors({ general: error.message });
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(e);
  };

  const isLoading =
    createCustomerMutation.isPending || updateCustomerMutation.isPending;

  return (
    <Form
      onSubmit={onSubmit}
      className='w-full space-y-6'
      validationBehavior='native'
    >
      <div className='flex flex-col my-4'>
        <h2 className='text-xl font-bold'>
          {isEditing ? 'Edit Guest' : 'Add New Guest'}
        </h2>
        <p className='text-small text-default-600'>
          {isEditing
            ? 'Update the guest information below'
            : 'Fill in the guest information below'}
        </p>
      </div>

      {(errors.general ||
        createCustomerMutation.error ||
        updateCustomerMutation.error) && (
        <div className='bg-danger-50 border border-danger-200 p-3 rounded-lg'>
          <p className='text-danger-600 text-sm'>
            {errors.general ||
              createCustomerMutation.error?.message ||
              updateCustomerMutation.error?.message}
          </p>
        </div>
      )}

      <BasicInformationSection
        formData={formData}
        errors={errors}
        onInputChange={handleInputChange}
      />

      <AddressSection formData={formData} onInputChange={handleInputChange} />

      <EmergencyContactSection
        formData={formData}
        onInputChange={handleInputChange}
      />

      <PreferencesSection
        formData={formData}
        onInputChange={handleInputChange}
      />

      <FormActionsSection
        onCancel={onCancel}
        isLoading={isLoading}
        isEditing={isEditing}
      />
    </Form>
  );
}
