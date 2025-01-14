import { Mocked, TestBed } from '@suites/unit';

import { AsyncLocalStorageService } from '@/shared/providers/async-local-storage.service';
import { PrismaService } from '@/shared/providers/prisma.service';

import { UserService } from './user.service';

describe('Cats Http Service Unit Test', () => {
  let userService: UserService;
  let db: Mocked<PrismaService>;
  let als: Mocked<AsyncLocalStorageService>;

  beforeAll(async () => {
    const { unit, unitRef } = await TestBed.solitary(UserService).compile();

    userService = unit;
    db = unitRef.get(PrismaService);
    als = unitRef.get(AsyncLocalStorageService);
  });

  it('get all users', async () => {
    const mockUsers = [
      {
        id: 1,
        name: 'Cesar Bacca',
        email: 'bacca2095@gmail.com',
        password: 'any',
        organizationId: 1,
        roleId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
      },
    ];
    db.user.findMany.mockResolvedValue(mockUsers);

    const users = await userService.get();

    expect(users).toEqual(mockUsers);
  });

  it('get user by email', async () => {
    const mockUser = {
      id: 1,
      name: 'Cesar Bacca',
      email: 'bacca2095@gmail.com',
      password: 'any',
      organizationId: 1,
      roleId: 1,
      role: {
        rolePermissions: [
          {
            permission: {
              name: 'test',
            },
          },
        ],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: new Date(),
    };
    db.user.findUniqueOrThrow.mockResolvedValue(mockUser);

    const user = await userService.getByEmail(mockUser.email);
    expect(user).toEqual({ ...mockUser, permissions: ['test'] });
  });
});
