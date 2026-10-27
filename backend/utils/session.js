// How long a login lasts. The admin account is shared by several front-desk
// PCs, so its sessions expire after a working shift; doctors stay logged in longer.
const adminSessionHours = () => Number(process.env.ADMIN_SESSION_HOURS) || 8;

export const sessionLength = (role) =>
  role === "Admin"
    ? { jwt: `${adminSessionHours()}h`, ms: adminSessionHours() * 60 * 60 * 1000 }
    : {
        jwt: process.env.JWT_EXPIRES || "7d",
        ms: (Number(process.env.COOKIE_EXPIRES) || 7) * 24 * 60 * 60 * 1000,
      };
