import { prisma } from '../lib/prisma.js';

const DEMO = '[demo] '; // demo ဒေတာကို မှတ်သားဖို့ (နောက်ပိုင်း ဖျက်ရလွယ်အောင်)

function parseArgs() {
  const [rawEmail, flag] = process.argv.slice(2);
  const email = rawEmail?.trim().toLowerCase(); // register လုပ်တုန်းက lowercase သိမ်းလို့
  if (!email) {
    console.error('Usage: npm run seed:demo -- <email> [--clean]');
    process.exit(1);
  }
  return { email, clean: flag === '--clean' };
}

const { email, clean } = parseArgs();

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// Array ထဲက တစ်ခုကို random ရွေး၊ type က T (undefined မဟုတ်) အဖြစ် အာမခံ
function pick<T>(items: T[]): T {
  const item = items[rand(0, items.length - 1)];
  if (item === undefined) throw new Error('pick() called with an empty list');
  return item;
}

function ensureCategory(userId: number, name: string, color: string) {
  return prisma.category.upsert({
    where: { userId_name: { userId, name } },
    update: {},
    create: { userId, name, color },
  });
}

async function main() {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error(
      `User not found: ${email} (Expense Tracker မှာ register လုပ်ထားတဲ့ email ကိုသုံးပါ)`,
    );
  }

  // --clean: "[demo]" နဲ့စတဲ့ transaction တွေကိုပဲ ဖျက် (ကိုယ်ထည့်တာတွေ မထိ)
  if (clean) {
    const { count } = await prisma.transaction.deleteMany({
      where: { userId: user.id, note: { startsWith: DEMO } },
    });
    console.log(`Deleted ${count} demo transactions`);
    return;
  }

  const food = await ensureCategory(user.id, 'စားသောက်စရိတ်', '#f97316');
  const transport = await ensureCategory(user.id, 'သွားလာစရိတ်', '#0ea5e9');
  const shopping = await ensureCategory(user.id, 'ဈေးဝယ်', '#8b5cf6');
  const salary = await ensureCategory(user.id, 'လစာ', '#22c55e');
  const expenseCategories = [food, transport, shopping];

  // ၆၀ ရက်အတွင်း ထွက်ငွေ ၅၀ ခု
  const now = Date.now();
  const rows = [];
  for (let i = 0; i < 50; i++) {
    const category = pick(expenseCategories);
    rows.push({
      userId: user.id,
      type: 'EXPENSE' as const,
      amount: rand(5, 300) * 100,
      date: new Date(now - rand(0, 59) * 86_400_000 - rand(0, 86_399) * 1000),
      note: `${DEMO}${category.name}`,
      categoryId: category.id,
    });
  }

  // လစာ (ဒီလ ၁ ရက်၊ ပြီးခဲ့တဲ့လ ၁ ရက်)
  const today = new Date();
  for (const monthsAgo of [0, 1]) {
    rows.push({
      userId: user.id,
      type: 'INCOME' as const,
      amount: 1_500_000,
      date: new Date(
        today.getFullYear(),
        today.getMonth() - monthsAgo,
        1,
        9,
        0,
      ),
      note: `${DEMO}လစာ`,
      categoryId: salary.id,
    });
  }

  await prisma.transaction.createMany({ data: rows });
  console.log(`Created ${rows.length} demo transactions for ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit();
  });
