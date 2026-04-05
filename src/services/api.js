const BASE_URL = "http://localhost:8081/api";

// ✅ SIGNUP API
export const signup = async (data) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,        // ✅ FIX: added name
        email: data.email,
        password: data.password
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || "Signup failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Signup API error:", error);

    if (error instanceof TypeError || /Failed to fetch/i.test(error.message)) {
      throw new Error("Cannot reach backend. Start API server at http://localhost:8081");
    }

    throw error;
  }
};

// ✅ LOGIN API
export const login = async (data) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || "Login failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Login API error:", error);

    if (error instanceof TypeError || /Failed to fetch/i.test(error.message)) {
      throw new Error("Cannot reach backend. Start API server at http://localhost:8081");
    }

    throw error;
  }
};

export const getProducts = () =>
  fetch(`${BASE_URL}/products`).then(res => res.json());

export const addProduct = (data) =>
  fetch(`${BASE_URL}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });