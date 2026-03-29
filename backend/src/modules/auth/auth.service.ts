import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../config/database";

const JWT_SECRET = process.env.JWT_SECRET || "finstack-secret-key";
const JWT_EXPIRES_IN = "24h";

export const authService = {
  async register(data: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new Error("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role || "sales_exec",
      },
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (!user.isActive) {
      throw new Error("Account is deactivated");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  },
};
