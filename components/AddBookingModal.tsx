"use client";

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { PlusIcon } from "@/components/icons";
import BookingForm from "./BookingForm";

interface AddBookingModalProps {
  onBookingAdded?: () => void;
}

export default function AddBookingModal({ onBookingAdded }: AddBookingModalProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleSuccess = () => {
    onClose();
    onBookingAdded?.();
  };

  return (
    <>
      <Button
        color="primary"
        startContent={<PlusIcon size={18} />}
        onPress={onOpen}
        className="w-full sm:w-auto"
      >
        New Booking
      </Button>

      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        size="5xl"
        scrollBehavior="inside"
        backdrop="opaque"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h2 className="text-xl font-bold">Create New Booking</h2>
            <p className="text-sm text-default-600">
              Fill in the details to create a new booking
            </p>
          </ModalHeader>
          <ModalBody className="pb-6">
            <BookingForm
              onSuccess={handleSuccess}
              onCancel={onClose}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
