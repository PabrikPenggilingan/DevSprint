"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adjustStock = adjustStock;
exports.listStockMovements = listStockMovements;
const client_1 = require("@prisma/client");
const constants_1 = require("../lib/constants");
const db_1 = require("../lib/db");
const errors_1 = require("../lib/errors");
const MAX_MOVEMENTS_IN_LIST = 300;
const movementInclude = {
    product: { select: { name: true, sku: true, isActive: true } },
};
function toStockMovementDto(movement, referenceLabel) {
    return {
        id: movement.id,
        productId: movement.productId,
        productName: movement.product.name,
        productSku: movement.product.sku,
        productIsActive: movement.product.isActive,
        type: movement.type,
        quantity: movement.quantity,
        beforeStock: movement.beforeStock,
        afterStock: movement.afterStock,
        referenceType: movement.referenceType,
        referenceId: movement.referenceId,
        referenceLabel,
        note: movement.note,
        createdAt: movement.createdAt.toISOString(),
    };
}
// Manual stock in / stock out. Product stock and its StockMovement change in one transaction.
async function adjustStock(input) {
    return db_1.db.$transaction(async (tx) => {
        const product = await tx.product.findUnique({ where: { id: input.productId } });
        if (!product)
            throw new errors_1.NotFoundError('Produk tidak ditemukan.');
        if (!product.isActive)
            throw new errors_1.ConflictError(constants_1.PRODUCT_INACTIVE_STOCK_MESSAGE);
        if (input.type === 'OUT') {
            if (product.stock < input.quantity) {
                throw new errors_1.ConflictError(`Stok ${product.name} tidak mencukupi. Tersedia ${product.stock}.`);
            }
            // Guarded update: refuses to run if the stock dropped in the meantime.
            const { count } = await tx.product.updateMany({
                where: { id: product.id, stock: { gte: input.quantity } },
                data: { stock: { decrement: input.quantity } },
            });
            if (count === 0) {
                throw new errors_1.ConflictError(`Stok ${product.name} berubah dan tidak lagi mencukupi. Silakan coba lagi.`);
            }
        }
        else {
            await tx.product.update({
                where: { id: product.id },
                data: { stock: { increment: input.quantity } },
            });
        }
        const { stock: afterStock } = await tx.product.findUniqueOrThrow({
            where: { id: product.id },
            select: { stock: true },
        });
        const beforeStock = input.type === 'OUT' ? afterStock + input.quantity : afterStock - input.quantity;
        const movement = await tx.stockMovement.create({
            data: {
                productId: product.id,
                type: input.type === 'OUT' ? client_1.StockMovementType.ADJUSTMENT_OUT : client_1.StockMovementType.ADJUSTMENT_IN,
                quantity: input.quantity,
                beforeStock,
                afterStock,
                note: input.note ?? null,
            },
            include: movementInclude,
        });
        return toStockMovementDto(movement, null);
    });
}
async function listStockMovements(filter) {
    const movements = await db_1.db.stockMovement.findMany({
        where: filter.productId ? { productId: filter.productId } : {},
        orderBy: { createdAt: 'desc' },
        take: MAX_MOVEMENTS_IN_LIST,
        include: movementInclude,
    });
    // Sale movements point to their sale through referenceType / referenceId; show the invoice number.
    const saleIds = [];
    for (const movement of movements) {
        if (movement.referenceType === 'SALE' && movement.referenceId) {
            saleIds.push(movement.referenceId);
        }
    }
    const sales = saleIds.length > 0
        ? await db_1.db.sale.findMany({
            where: { id: { in: saleIds } },
            select: { id: true, invoiceNumber: true },
        })
        : [];
    const invoiceBySaleId = new Map(sales.map((sale) => [sale.id, sale.invoiceNumber]));
    return movements.map((movement) => toStockMovementDto(movement, movement.referenceId ? (invoiceBySaleId.get(movement.referenceId) ?? null) : null));
}
