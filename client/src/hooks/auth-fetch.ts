export async function authFetch(
    input: RequestInfo,
    init: RequestInit = {}
) {
    const token = localStorage.getItem("authToken");

    const headers = new Headers(init.headers);

    headers.set("Content-Type", "application/json");

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const res = await fetch(input, {
        ...init,
        headers,
    });

    if (!res.ok) {
        let message = "Request failed";
        try {
            const data = await res.json();
            message = data?.message || message;
        } catch { }
        throw new Error(message);
    }

    return res.json();
}
