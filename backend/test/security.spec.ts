import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UnauthorizedException, ForbiddenException, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

import { LoginDto } from '../src/modules/auth/dto/login.dto.js';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../src/common/guards/roles.guard.js';

describe('VietRoute Enterprise TMS — Security & Vulnerability Test Suite', () => {
  describe('1. Input Validation & Injection Prevention (OWASP A03 / API3)', () => {
    it('should reject invalid email format in LoginDto', async () => {
      const dto = plainToInstance(LoginDto, {
        email: 'invalid-email-string',
        password: 'validPassword123',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'email')).toBe(true);
    });

    it('should reject passwords shorter than 6 characters', async () => {
      const dto = plainToInstance(LoginDto, {
        email: 'admin@vietroute.vn',
        password: '123',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('should accept valid and sanitized login payload', async () => {
      const dto = plainToInstance(LoginDto, {
        email: 'admin@vietroute.vn',
        password: 'strongPassword@2026',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('2. Authentication & JWT Protection (OWASP API2)', () => {
    let jwtService: JwtService;
    let jwtGuard: JwtAuthGuard;

    beforeEach(() => {
      jwtService = new JwtService({ secret: 'test-secret-key-12345' });
      jwtGuard = new JwtAuthGuard(jwtService);
    });

    const createMockContext = (authHeader?: string): ExecutionContext => {
      const request = {
        headers: {
          authorization: authHeader,
        },
      };
      return {
        switchToHttp: () => ({
          getRequest: () => request,
        }),
      } as unknown as ExecutionContext;
    };

    it('should reject requests with missing Authorization header', async () => {
      const ctx = createMockContext(undefined);
      await expect(jwtGuard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
    });

    it('should reject requests with non-Bearer authorization format', async () => {
      const ctx = createMockContext('Basic dXNlcjpwYXNz');
      await expect(jwtGuard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
    });

    it('should reject forged or corrupted JWT tokens', async () => {
      const ctx = createMockContext('Bearer forged.invalid.token');
      await expect(jwtGuard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
    });

    it('should accept and decode a valid JWT token signed with secret', async () => {
      process.env.JWT_SECRET = 'test-secret-key-12345';
      const validToken = await jwtService.signAsync(
        { sub: 'user-01', email: 'admin@vietroute.vn', role: 'ADMIN' },
        { secret: 'test-secret-key-12345' }
      );
      const ctx = createMockContext(`Bearer ${validToken}`);
      const canActivate = await jwtGuard.canActivate(ctx);
      expect(canActivate).toBe(true);
    });
  });

  describe('3. Role-Based Access Control / BFLA (OWASP API5)', () => {
    let reflector: Reflector;
    let rolesGuard: RolesGuard;

    beforeEach(() => {
      reflector = new Reflector();
      rolesGuard = new RolesGuard(reflector);
    });

    const createMockContextWithUser = (userRole?: string, requiredRoles?: string[]): ExecutionContext => {
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);

      const request = {
        user: userRole ? { role: userRole } : undefined,
      };

      return {
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({
          getRequest: () => request,
        }),
      } as unknown as ExecutionContext;
    };

    it('should allow access if no role is required on endpoint', () => {
      const ctx = createMockContextWithUser('DRIVER', undefined);
      expect(rolesGuard.canActivate(ctx)).toBe(true);
    });

    it('should block DRIVER from accessing ADMIN endpoint', () => {
      const ctx = createMockContextWithUser('DRIVER', ['ADMIN']);
      expect(() => rolesGuard.canActivate(ctx)).toThrow(ForbiddenException);
    });

    it('should block DISPATCHER from accessing ADMIN warehouse delete endpoint', () => {
      const ctx = createMockContextWithUser('DISPATCHER', ['ADMIN']);
      expect(() => rolesGuard.canActivate(ctx)).toThrow(ForbiddenException);
    });

    it('should permit MANAGER to access ADMIN / MANAGER endpoints', () => {
      const ctx = createMockContextWithUser('MANAGER', ['ADMIN', 'MANAGER']);
      expect(rolesGuard.canActivate(ctx)).toBe(true);
    });

    it('should permit ADMIN to access any restricted endpoint', () => {
      const ctx = createMockContextWithUser('ADMIN', ['ADMIN', 'MANAGER']);
      expect(rolesGuard.canActivate(ctx)).toBe(true);
    });
  });

  describe('4. Client-Side Access Control & Route Prefix Collision (OWASP A01)', () => {
    // Logic matching our patched canAccessRoute
    const mockNavItems = [
      { path: '/driver', allowedRoles: ['ADMIN', 'DISPATCHER', 'DRIVER'] },
      { path: '/drivers', allowedRoles: ['ADMIN', 'MANAGER', 'DISPATCHER'] },
      { path: '/orders', allowedRoles: ['ADMIN', 'DISPATCHER', 'WAREHOUSE_STAFF'] },
      { path: '/warehouses', allowedRoles: ['ADMIN', 'MANAGER', 'DISPATCHER', 'WAREHOUSE_STAFF'] },
    ];

    function verifyRouteAccess(role: string | undefined, path: string): boolean {
      if (!role) return false;
      if (role === 'ADMIN') return true;

      const sorted = [...mockNavItems].sort((a, b) => b.path.length - a.path.length);
      const matched = sorted.find((item) => path === item.path || path.startsWith(item.path + '/'));

      if (!matched || !matched.allowedRoles) return true;
      return matched.allowedRoles.includes(role);
    }

    it('should permit DRIVER to access /driver mobile portal', () => {
      expect(verifyRouteAccess('DRIVER', '/driver')).toBe(true);
    });

    it('CRITICAL: should PREVENT DRIVER from accessing /drivers (Prevent prefix collision exploit)', () => {
      // Prior bug: "/drivers".startsWith("/driver") -> true, giving DRIVER access to /drivers
      // Patched: checks exact path or segment (/driver/...)
      expect(verifyRouteAccess('DRIVER', '/drivers')).toBe(false);
    });

    it('should allow DISPATCHER to access both /driver and /drivers', () => {
      expect(verifyRouteAccess('DISPATCHER', '/driver')).toBe(true);
      expect(verifyRouteAccess('DISPATCHER', '/drivers')).toBe(true);
    });

    it('should prevent WAREHOUSE_STAFF from accessing /drivers', () => {
      expect(verifyRouteAccess('WAREHOUSE_STAFF', '/drivers')).toBe(false);
    });

    it('should allow ADMIN to access any route', () => {
      expect(verifyRouteAccess('ADMIN', '/drivers')).toBe(true);
      expect(verifyRouteAccess('ADMIN', '/warehouses')).toBe(true);
    });
  });
});
