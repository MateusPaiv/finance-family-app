-- Add new columns first (before dropping old ones)
ALTER TABLE "fixed_bills"
ADD COLUMN     "start_month" INTEGER,
ADD COLUMN     "start_year" INTEGER,
ADD COLUMN     "total_installments" INTEGER;

-- CreateTable
CREATE TABLE "fixed_bill_payments" (
    "id" TEXT NOT NULL,
    "fixed_bill_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "paid_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fixed_bill_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fixed_bill_payments_fixed_bill_id_year_month_key" ON "fixed_bill_payments"("fixed_bill_id", "year", "month");

-- AddForeignKey
ALTER TABLE "fixed_bill_payments" ADD CONSTRAINT "fixed_bill_payments_fixed_bill_id_fkey" FOREIGN KEY ("fixed_bill_id") REFERENCES "fixed_bills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Data migration: convert existing isPaid=true records to FixedBillPayment entries
INSERT INTO "fixed_bill_payments" ("id", "fixed_bill_id", "year", "month", "paid_at")
SELECT
  gen_random_uuid(),
  id,
  EXTRACT(YEAR FROM COALESCE(last_paid_at, NOW()))::int,
  EXTRACT(MONTH FROM COALESCE(last_paid_at, NOW()))::int,
  COALESCE(last_paid_at, NOW())
FROM "fixed_bills"
WHERE is_paid = true;

-- Now safe to drop old columns
ALTER TABLE "fixed_bills" DROP COLUMN "is_paid",
DROP COLUMN "last_paid_at";
