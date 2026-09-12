import 'dotenv/config';
import { PrismaClient, Role, TaskStatus, Priority } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const PASSWORD = 'Password123!';

async function main() {
  console.log('Seeding database...');

  await prisma.taskActivityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Ananya Rao',
      email: 'admin@velozity.com',
      passwordHash,
      role: Role.ADMIN,
    },
  });

  const pm1 = await prisma.user.create({
    data: {
      name: 'Ravi Shah',
      email: 'ravi.pm@velozity.com',
      passwordHash,
      role: Role.PM,
    },
  });

  const pm2 = await prisma.user.create({
    data: {
      name: 'Neha Kapoor',
      email: 'neha.pm@velozity.com',
      passwordHash,
      role: Role.PM,
    },
  });

  const dev1 = await prisma.user.create({
    data: {
      name: 'Arjun Mehta',
      email: 'arjun.dev@velozity.com',
      passwordHash,
      role: Role.DEVELOPER,
    },
  });

  const dev2 = await prisma.user.create({
    data: {
      name: 'Priya Nair',
      email: 'priya.dev@velozity.com',
      passwordHash,
      role: Role.DEVELOPER,
    },
  });

  const dev3 = await prisma.user.create({
    data: {
      name: 'Karan Verma',
      email: 'karan.dev@velozity.com',
      passwordHash,
      role: Role.DEVELOPER,
    },
  });

  const dev4 = await prisma.user.create({
    data: {
      name: 'Simran Kaur',
      email: 'simran.dev@velozity.com',
      passwordHash,
      role: Role.DEVELOPER,
    },
  });

  console.log('Created 7 users');

  const clientA = await prisma.client.create({ data: { name: 'Orion Retail Co.' } });
  const clientB = await prisma.client.create({ data: { name: 'Bluewave Logistics' } });
  const clientC = await prisma.client.create({ data: { name: 'Nimbus Health Systems' } });

  console.log('Created 3 clients');

  const projectA = await prisma.project.create({
    data: { name: 'Orion Storefront Revamp', clientId: clientA.id, managerId: pm1.id },
  });

  const projectB = await prisma.project.create({
    data: { name: 'Bluewave Fleet Tracker', clientId: clientB.id, managerId: pm1.id },
  });

  const projectC = await prisma.project.create({
    data: { name: 'Nimbus Patient Portal', clientId: clientC.id, managerId: pm2.id },
  });

  console.log('Created 3 projects');

  const now = new Date();
  const daysFromNow = (n: number) => new Date(now.getTime() + n * 24 * 60 * 60 * 1000);
  const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);

  const projectATasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Set up product catalog schema',
        description: 'Design and implement the product catalog database schema.',
        projectId: projectA.id,
        assigneeId: dev1.id,
        status: TaskStatus.DONE,
        priority: Priority.HIGH,
        dueDate: daysAgo(2),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Build checkout flow UI',
        description: 'Implement the multi-step checkout flow in React.',
        projectId: projectA.id,
        assigneeId: dev2.id,
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.CRITICAL,
        dueDate: daysFromNow(3),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Integrate payment gateway',
        description: 'Connect Razorpay for order payments.',
        projectId: projectA.id,
        assigneeId: dev2.id,
        status: TaskStatus.TODO,
        priority: Priority.HIGH,
        dueDate: daysAgo(1),
        isOverdue: true,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Write product search API',
        description: 'Add filterable, paginated product search endpoint.',
        projectId: projectA.id,
        assigneeId: dev1.id,
        status: TaskStatus.IN_REVIEW,
        priority: Priority.MEDIUM,
        dueDate: daysFromNow(5),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Set up CI pipeline',
        description: 'Add GitHub Actions workflow for lint, test, build.',
        projectId: projectA.id,
        assigneeId: dev1.id,
        status: TaskStatus.TODO,
        priority: Priority.LOW,
        dueDate: daysFromNow(10),
      },
    }),
  ]);

  const projectBTasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Design fleet dashboard layout',
        description: 'Wireframe the live fleet tracking dashboard.',
        projectId: projectB.id,
        assigneeId: dev3.id,
        status: TaskStatus.DONE,
        priority: Priority.MEDIUM,
        dueDate: daysAgo(5),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Implement live GPS tracking',
        description: 'Stream vehicle GPS coordinates over WebSocket.',
        projectId: projectB.id,
        assigneeId: dev3.id,
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.CRITICAL,
        dueDate: daysFromNow(2),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Add driver assignment module',
        description: 'Allow dispatchers to assign drivers to routes.',
        projectId: projectB.id,
        assigneeId: dev4.id,
        status: TaskStatus.TODO,
        priority: Priority.HIGH,
        dueDate: daysAgo(3),
        isOverdue: true,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Fuel usage analytics report',
        description: 'Weekly fuel efficiency report per vehicle.',
        projectId: projectB.id,
        assigneeId: dev4.id,
        status: TaskStatus.TODO,
        priority: Priority.LOW,
        dueDate: daysFromNow(14),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Route optimization algorithm',
        description: 'Reduce average delivery time using route optimization.',
        projectId: projectB.id,
        assigneeId: dev3.id,
        status: TaskStatus.IN_REVIEW,
        priority: Priority.HIGH,
        dueDate: daysFromNow(6),
      },
    }),
  ]);

  const projectCTasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Patient record encryption',
        description: 'Encrypt sensitive patient data at rest.',
        projectId: projectC.id,
        assigneeId: dev1.id,
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.CRITICAL,
        dueDate: daysFromNow(4),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Appointment booking calendar',
        description: 'Build calendar UI for scheduling appointments.',
        projectId: projectC.id,
        assigneeId: dev2.id,
        status: TaskStatus.TODO,
        priority: Priority.MEDIUM,
        dueDate: daysFromNow(8),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Doctor availability sync',
        description: "Sync doctors' availability across clinics.",
        projectId: projectC.id,
        assigneeId: dev4.id,
        status: TaskStatus.DONE,
        priority: Priority.MEDIUM,
        dueDate: daysAgo(7),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Notification preferences settings',
        description: 'Let patients configure reminder notification channels.',
        projectId: projectC.id,
        assigneeId: dev2.id,
        status: TaskStatus.IN_REVIEW,
        priority: Priority.LOW,
        dueDate: daysFromNow(9),
      },
    }),
    prisma.task.create({
      data: {
        title: 'HIPAA compliance audit fixes',
        description: 'Address findings from the last compliance audit.',
        projectId: projectC.id,
        assigneeId: dev1.id,
        status: TaskStatus.TODO,
        priority: Priority.HIGH,
        dueDate: daysFromNow(1),
      },
    }),
  ]);

  console.log('Created 15 tasks across 3 projects (2 already overdue)');

  const allSeededTasks = [...projectATasks, ...projectBTasks, ...projectCTasks];

  const changers = [admin, pm1, pm2, dev1, dev2, dev3, dev4];

  for (let i = 0; i < 10; i++) {
    const task = allSeededTasks[i % allSeededTasks.length];
    const changer = changers[i % changers.length];

    await prisma.taskActivityLog.create({
      data: {
        taskId: task.id,
        changedById: changer.id,
        fromStatus: TaskStatus.TODO,
        toStatus: task.status,
        createdAt: daysAgo(10 - i),
      },
    });
  }

  console.log('Created 10 activity log entries');

  await prisma.notification.create({
    data: {
      userId: dev2.id,
      taskId: projectATasks[1].id,
      message: 'You were assigned a new task: "Build checkout flow UI"',
    },
  });

  await prisma.notification.create({
    data: {
      userId: pm1.id,
      taskId: projectATasks[3].id,
      message: 'Arjun Mehta moved "Write product search API" to In Review',
    },
  });

  console.log('Created sample notifications');

  console.log('\nSeed complete. Login credentials (all users share the same password):');
  console.log(`  Password: ${PASSWORD}`);
  console.log(`  Admin:     ${admin.email}`);
  console.log(`  PM 1:      ${pm1.email}`);
  console.log(`  PM 2:      ${pm2.email}`);
  console.log(`  Dev 1-4:   ${dev1.email}, ${dev2.email}, ${dev3.email}, ${dev4.email}`);
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });