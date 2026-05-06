declare const brand: unique symbol;

type Brand<T, B extends string> = T & { readonly [brand]: B };

export type UserId = Brand<string, 'UserId'>;
export type SessionId = Brand<string, 'SessionId'>;
export type TokenId = Brand<string, 'TokenId'>;
export type AddressId = Brand<string, 'AddressId'>;

export function createUserId(id: string): UserId {
  return id as UserId;
}

export function createSessionId(id: string): SessionId {
  return id as SessionId;
}

export function createTokenId(id: string): TokenId {
  return id as TokenId;
}

export function createAddressId(id: string): AddressId {
  return id as AddressId;
}
