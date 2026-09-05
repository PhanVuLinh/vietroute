import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Đang nạp dữ liệu mẫu...');

  // 1. Tạo Role ADMIN
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Quản trị viên hệ thống',
    },
  });

  // 2. Tự động Hash mật khẩu (123456)
  const hashedPassword = await bcrypt.hash('123456', 10);

  // 3. Tạo User liên kết với Role
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@vietroute.com' },
    update: {},
    create: {
      email: 'admin@vietroute.com',
      password_hash: hashedPassword,
      full_name: 'Super Admin',
      role_id: adminRole.id,
      status: 'ACTIVE',
    },
  });

  console.log('✅ Nạp dữ liệu thành công!');
  console.log('Tài khoản test: admin@vietroute.com / 123456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
