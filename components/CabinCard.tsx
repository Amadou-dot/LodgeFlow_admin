"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter } from "@heroui/card";
import { Chip } from "@heroui/chip";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import Image from "next/image";
import type { Cabin } from "@/types";

interface CabinCardProps {
  cabin: Cabin;
  onEdit: (cabin: Cabin) => void;
  onView: (cabin: Cabin) => void;
  onDelete: (cabin: Cabin) => void;
}

export default function CabinCard({
  cabin,
  onEdit,
  onView,
  onDelete,
}: CabinCardProps) {
  const discountedPrice = cabin.price - cabin.discount;

  return (
    <Card className="w-full">
      <CardBody className="p-0">
        <div className="relative">
          <Image
            src={cabin.image}
            alt={cabin.name}
            width={400}
            height={250}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          {cabin.discount > 0 && (
            <Chip
              color="danger"
              variant="solid"
              size="sm"
              className="absolute top-2 right-2"
            >
              ${cabin.discount} off
            </Chip>
          )}
          <div className="absolute bottom-2 left-2">
            <Chip color="primary" variant="solid" size="sm">
              {cabin.capacity} guests
            </Chip>
          </div>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold">{cabin.name}</h3>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="light"
                  size="sm"
                  className="min-w-0 w-8 h-8 rounded-full"
                >
                  ⋯
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Cabin actions">
                <DropdownItem key="view" onPress={() => onView(cabin)}>
                  View Details
                </DropdownItem>
                <DropdownItem key="edit" onPress={() => onEdit(cabin)}>
                  Edit
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  className="text-danger"
                  color="danger"
                  onPress={() => onDelete(cabin)}
                >
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>

          <div className="flex items-center gap-2 mb-3">
            {cabin.discount > 0 ? (
              <>
                <span className="text-xl font-bold text-success">
                  ${discountedPrice}
                </span>
                <span className="text-sm text-default-500 line-through">
                  ${cabin.price}
                </span>
                <span className="text-xs text-default-400">per night</span>
              </>
            ) : (
              <>
                <span className="text-xl font-bold">${cabin.price}</span>
                <span className="text-xs text-default-400">per night</span>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-1 mb-3">
            {cabin.amenities.slice(0, 3).map((amenity) => (
              <Chip key={amenity} size="sm" variant="flat" color="default">
                {amenity}
              </Chip>
            ))}
            {cabin.amenities.length > 3 && (
              <Chip size="sm" variant="flat" color="default">
                +{cabin.amenities.length - 3} more
              </Chip>
            )}
          </div>
        </div>
      </CardBody>

      <CardFooter className="pt-0 px-4 pb-4">
        <div className="flex gap-2 w-full">
          <Button
            color="primary"
            variant="solid"
            className="flex-1"
            onPress={() => onView(cabin)}
          >
            View Details
          </Button>
          <Button
            color="default"
            variant="bordered"
            className="flex-1"
            onPress={() => onEdit(cabin)}
          >
            Edit
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
