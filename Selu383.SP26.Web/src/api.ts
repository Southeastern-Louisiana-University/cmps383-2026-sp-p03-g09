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

async function request<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(url, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`);
    }
    return res.json() as Promise<T>;
}

export const api = {
    auth: {
        me: () => request<UserDto>('/api/authentication/me'),
        login: (dto: LoginDto) =>
            request<UserDto>('/api/authentication/login', {
                method: 'POST',
                body: JSON.stringify(dto),
            }),
        logout: () =>
            fetch('/api/authentication/logout', {
                method: 'POST',
                credentials: 'include',
            }),
    },
    locations: {
        getAll: () => request<LocationDto[]>('/api/locations'),
        getById: (id: number) => request<LocationDto>(`/api/locations/${id}`),
    },
};
