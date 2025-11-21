import { describe, expect, it, vi, beforeEach } from "vitest";
import { prisma } from "../db/__mocks__/db.js";
import request from "supertest";
import { app } from "../index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

vi.mock("../db/db");

vi.mock("bcrypt", () => ({
    default: {
        hash: vi.fn(),
        compare: vi.fn(),
    }
}));

vi.mock("jsonwebtoken", () => ({
    default: {
        sign: vi.fn(),
        verify: vi.fn(),
    }
}));

describe("Auth Routes", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("GET /", () => {
        it("Should return hello world", async () => {
            const res = await request(app).get("/api/auth");
            
            expect(res.statusCode).toBe(200);
            expect(res.text).toBe("hellow world");
        });
    });

    describe("POST /register", () => {
        it("Should register a new user successfully", async () => {
            const user = {
                email: "ram@email.com",
                password: "password"
            };

            const hashedPassword = "hashed_password_123";

            vi.mocked(bcrypt.hash).mockResolvedValue(hashedPassword as any);

            prisma.user.findFirst.mockResolvedValue(null);
            
            prisma.user.create.mockResolvedValue({
                id: "1",
                email: user.email,
                password: hashedPassword  
            });

            const res = await request(app).post("/api/auth/register").send(user);

            expect(bcrypt.hash).toHaveBeenCalledWith(user.password, 3);

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

        it("Should return 403 if user already exists", async () => {
            const user = {
                email: "existing@email.com",
                password: "password"
            };

            prisma.user.findFirst.mockResolvedValue({
                id: "1",
                email: user.email,
                password: "hashed_password"
            });

            const res = await request(app).post("/api/auth/register").send(user);

            expect(prisma.user.findFirst).toHaveBeenCalledWith({
                where: {
                    email: user.email
                }
            });

            expect(prisma.user.create).not.toHaveBeenCalled();
            expect(bcrypt.hash).not.toHaveBeenCalled();

            expect(res.statusCode).toBe(403);
            expect(res.body).toBe("User with this email already exists");
        });

        it("Should return 500 on database error", async () => {
            const user = {
                email: "error@email.com",
                password: "password"
            };

            prisma.user.findFirst.mockRejectedValue(new Error("Database error"));

            const res = await request(app).post("/api/auth/register").send(user);

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toBe("Error while registering");
        });
    });

    describe("POST /login", () => {
        it("Should login successfully and return JWT token", async () => {
            const loginData = {
                email: "ram@email.com",
                password: "password"
            };

            const hashedPassword = "hashed_password_123";
            const mockToken = "mock_jwt_token_12345";

            const mockUser = {
                id: "1",
                email: loginData.email,
                password: hashedPassword
            };

            prisma.user.findFirst.mockResolvedValue(mockUser);
            vi.mocked(bcrypt.compare).mockResolvedValue(true as any);
            vi.mocked(jwt.sign).mockReturnValue(mockToken as any);

            const res = await request(app).post("/api/auth/login").send(loginData);

            expect(prisma.user.findFirst).toHaveBeenCalledWith({
                where: {
                    email: loginData.email
                }
            });

            expect(bcrypt.compare).toHaveBeenCalledWith(
                loginData.password,
                hashedPassword
            );

            expect(jwt.sign).toHaveBeenCalledWith(
                { user_id: mockUser.id },
                "secret"
            );

            expect(res.statusCode).toBe(200);
            expect(res.body.token).toBe(mockToken);
        });

        it("Should return 500 if user does not exist", async () => {
            const loginData = {
                email: "nonexistent@email.com",
                password: "password"
            };

            prisma.user.findFirst.mockResolvedValue(null);

            const res = await request(app).post("/api/auth/login").send(loginData);

            expect(prisma.user.findFirst).toHaveBeenCalledWith({
                where: {
                    email: loginData.email
                }
            });

            expect(bcrypt.compare).not.toHaveBeenCalled();
            expect(jwt.sign).not.toHaveBeenCalled();

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toBe("User doesnot exist");
        });

        it("Should return 500 if password is incorrect", async () => {
            const loginData = {
                email: "ram@email.com",
                password: "wrongpassword"
            };

            const mockUser = {
                id: "1",
                email: loginData.email,
                password: "hashed_password_123"
            };

            prisma.user.findFirst.mockResolvedValue(mockUser);
            vi.mocked(bcrypt.compare).mockResolvedValue(false as any);

            const res = await request(app).post("/api/auth/login").send(loginData);

            expect(bcrypt.compare).toHaveBeenCalledWith(
                loginData.password,
                mockUser.password
            );

            expect(jwt.sign).not.toHaveBeenCalled();

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toBe("User doesnot exist");
        });

        it("Should return 500 on database error during login", async () => {
            const loginData = {
                email: "error@email.com",
                password: "password"
            };

            prisma.user.findFirst.mockRejectedValue(new Error("Database error"));

            const res = await request(app).post("/api/auth/login").send(loginData);

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toBe("Error while Loggin In");
        });

        it("Should return 500 if bcrypt.compare throws an error", async () => {
            const loginData = {
                email: "ram@email.com",
                password: "password"
            };

            const mockUser = {
                id: "1",
                email: loginData.email,
                password: "hashed_password_123"
            };

            prisma.user.findFirst.mockResolvedValue(mockUser);
            vi.mocked(bcrypt.compare).mockRejectedValue(new Error("Bcrypt error"));

            const res = await request(app).post("/api/auth/login").send(loginData);

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toBe("Error while Loggin In");
        });
    });
});
