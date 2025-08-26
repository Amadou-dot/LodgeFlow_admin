"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Select, SelectItem } from "@heroui/select";
import { useCreateCustomer } from "@/hooks/useCustomers";

interface AddGuestFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  nationality: string;
  nationalId: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  preferences: {
    smokingPreference: "smoking" | "non-smoking" | "no-preference";
    dietaryRestrictions: string;
    accessibilityNeeds: string;
  };
}

const initialFormData: FormData = {
  name: "",
  email: "",
  phone: "",
  nationality: "",
  nationalId: "",
  address: {
    street: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
  },
  emergencyContact: {
    name: "",
    phone: "",
    relationship: "",
  },
  preferences: {
    smokingPreference: "no-preference",
    dietaryRestrictions: "",
    accessibilityNeeds: "",
  },
};

const countries = [
  "United States",
  "Canada",
  "United Kingdom",
  "France",
  "Germany",
  "Spain",
  "Italy",
  "Japan",
  "Australia",
  "Brazil",
  "Mexico",
  "India",
  "China",
  "South Korea",
  "Netherlands",
  "Sweden",
  "Norway",
  "Denmark",
  "Finland",
  "Switzerland",
];

const relationships = [
  "Spouse",
  "Parent",
  "Child",
  "Sibling",
  "Friend",
  "Partner",
  "Other",
];

export default function AddGuestForm({ onSuccess, onCancel }: AddGuestFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const createCustomerMutation = useCreateCustomer();

  const handleInputChange = (field: string, value: string) => {
    const keys = field.split(".");
    setFormData((prev) => {
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
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    
    // Clear mutation error when user starts typing
    if (createCustomerMutation.error) {
      createCustomerMutation.reset();
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.nationality.trim()) newErrors.nationality = "Nationality is required";
    if (!formData.nationalId.trim()) newErrors.nationalId = "National ID is required";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
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
            ? formData.preferences.dietaryRestrictions.split(",").map(s => s.trim())
            : [],
          accessibilityNeeds: formData.preferences.accessibilityNeeds
            ? formData.preferences.accessibilityNeeds.split(",").map(s => s.trim())
            : [],
        },
      };

      await createCustomerMutation.mutateAsync(submitData);

      // Reset form on success
      setFormData(initialFormData);
      setErrors({});
      onSuccess?.();
    } catch (error: any) {
      console.error("Error creating guest:", error);
      setErrors({ general: error.message });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex flex-col">
          <h2 className="text-xl font-bold">Add New Guest</h2>
          <p className="text-small text-default-600">
            Fill in the guest information below
          </p>
        </div>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-6">
          {(errors.general || createCustomerMutation.error) && (
            <div className="bg-danger-50 border border-danger-200 p-3 rounded-lg">
              <p className="text-danger-600 text-sm">
                {errors.general || createCustomerMutation.error?.message}
              </p>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="Enter full name"
                value={formData.name}
                onValueChange={(value) => handleInputChange("name", value)}
                isInvalid={!!errors.name}
                errorMessage={errors.name}
                isRequired
              />
              <Input
                label="Email"
                placeholder="Enter email address"
                type="email"
                value={formData.email}
                onValueChange={(value) => handleInputChange("email", value)}
                isInvalid={!!errors.email}
                errorMessage={errors.email}
                isRequired
              />
              <Input
                label="Phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onValueChange={(value) => handleInputChange("phone", value)}
              />
              <Select
                label="Nationality"
                placeholder="Select nationality"
                selectedKeys={formData.nationality ? [formData.nationality] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  handleInputChange("nationality", selected || "");
                }}
                isInvalid={!!errors.nationality}
                errorMessage={errors.nationality}
                isRequired
              >
                {countries.map((country) => (
                  <SelectItem key={country}>
                    {country}
                  </SelectItem>
                ))}
              </Select>
              <Input
                label="National ID"
                placeholder="Enter national ID/passport"
                value={formData.nationalId}
                onValueChange={(value) => handleInputChange("nationalId", value)}
                isInvalid={!!errors.nationalId}
                errorMessage={errors.nationalId}
                isRequired
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Street Address"
                placeholder="Enter street address"
                value={formData.address.street}
                onValueChange={(value) => handleInputChange("address.street", value)}
                className="md:col-span-2"
              />
              <Input
                label="City"
                placeholder="Enter city"
                value={formData.address.city}
                onValueChange={(value) => handleInputChange("address.city", value)}
              />
              <Input
                label="State/Province"
                placeholder="Enter state/province"
                value={formData.address.state}
                onValueChange={(value) => handleInputChange("address.state", value)}
              />
              <Input
                label="Country"
                placeholder="Enter country"
                value={formData.address.country}
                onValueChange={(value) => handleInputChange("address.country", value)}
              />
              <Input
                label="ZIP/Postal Code"
                placeholder="Enter ZIP code"
                value={formData.address.zipCode}
                onValueChange={(value) => handleInputChange("address.zipCode", value)}
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Contact Name"
                placeholder="Enter contact name"
                value={formData.emergencyContact.name}
                onValueChange={(value) => handleInputChange("emergencyContact.name", value)}
              />
              <Input
                label="Contact Phone"
                placeholder="Enter contact phone"
                value={formData.emergencyContact.phone}
                onValueChange={(value) => handleInputChange("emergencyContact.phone", value)}
              />
              <Select
                label="Relationship"
                placeholder="Select relationship"
                selectedKeys={formData.emergencyContact.relationship ? [formData.emergencyContact.relationship] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  handleInputChange("emergencyContact.relationship", selected || "");
                }}
              >
                {relationships.map((relationship) => (
                  <SelectItem key={relationship}>
                    {relationship}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Preferences</h3>
            <div className="space-y-4">
              <Select
                label="Smoking Preference"
                placeholder="Select smoking preference"
                selectedKeys={[formData.preferences.smokingPreference]}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  handleInputChange("preferences.smokingPreference", selected || "no-preference");
                }}
              >
                <SelectItem key="smoking">
                  Smoking
                </SelectItem>
                <SelectItem key="non-smoking">
                  Non-smoking
                </SelectItem>
                <SelectItem key="no-preference">
                  No Preference
                </SelectItem>
              </Select>
              <Textarea
                label="Dietary Restrictions"
                placeholder="Enter dietary restrictions (comma-separated)"
                value={formData.preferences.dietaryRestrictions}
                onValueChange={(value: string) => handleInputChange("preferences.dietaryRestrictions", value)}
                minRows={2}
              />
              <Textarea
                label="Accessibility Needs"
                placeholder="Enter accessibility needs (comma-separated)"
                value={formData.preferences.accessibilityNeeds}
                onValueChange={(value: string) => handleInputChange("preferences.accessibilityNeeds", value)}
                minRows={2}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            {onCancel && (
              <Button
                variant="bordered"
                onPress={onCancel}
                isDisabled={createCustomerMutation.isPending}
              >
                Cancel
              </Button>
            )}
            <Button
              color="primary"
              type="submit"
              isLoading={createCustomerMutation.isPending}
            >
              {createCustomerMutation.isPending ? "Creating..." : "Create Guest"}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
