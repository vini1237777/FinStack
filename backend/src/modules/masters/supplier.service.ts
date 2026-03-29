import prisma from "../../config/database";

export const supplierService = {
  async create(data: {
    name: string;
    gstin?: string;
    stateCode: string;
    email?: string;
    phone?: string;
    address?: string;
    pincode?: string;
  }) {
    return prisma.supplier.create({ data });
  },

  async getAll() {
    return prisma.supplier.findMany({ orderBy: { createdAt: "desc" } });
  },

  async getById(id: string) {
    const supplier = await prisma.supplier.findUnique({ where: { id } });
    if (!supplier) throw new Error("Supplier not found");
    return supplier;
  },

  async update(id: string, data: any) {
    return prisma.supplier.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.supplier.delete({ where: { id } });
  },
};
