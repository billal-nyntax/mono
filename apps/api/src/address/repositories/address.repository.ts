import type { Address, AddressId, UserId } from '@repo/auth-core';

export interface CreateAddressData {
  readonly userId: UserId;
  readonly label: string;
  readonly street: string;
  readonly city: string;
  readonly state: string;
  readonly postalCode: string;
  readonly country: string;
  readonly isDefault?: boolean;
}

export interface UpdateAddressData {
  readonly label?: string;
  readonly street?: string;
  readonly city?: string;
  readonly state?: string;
  readonly postalCode?: string;
  readonly country?: string;
  readonly isDefault?: boolean;
}

export abstract class AddressRepository {
  abstract findById(id: AddressId): Promise<Address | null>;
  abstract findByUserId(userId: UserId): Promise<Address[]>;
  abstract create(data: CreateAddressData): Promise<Address>;
  abstract update(id: AddressId, data: UpdateAddressData): Promise<Address>;
  abstract delete(id: AddressId): Promise<void>;
  abstract setDefault(id: AddressId, userId: UserId): Promise<void>;
}
