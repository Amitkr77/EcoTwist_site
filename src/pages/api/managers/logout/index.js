import cookie from "cookie";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { role } = req.body;

  if (!role) {
    return res.status(400).json({ message: "Manager role is required" });
  }

  const cookieName = `manager:${role}-token`; 
  console.log("cookie name: ", cookieName);

  const expiredCookie = cookie.serialize(cookieName, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
    sameSite: "strict",
    path: "/",
  });

  res.setHeader("Set-Cookie", expiredCookie);

  res.status(200).json({ success: true, message: `${role} manager logged out` });
}
