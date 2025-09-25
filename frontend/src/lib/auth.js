export const auth = {
  get token() {
    return localStorage.getItem("token");
  },
  get user() {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  },
  login({ token, user }) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  },
  updateUser(user) {
    if (user === null || user === undefined) {
      localStorage.removeItem("user");
      return;
    }
    localStorage.setItem("user", JSON.stringify(user));
  },
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};
