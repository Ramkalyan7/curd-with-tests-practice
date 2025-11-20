import { describe, expect, it, vi } from "vitest";
import { prisma } from "../db/__mocks__/db.js";
import request from "supertest";
import { app } from "../index.js";
import bcrypt from "bcrypt";

vi.mock("../db/db.ts");
vi.mock("bcrypt", () => ({
    default: {
        hash: vi.fn(),
        compare: vi.fn(),
    }
}));

describe("Auth/Register", () => {
    it("Should return success response", async () => {
        const user = {
            email: "ram@email.com",
            password: "password"
        };

        const hashedPassword = "hashed_password_123";

        vi.mocked(bcrypt.hash).mockResolvedValue(hashedPassword as any);

        prisma.user.findFirst.mockResolvedValue(null);
        
        // ✅ Return hashed password to match reality
        prisma.user.create.mockResolvedValue({
            id: "1",
            email: user.email,
            password: hashedPassword  // Changed from user.password
        });

        const res = await request(app).post("/api/auth/register").send(user);

        expect(prisma.user.findFirst).toHaveBeenCalledWith({
            where: {
                email: user.email
            }
        });

        expect(prisma.user.create).toHaveBeenCalledWith({
            data: {
                email: user.email,
                password: hashedPassword,
            }
        });

        expect(res.statusCode).toBe(201);
        expect(res.body.user).toEqual({ 
            id: "1", 
            email: user.email, 
            password: hashedPassword 
        });
    });
});
