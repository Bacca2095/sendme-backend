import { AsyncLocalStorage } from 'async_hooks';

import { Injectable } from '@nestjs/common';

interface UserInfo {
  userId: number;
  organizationId: number;
  role: string;
  permissions: string[];
}
interface RequestInfo {
  user: UserInfo;
  correlationId: string;
  path: string;
}

@Injectable()
export class AsyncLocalStorageService {
  private readonly asyncLocalStorage = new AsyncLocalStorage<
    Map<string, any>
  >();

  run(fn: () => void) {
    this.asyncLocalStorage.run(new Map(), fn);
  }

  set<T>(key: string, value: T) {
    const store: Map<string, T> = this.asyncLocalStorage.getStore();
    if (store) {
      store.set(key, value);
    }
  }

  get<T>(key: string): T | undefined {
    const store: Map<string, T> = this.asyncLocalStorage.getStore();
    return store ? (store.get(key) as T) : undefined;
  }

  getRequestInfo(): RequestInfo {
    const store = this.asyncLocalStorage.getStore();
    return {
      user: this.getUserInfo(),
      correlationId: store?.get('correlationId'),
      path: store?.get('path'),
    };
  }

  setUserInfo(
    userId: number,
    organizationId: number,
    role: string,
    permissions: string[],
  ) {
    this.set('userId', userId);
    this.set('organizationId', organizationId);
    this.set('role', role);
    this.set('permissions', permissions);
  }

  getUserInfo(): UserInfo {
    return {
      userId: this.get('userId'),
      organizationId: this.get('organizationId'),
      role: this.get('role'),
      permissions: this.get('permissions'),
    };
  }

  enableOrganizationValidation() {
    this.set('validateOrganization', true);
  }

  disableOrganizationValidation() {
    this.set('validateOrganization', false);
  }

  shouldValidateOrganization(): boolean {
    return this.get<boolean>('validateOrganization') ?? true;
  }

  isAdmin(): boolean {
    if (!this.shouldValidateOrganization()) {
      return true;
    }
    const userInfo = this.getUserInfo();
    return userInfo?.role === 'admin';
  }

  getValidatedOrganizationId(
    providedOrganizationId?: number,
  ): number | undefined {
    const validateOrganization = this.shouldValidateOrganization();

    if (!validateOrganization) {
      return providedOrganizationId;
    }

    if (this.isAdmin()) {
      return providedOrganizationId;
    }

    return this.getUserInfo().organizationId;
  }
}
