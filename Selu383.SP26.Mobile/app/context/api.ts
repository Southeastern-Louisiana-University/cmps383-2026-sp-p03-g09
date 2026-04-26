export type UserDto = {
    id: number;
    userName: string;
    roles: string[];
    loyaltyPoints: number;
    memberSince: string | null;
    tier: string; // "cub" | "silver paw" | "golden paw"
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

export type MenuItemAddOnDto = {
    id: number;
    label: string;
    price: number;
};

export type MenuItemToggleDto = {
    id: number;
    label: string;
    defaultOn: boolean;
};

export type MenuItemDto = {
    id: number;
    name: string;
    description: string;
    basePrice: number;
    category: string; // "drinks" | "sweet crepes" | "savory crepes" | "bagels"
    hasSizes: boolean;
    smallPrice: number | null;
    mediumPrice: number | null;
    largePrice: number | null;
    addOns: MenuItemAddOnDto[];
    toggles: MenuItemToggleDto[];
};

export type RewardDto = {
    id: number;
    name: string;
    description: string;
    pointCost: number;
    category: string; // "drink" | "food"
};

export type OrderItemDto = {
    id: number;
    menuItemId: number;
    menuItemName: string;
    size?: string;
    quantity: number;
    unitPrice: number;
    selectedAddOnsJson: string;
    selectedTogglesJson: string;
};

export type OrderDto = {
    id: number;
    userId?: number;
    locationId: number;
    locationName: string;
    orderType: string;
    pickupTime: string;
    paymentMethod: string;
    status: string;
    total: number;
    pointsEarned: number;
    createdAt: string;
    items: OrderItemDto[];
};

export type CreateOrderItemDto = {
    menuItemId: number;
    size?: string;
    quantity: number;
    selectedAddOnIds: number[];
    selectedToggleLabels: string[];
};

export type CreateOrderDto = {
    locationId: number;
    orderType: string;
    pickupTime: string; // ISO string
    paymentMethod: string;
    items: CreateOrderItemDto[];
};

export type SaveMenuItemDto = {
    name: string;
    description: string;
    basePrice: number;
    category: string;
    hasSizes: boolean;
    smallPrice: number | null;
    mediumPrice: number | null;
    largePrice: number | null;
};

const BASE_URL = 'https://selu383-sp26-p03-g09.azurewebsites.net';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE_URL}${url}`, { 
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
            fetch(`${BASE_URL}/api/authentication/logout`, {
                method: 'POST',
                credentials: 'include',
            }),
    },
    locations: {
        getAll: () => request<LocationDto[]>('/api/locations'),
        getById: (id: number) => request<LocationDto>(`/api/locations/${id}`),
    },
    menuItems: {
        getAll: () => request<MenuItemDto[]>('/api/menu-items'),
        getById: (id: number) => request<MenuItemDto>(`/api/menu-items/${id}`),
    },
    orders: {
        getAll: () => request<OrderDto[]>('/api/orders'),
        getById: (id: number) => request<OrderDto>(`/api/orders/${id}`),
        create: (dto: CreateOrderDto) =>
            request<OrderDto>('/api/orders', {
                method: 'POST',
                body: JSON.stringify(dto),
            }),
    },
    rewards: {
        getAll: () => request<RewardDto[]>('/api/rewards'),
        redeem: (id: number) =>
            request<UserDto>(`/api/rewards/${id}/redeem`, { method: 'POST' }),
    },
};
