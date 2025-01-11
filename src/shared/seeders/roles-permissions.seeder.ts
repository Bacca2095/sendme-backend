import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const seedRolesAndPermissions = async () => {
  const permissions = [
    {
      name: 'view_all_organizations',
      description: 'Ver todas las organizaciones',
    },
    { name: 'manage_users', description: 'Crear, editar y eliminar usuarios' },
    {
      name: 'manage_campaigns',
      description: 'Crear, editar y eliminar campañas',
    },
    { name: 'send_messages', description: 'Enviar mensajes' },
    { name: 'view_organization', description: 'Ver organización actual' },
    { name: 'manage_roles', description: 'Gestionar roles y permisos' },
  ];

  // Crear permisos si no existen
  console.log('Verificando permisos...');
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {},
      create: permission,
    });
  }
  console.log('Permisos verificados o creados.');

  // Obtener permisos existentes
  const allPermissions = await prisma.permission.findMany();
  const permissionMap = Object.fromEntries(
    allPermissions.map((p) => [p.name, p]),
  );

  // Definir roles y sus permisos
  const roles = [
    {
      name: 'admin',
      description: 'Acceso total al sistema y todas las organizaciones',
      permissions: [
        'view_all_organizations',
        'manage_users',
        'manage_campaigns',
        'send_messages',
        'manage_roles',
      ],
    },
    {
      name: 'manager',
      description: 'Gestión de usuarios y campañas dentro de la organización',
      permissions: [
        'view_organization',
        'manage_users',
        'manage_campaigns',
        'send_messages',
      ],
    },
    {
      name: 'user',
      description: 'Gestión de campañas y envío de mensajes',
      permissions: ['view_organization', 'manage_campaigns', 'send_messages'],
    },
  ];

  // Crear roles y asociar permisos
  console.log('Verificando roles...');
  for (const role of roles) {
    // Crear o encontrar el rol
    const createdRole = await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: {
        name: role.name,
        description: role.description,
      },
    });

    // Verificar y asociar permisos al rol
    for (const permName of role.permissions) {
      const permission = permissionMap[permName];
      if (permission) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: createdRole.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: createdRole.id,
            permissionId: permission.id,
          },
        });
      }
    }
  }
  console.log('Roles y permisos verificados o creados.');
};

seedRolesAndPermissions()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
