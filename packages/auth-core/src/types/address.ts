import type { AddressId, UserId } from './branded';

export interface Address {
  readonly id: AddressId;
  readonly userId: UserId;
  readonly label: string;
  readonly street: string;
  readonly city: string;
  readonly state: string;
  readonly postalCode: string;
  readonly country: string;
  readonly isDefault: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
