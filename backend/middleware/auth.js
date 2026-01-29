// User auth is intentionally disabled.

export const protect = (req, res) => {
  return res.status(410).json({ success: false, message: "User authentication is disabled" });
};

export const admin = (req, res) => {
  return res.status(410).json({ success: false, message: "User authentication is disabled" });
};
