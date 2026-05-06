import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import type { Server } from 'node:http';
import type { INestApplication } from '@nestjs/common';
import type { PrismaService } from '@repo/database';
import { createApp, cleanDatabase } from '../helpers';

describe('Auth E2E', () => {
  let app: INestApplication;
  let server: Server;
  let prisma: PrismaService;

  beforeAll(async () => {
    const testApp = await createApp();
    app = testApp.app;
    server = testApp.server;
    prisma = testApp.prisma;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
  });

  const testEmail = 'auth-test@example.com';
  const testPassword = 'StrongP@ss1';
  const testName = 'Auth Test User';

  describe('Full auth flow', () => {
    it('should sign up a new user and return token', async () => {
      const res = await request(server)
        .post('/api/v1/auth/signup')
        .send({
          email: testEmail,
          password: testPassword,
          confirmPassword: testPassword,
          name: testName,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe(testEmail);
      expect(res.body.data.user.name).toBe(testName);
      expect(res.body.data.tokens.accessToken).toBeDefined();
      expect(res.body.data.tokens.refreshToken).toBeDefined();
    });

    it('should sign in with same credentials and return token', async () => {
      await request(server)
        .post('/api/v1/auth/signup')
        .send({
          email: testEmail,
          password: testPassword,
          confirmPassword: testPassword,
          name: testName,
        })
        .expect(201);

      const res = await request(server)
        .post('/api/v1/auth/signin')
        .send({ email: testEmail, password: testPassword })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.tokens.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe(testEmail);
    });

    it('should return 401 when signing in with wrong password', async () => {
      await request(server)
        .post('/api/v1/auth/signup')
        .send({
          email: testEmail,
          password: testPassword,
          confirmPassword: testPassword,
          name: testName,
        })
        .expect(201);

      const res = await request(server)
        .post('/api/v1/auth/signin')
        .send({ email: testEmail, password: 'WrongP@ss1' })
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should get profile with valid token', async () => {
      const signupRes = await request(server)
        .post('/api/v1/auth/signup')
        .send({
          email: testEmail,
          password: testPassword,
          confirmPassword: testPassword,
          name: testName,
        })
        .expect(201);

      const token = signupRes.body.data.tokens.accessToken;

      const profileRes = await request(server)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(profileRes.body.success).toBe(true);
      expect(profileRes.body.data.email).toBe(testEmail);
      expect(profileRes.body.data.name).toBe(testName);
    });

    it('should change password and sign in with new password', async () => {
      const signupRes = await request(server)
        .post('/api/v1/auth/signup')
        .send({
          email: testEmail,
          password: testPassword,
          confirmPassword: testPassword,
          name: testName,
        })
        .expect(201);

      const token = signupRes.body.data.tokens.accessToken;
      const newPassword = 'NewStr0ng@Pass';

      await request(server)
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: testPassword,
          newPassword,
          confirmPassword: newPassword,
        })
        .expect(200);

      const signinRes = await request(server)
        .post('/api/v1/auth/signin')
        .send({ email: testEmail, password: newPassword })
        .expect(200);

      expect(signinRes.body.success).toBe(true);
      expect(signinRes.body.data.tokens.accessToken).toBeDefined();
    });

    it('should fail sign in with old password after change', async () => {
      const signupRes = await request(server)
        .post('/api/v1/auth/signup')
        .send({
          email: testEmail,
          password: testPassword,
          confirmPassword: testPassword,
          name: testName,
        })
        .expect(201);

      const token = signupRes.body.data.tokens.accessToken;
      const newPassword = 'NewStr0ng@Pass';

      await request(server)
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: testPassword,
          newPassword,
          confirmPassword: newPassword,
        })
        .expect(200);

      await request(server)
        .post('/api/v1/auth/signin')
        .send({ email: testEmail, password: testPassword })
        .expect(401);
    });

    it('should sign out and invalidate session', async () => {
      const signupRes = await request(server)
        .post('/api/v1/auth/signup')
        .send({
          email: testEmail,
          password: testPassword,
          confirmPassword: testPassword,
          name: testName,
        })
        .expect(201);

      const token = signupRes.body.data.tokens.accessToken;

      await request(server)
        .post('/api/v1/auth/signout')
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      await request(server)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
    });

    it('should reject sign up with duplicate email', async () => {
      await request(server)
        .post('/api/v1/auth/signup')
        .send({
          email: testEmail,
          password: testPassword,
          confirmPassword: testPassword,
          name: testName,
        })
        .expect(201);

      const res = await request(server)
        .post('/api/v1/auth/signup')
        .send({
          email: testEmail,
          password: testPassword,
          confirmPassword: testPassword,
          name: 'Duplicate User',
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should reject profile access without token', async () => {
      await request(server).get('/api/v1/users/me').expect(401);
    });
  });
});
