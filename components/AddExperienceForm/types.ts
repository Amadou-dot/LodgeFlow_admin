export interface FormProps {
  formData: Record<string, any>;
  setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}

export interface AddExperienceSectionProps {
  formData: Record<string, any>;
  onInputChange: (name: string, value: any) => void;
}
