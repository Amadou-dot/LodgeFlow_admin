"use client";

import {
  Modal,
  ModalContent,
  ModalBody,
  useDisclosure,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { PlusIcon } from "@/components/icons";
import AddGuestForm from "./AddGuestForm";

interface AddGuestModalProps {
  onGuestAdded?: () => void;
}

export default function AddGuestModal({ onGuestAdded }: AddGuestModalProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const handleSuccess = () => {
    onOpenChange(); // Close modal
    onGuestAdded?.(); // Refresh the guest list
  };

  return (
    <>
      <Button
        color="primary"
        startContent={<PlusIcon />}
        onPress={onOpen}
        className="w-full sm:w-auto"
      >
        Add New Guest
      </Button>
      
      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        size="3xl"
        scrollBehavior="inside"
        classNames={{
          body: "py-6",
          backdrop: "bg-[#292f46]/50 backdrop-opacity-40",
          base: "border-[#292f46] bg-[#19172c] dark:bg-[#19172c] text-[#a8b0d3]",
          header: "border-b-[1px] border-[#292f46]",
          footer: "border-t-[1px] border-[#292f46]",
          closeButton: "hover:bg-white/5 active:bg-white/10",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <ModalBody>
              <AddGuestForm 
                onSuccess={handleSuccess}
                onCancel={onClose}
              />
            </ModalBody>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
