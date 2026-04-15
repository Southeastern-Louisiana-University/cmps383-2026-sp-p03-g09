import { createContext, useContext, useEffect, useState } from 'react';

export interface CartAddOn {
    id: number;
    label: string;
    price: number;
}

export interface CartItem {
    cartItemId: string;
    menuItemId: number;
    name: string;
    size?: 'small' | 'medium' | 'large';
    selectedAddOns: CartAddOn[];
    selectedToggleLabels: string[];
    qty: number;
    unitPrice: number; // base + size upcharge + add-ons
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'cartItemId'>) => void;
    removeItem: (cartItemId: string) => void;
    updateQty: (cartItemId: string, qty: number) => void;
    clearCart: () => void;
    total: number;
    itemCount: number;
}

const STORAGE_KEY = 'cart_v2';

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    const addItem = (item: Omit<CartItem, 'cartItemId'>) => {
        const cartItemId = `${item.menuItemId}-${item.size ?? 'ns'}-${Date.now()}`;
        setItems(prev => [...prev, { ...item, cartItemId }]);
    };

    const removeItem = (cartItemId: string) => {
        setItems(prev => prev.filter(i => i.cartItemId !== cartItemId));
    };

    const updateQty = (cartItemId: string, qty: number) => {
        if (qty <= 0) {
            removeItem(cartItemId);
        } else {
            setItems(prev => prev.map(i => i.cartItemId === cartItemId ? { ...i, qty } : i));
        }
    };

    const clearCart = () => setItems([]);

    const total = items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);
    const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, itemCount }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used inside CartProvider');
    return ctx;
}
