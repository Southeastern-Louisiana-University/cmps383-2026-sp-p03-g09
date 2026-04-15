import { Group, Tabs, Text, ActionIcon, Drawer, Stack, Indicator, Badge, Button, Divider } from '@mantine/core';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { IconShoppingBag } from '@tabler/icons-react';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import Login from './Login';

function NavBar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const { items, total, itemCount, removeItem, updateQty } = useCart();

    const tabValue = location.pathname === '/menu' ? '/menu'
        : location.pathname === '/stores' ? '/stores'
        : location.pathname === '/promos' ? '/promos'
        : location.pathname === '/rewards' ? '/rewards'
        : location.pathname === '/profile' ? '/profile'
        : '/';

    const [drawerOpened, setDrawerOpened] = useState(false);
    const [loginOpened, setLoginOpened] = useState(false);

    return (
        <>
            <Group h={60} px="xl" justify="space-between" style={{ width: '100%', boxSizing: 'border-box' }}>
                <Text
                    size="24pt"
                    className="font-tiempos-headline"
                    onClick={() => navigate('/')}
                    style={{ cursor: 'pointer' }}
                    role="button"
                    aria-label="home"
                >
                    caffeinated lions
                </Text>

                <Group gap="md">
                    <Tabs color="#a5b4fc" variant="pills" value={tabValue} onChange={(value) => navigate(value!)}>
                        <Tabs.List justify="flex-end" className="font-tiempos-text">
                            <Tabs.Tab value="/menu">menu</Tabs.Tab>
                            <Tabs.Tab value="/stores">stores</Tabs.Tab>
                            <Tabs.Tab value="/promos">promos</Tabs.Tab>
                            <Tabs.Tab value="/rewards">rewards</Tabs.Tab>
                            {user && (
                                <Tabs.Tab value="/profile">profile</Tabs.Tab>
                            )}
                        </Tabs.List>
                    </Tabs>

                    <Indicator
                        label={itemCount > 0 ? String(itemCount) : undefined}
                        disabled={itemCount === 0}
                        color="#a5b4fc"
                        size={18}
                        offset={4}
                    >
                        <ActionIcon
                            size="lg"
                            variant="transparent"
                            onClick={() => setDrawerOpened(o => !o)}
                            aria-label="cart"
                        >
                            <IconShoppingBag size={24} />
                        </ActionIcon>
                    </Indicator>

                    <Tabs color="#a5b4fc" variant="pills" value={null}>
                        <Tabs.List className="font-tiempos-text">
                            {user ? (
                                <Tabs.Tab value="signout" onClick={() => logout()}>
                                    sign out
                                </Tabs.Tab>
                            ) : (
                                <Tabs.Tab value="signin" onClick={() => setLoginOpened(true)}>
                                    sign in
                                </Tabs.Tab>
                            )}
                        </Tabs.List>
                    </Tabs>
                </Group>
            </Group>

            {/* Cart drawer */}
            <Drawer
                opened={drawerOpened}
                onClose={() => setDrawerOpened(false)}
                title={
                    <Text size="18pt" className="font-tiempos-headline" fw={300}>
                        your bag
                    </Text>
                }
                position="right"
                padding="md"
                size="md"
            >
                <Stack gap="sm" style={{ height: '100%' }}>
                    {items.length === 0 ? (
                        <Text size="13pt" c="dimmed" className="font-tiempos-text">
                            nothing here yet — add something from the menu.
                        </Text>
                    ) : (
                        <>
                            {items.map(item => (
                                <Group key={item.cartItemId} justify="space-between" align="center">
                                    <Stack gap={0} style={{ flex: 1 }}>
                                        <Text size="12pt" fw={500}>{item.name}</Text>
                                        {item.size && (
                                            <Text size="10pt" c="dimmed">{item.size}</Text>
                                        )}
                                        {item.selectedAddOns.length > 0 && (
                                            <Text size="10pt" c="dimmed">
                                                {item.selectedAddOns.map(a => a.label).join(', ')}
                                            </Text>
                                        )}
                                    </Stack>
                                    <Group gap="xs">
                                        <ActionIcon
                                            size="xs"
                                            variant="subtle"
                                            onClick={() => updateQty(item.cartItemId, item.qty - 1)}
                                        >
                                            −
                                        </ActionIcon>
                                        <Text size="12pt">{item.qty}</Text>
                                        <ActionIcon
                                            size="xs"
                                            variant="subtle"
                                            onClick={() => updateQty(item.cartItemId, item.qty + 1)}
                                        >
                                            +
                                        </ActionIcon>
                                        <Text size="12pt" style={{ minWidth: 50, textAlign: 'right' }}>
                                            ${(item.unitPrice * item.qty).toFixed(2)}
                                        </Text>
                                    </Group>
                                </Group>
                            ))}

                            <Divider />

                            <Group justify="space-between">
                                <Text size="13pt" fw={600}>total</Text>
                                <Text size="13pt" fw={600}>${total.toFixed(2)}</Text>
                            </Group>

                            <Button
                                onClick={() => {
                                    setDrawerOpened(false);
                                    navigate('/cart');
                                }}
                                color="#a5b4fc"
                                className="font-tiempos-text"
                                tt="lowercase"
                                fullWidth
                                mt="sm"
                            >
                                checkout
                            </Button>
                        </>
                    )}
                </Stack>
            </Drawer>

            <Login opened={loginOpened} onClose={() => setLoginOpened(false)} />
        </>
    );
}

export default NavBar;
