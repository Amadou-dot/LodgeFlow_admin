import { Button } from '@heroui/button';

import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/modal';

import { useState } from 'react';
import AddExperienceForm from './AddExperienceForm';

interface AddExperienceModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate?: (formData: Record<string, any>) => void;
}

export default function AddExperienceModal({
  isOpen,
  onOpenChange,
  onCreate,
}: AddExperienceModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      scrollBehavior='inside'
      size='3xl'
    >
      <ModalContent>
        <ModalHeader>Add New Experience</ModalHeader>
        <ModalBody>
          <AddExperienceForm formData={formData} setFormData={setFormData} />
        </ModalBody>
        <ModalFooter>
          <Button onPress={() => onOpenChange(false)}>Cancel</Button>
          <Button
            color='primary'
            onPress={() => {
              if (onCreate) {
                onCreate(formData);
                onOpenChange(false);
              }
            }}
          >
            Create Experience
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
