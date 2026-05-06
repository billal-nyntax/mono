import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import type { Address, AddressId, UserId } from '@repo/auth-core';
import {
  AddressRepository,
  type CreateAddressData,
  type UpdateAddressData,
} from './repositories/address.repository';

@Injectable()
export class AddressService {
  constructor(private readonly addressRepository: AddressRepository) {}

  async findByUserId(userId: UserId): Promise<Address[]> {
    return this.addressRepository.findByUserId(userId);
  }

  async create(userId: UserId, data: Omit<CreateAddressData, 'userId'>): Promise<Address> {
    return this.addressRepository.create({ ...data, userId });
  }

  async update(
    id: AddressId,
    userId: UserId,
    data: UpdateAddressData,
  ): Promise<Address> {
    await this.findAndValidateOwnership(id, userId);
    return this.addressRepository.update(id, data);
  }

  async delete(id: AddressId, userId: UserId): Promise<void> {
    await this.findAndValidateOwnership(id, userId);
    await this.addressRepository.delete(id);
  }

  async setDefault(id: AddressId, userId: UserId): Promise<void> {
    await this.findAndValidateOwnership(id, userId);
    await this.addressRepository.setDefault(id, userId);
  }

  private async findAndValidateOwnership(
    id: AddressId,
    userId: UserId,
  ): Promise<Address> {
    const address = await this.addressRepository.findById(id);
    if (!address) {
      throw new NotFoundException(`Address ${id} not found`);
    }
    if (address.userId !== userId) {
      throw new ForbiddenException('You do not own this address');
    }
    return address;
  }
}
