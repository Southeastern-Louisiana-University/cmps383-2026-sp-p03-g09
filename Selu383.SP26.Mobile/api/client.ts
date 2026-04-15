// base URL for the api. in dev point to the local ASP.NET server
// android emulator: use 10.0.2.2 instead of localhost
// physical device on same network: use your machine's LAN IP
export const API_BASE_URL = 'https://localhost:7116';

export type UserDto = {
    id: number;
    userName: string;
    roles: string[];
};

export type LocationDto = {
    id: number;
    name: string;
    address: string;
    tableCount: number;
    managerId: number | null;
};

export type LoginDto = {
    userName: string;
    password: string;
};

// shared cookie jar for session cookies (react native fetch handles cookies per-session)
async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(text || `${res.status}`);
    }
    return res.json() as Promise<T>;
}

export const apiClient = {
    auth: {
        me: () => request<UserDto>('/api/authentication/me'),
        login: (dto: LoginDto) =>
            request<UserDto>('/api/authentication/login', {
                method: 'POST',
                body: JSON.stringify(dto),
            }),
        logout: () =>
            fetch(`${API_BASE_URL}/api/authentication/logout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            }),
    },
    locations: {
        getAll: () => request<LocationDto[]>('/api/locations'),
        getById: (id: number) => request<LocationDto>(`/api/locations/${id}`),
    },
};
