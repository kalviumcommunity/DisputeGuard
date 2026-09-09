import { listMerchantDisputes } from '../lib/merchant-disputes';
import { seedSchemaDemo } from '../prisma/demo-seed';
import { withSchemaDatabase } from '../tests/helpers/schema-database';

async function main() {
  await withSchemaDatabase(async (client) => {
    const { merchant } = await seedSchemaDemo(client);
    const disputes = await listMerchantDisputes(client, merchant.id);
    console.table(disputes.map((dispute) => ({
      reference: dispute.reference,
      title: dispute.title,
      amountMinor: dispute.amountMinor,
      currency: dispute.currency,
      status: dispute.status,
      merchant: dispute.merchant.name,
    })));
    console.log(`Read ${disputes.length} merchant disputes using the generated Prisma Client. Database closes after this command.`);
  });
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
