-- AlterTable
ALTER TABLE "fixed_bills" ADD COLUMN     "is_shared" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "shared_fixed_bills" (
    "id" TEXT NOT NULL,
    "fixed_bill_id" TEXT NOT NULL,
    "shared_with_id" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "split_amount" DECIMAL(12,2) NOT NULL,
    "is_paid" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shared_fixed_bills_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shared_fixed_bills_fixed_bill_id_shared_with_id_key" ON "shared_fixed_bills"("fixed_bill_id", "shared_with_id");

-- AddForeignKey
ALTER TABLE "shared_fixed_bills" ADD CONSTRAINT "shared_fixed_bills_fixed_bill_id_fkey" FOREIGN KEY ("fixed_bill_id") REFERENCES "fixed_bills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_fixed_bills" ADD CONSTRAINT "shared_fixed_bills_shared_with_id_fkey" FOREIGN KEY ("shared_with_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_fixed_bills" ADD CONSTRAINT "shared_fixed_bills_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
