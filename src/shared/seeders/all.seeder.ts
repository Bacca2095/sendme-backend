import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const seedPermissions = async () => {
  const actions = ['create', 'read', 'update', 'delete'];
  const resources = [
    'user',
    'organization',
    'campaign',
    'contact',
    'message',
    'plan',
    'subscription',
    'recharge',
  ];

  const specialAdminPermissions = [
    'read_all_users',
    'read_all_organizations',
    'read_all_plans',
    'read_all_recharges',
    'read_all_subscriptions',
  ];

  console.log('Seeding permissions...');
  const promises = [
    ...resources.flatMap((resource) =>
      actions.map(async (action) => {
        const name = `${action}_${resource}`;
        const exists = await prisma.permission.findUnique({ where: { name } });
        if (!exists) {
          await prisma.permission.create({ data: { name } });
        }
      }),
    ),
    ...specialAdminPermissions.map(async (permission) => {
      const exists = await prisma.permission.findUnique({
        where: { name: permission },
      });
      if (!exists) {
        await prisma.permission.create({ data: { name: permission } });
      }
    }),
  ];

  await Promise.all(promises);
  console.log('Permissions seeded successfully.');
};

const seedRoles = async () => {
  const roles = [
    { name: 'admin', description: 'Full access to all resources' },
    {
      name: 'manager',
      description: 'Access to resources within their organization only',
    },
    {
      name: 'user',
      description: 'Limited access to campaigns, contacts, and messages',
    },
  ];

  console.log('Seeding roles...');
  const promises = roles.map(async (role) => {
    const exists = await prisma.role.findUnique({ where: { name: role.name } });
    if (!exists) {
      await prisma.role.create({ data: role });
    }
  });

  await Promise.all(promises);
  console.log('Roles seeded successfully.');
};

const assignRolePermissions = async () => {
  console.log('Assigning permissions to roles...');
  const allPermissions = await prisma.permission.findMany();
  const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
  const managerRole = await prisma.role.findUnique({
    where: { name: 'manager' },
  });
  const userRole = await prisma.role.findUnique({ where: { name: 'user' } });

  if (adminRole) {
    const promises = allPermissions.map(async (permission) => {
      const exists = await prisma.rolePermission.findUnique({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: permission.id,
          },
        },
      });
      if (!exists) {
        await prisma.rolePermission.create({
          data: { roleId: adminRole.id, permissionId: permission.id },
        });
      }
    });

    await Promise.all(promises);
  }

  if (managerRole) {
    const managerPermissions = allPermissions.filter(
      (permission) =>
        !permission.name.startsWith('read_all_') &&
        (permission.name.startsWith('create_') ||
          permission.name.startsWith('read_') ||
          permission.name.startsWith('update_') ||
          permission.name.startsWith('delete_')),
    );

    const promises = managerPermissions.map(async (permission) => {
      const exists = await prisma.rolePermission.findUnique({
        where: {
          roleId_permissionId: {
            roleId: managerRole.id,
            permissionId: permission.id,
          },
        },
      });
      if (!exists) {
        await prisma.rolePermission.create({
          data: { roleId: managerRole.id, permissionId: permission.id },
        });
      }
    });

    await Promise.all(promises);
  }

  if (userRole) {
    const userPermissions = allPermissions.filter((permission) =>
      ['campaign', 'contact', 'message'].some((resource) =>
        permission.name.includes(resource),
      ),
    );

    const promises = userPermissions.map(async (permission) => {
      const exists = await prisma.rolePermission.findUnique({
        where: {
          roleId_permissionId: {
            roleId: userRole.id,
            permissionId: permission.id,
          },
        },
      });
      if (!exists) {
        await prisma.rolePermission.create({
          data: { roleId: userRole.id, permissionId: permission.id },
        });
      }
    });

    await Promise.all(promises);
  }

  console.log('Role permissions assigned successfully.');
};

const seedPlans = async () => {
  const plans = [
    {
      name: 'trial',
      description: 'Free trial plan with limited features',
      messageLimit: 100,
      campaignLimit: 5,
      contactLimit: 50,
      cost: 0,
      pricePerMessage: 0.05,
    },
    {
      name: 'basic',
      description: 'Basic subscription plan',
      messageLimit: 1000,
      campaignLimit: 50,
      contactLimit: 500,
      cost: 10,
      pricePerMessage: 0.03,
    },
    {
      name: 'standard',
      description: 'Standard subscription plan',
      messageLimit: 5000,
      campaignLimit: 100,
      contactLimit: 2000,
      cost: 50,
      pricePerMessage: 0.02,
    },
    {
      name: 'premium',
      description: 'Premium subscription plan with advanced features',
      messageLimit: 10000,
      campaignLimit: 200,
      contactLimit: 5000,
      cost: 100,
      pricePerMessage: 0.01,
    },
  ];

  console.log('Seeding plans...');
  const promises = plans.map(async (plan) => {
    const exists = await prisma.plan.findFirst({ where: { name: plan.name } });
    if (!exists) {
      await prisma.plan.create({ data: plan });
    }
  });

  await Promise.all(promises);
  console.log('Plans seeded successfully.');
};

const main = async () => {
  console.log('Starting seeder...');
  await seedPermissions();
  await seedRoles();
  await assignRolePermissions();
  await seedPlans();
  console.log('Seeder completed successfully.');
};

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
