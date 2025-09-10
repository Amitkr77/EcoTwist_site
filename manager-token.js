import jwt from 'jsonwebtoken'

const token = jwt.sign(
    {
        id: "user-id-123",
        role: "manager:sales"
    },
    "manager_secret", // or process.env.MANAGER_JWT_SECRET
    { expiresIn: "1h" }
);

console.log("JWT Token:", token);
