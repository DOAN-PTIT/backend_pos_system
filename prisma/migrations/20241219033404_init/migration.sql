-- CreateTable
CREATE TABLE "Debt" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "purchase_date" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "deal_date" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "money_must_pay" INTEGER NOT NULL,
    "supplier_id" INTEGER,
    "purchase_id" INTEGER,

    CONSTRAINT "Debt_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Debt" ADD CONSTRAINT "Debt_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Debt" ADD CONSTRAINT "Debt_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "Purchases"("id") ON DELETE SET NULL ON UPDATE CASCADE;
