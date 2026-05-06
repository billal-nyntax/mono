export { PrismaService } from './prisma.service';
export { PrismaClient, Prisma } from '@prisma/client';
export type {
  User as DbUser,
  Session as DbSession,
  Token as DbToken,
  Address as DbAddress,
  UserRole as DbUserRole,
  TokenType as DbTokenType,
} from '@prisma/client';

export type {
  User,
  Session,
  Token,
  Address,
  UserRole,
  TokenType,
} from '@prisma/client';
