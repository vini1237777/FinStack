import prisma from "../../config/database";

export const customerService = {
  async create(data: {
    name: string;
    gstin?: string;
    stateCode: string;
    email?: string;
    phone?: string;
    address?: string;
    pincode?: string;
  }) {
    return prisma.customer.create({ data });
  },

  async getAll() {
    return prisma.customer.findMany({ orderBy: { createdAt: "desc" } });
  },

  async getById(id: string) {
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new Error("Customer not found");
    return customer;
  },

  async update(id: string, data: any) {
    return prisma.customer.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.customer.delete({ where: { id } });
  },
};
