-- CreateTable
CREATE TABLE "SupplierProducts" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER,
    "supplier_id" INTEGER,

    CONSTRAINT "SupplierProducts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SupplierProducts" ADD CONSTRAINT "SupplierProducts_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierProducts" ADD CONSTRAINT "SupplierProducts_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
