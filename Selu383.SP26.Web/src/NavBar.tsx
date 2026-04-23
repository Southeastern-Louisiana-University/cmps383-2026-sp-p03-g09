import {
    Group,
    Text,
    ActionIcon,
    Drawer,
    Stack,
    Indicator,
    Button,
    Divider,
    UnstyledButton,
    useComputedColorScheme,
    useMantineColorScheme,
} from '@mantine/core';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { IconShoppingBag, IconSun, IconMoon } from '@tabler/icons-react';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import Login from './Login';

const NAV_LINKS = [
    { label: 'menu',    path: '/menu' },
    { label: 'stores',  path: '/stores' },
    { label: 'rewards', path: '/rewards' },
];

function NavBar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const { items, total, itemCount, updateQty } = useCart();
    const { toggleColorScheme } = useMantineColorScheme();
    const computedColorScheme = useComputedColorScheme('dark');

    const [drawerOpened, setDrawerOpened] = useState(false);
    const [loginOpened, setLoginOpened] = useState(false);

    const isActive = (path: string) => location.pathname === path;

    return (
        <>
            <Group
                h={60}
                px="xl"
                justify="space-between"
                className="glass-nav"
                style={{ width: '100%', boxSizing: 'border-box' }}
            >
                {/* Logo */}
                <Text
                    size="24pt"
                    className="font-tiempos-headline"
                    onClick={() => navigate('/')}
                    style={{ cursor: 'pointer', flexShrink: 0 }}
                    role="button"
                    aria-label="home"
                >
                    caffeinated lions
                </Text>

                {/* Right side */}
                <Group gap={20} align="right">
                    {/* Nav links */}
                    {NAV_LINKS.map(link => (
                        <UnstyledButton
                            key={link.path}
                            onClick={() => navigate(link.path)}
                            className="nav-link"
                            data-active={isActive(link.path) || undefined}
                        >
                            {link.label}
                        </UnstyledButton>
                    ))}

                    {user && (
                        <UnstyledButton
                            onClick={() => navigate('/profile')}
                            className="nav-link"
                            data-active={isActive('/profile') || undefined}
                        >
                            profile
                        </UnstyledButton>
                    )}

                    {user?.roles.includes('Admin') && (
                        <UnstyledButton
                            onClick={() => navigate('/admin')}
                            className="nav-link"
                            data-active={isActive('/admin') || undefined}
                        >
                            admin
                        </UnstyledButton>
                    )}

                    {/* Divider */}
                    <Divider orientation="vertical" h={20} style={{ alignSelf: 'center', margin: '0 4px' }} />

                    {/* Theme toggle */}
                    <ActionIcon
                        size="lg"
                        variant="transparent"
                        onClick={() => toggleColorScheme()}
                        aria-label="toggle color scheme"
                        style={{ opacity: 0.7 }}
                    >
                        {computedColorScheme === 'dark'
                            ? <IconSun size={18} />
                            : <IconMoon size={18} />}
                    </ActionIcon>

                    {/* Cart */}
                    <Indicator
                        label={itemCount > 0 ? String(itemCount) : undefined}
                        disabled={itemCount === 0}
                        color="#a5b4fc"
                        size={17}
                        offset={4}
                    >
                        <ActionIcon
                            size="lg"
                            variant="transparent"
                            onClick={() => setDrawerOpened(o => !o)}
                            aria-label="cart"
                            style={{ opacity: 0.7 }}
                        >
                            <IconShoppingBag size={20} />
                        </ActionIcon>
                    </Indicator>

                    {/* Auth */}
                    {user ? (
                        <Button
                            onClick={() => logout()}
                            variant="subtle"
                            color="gray"
                            size="sm"
                            className="font-tiempos-text"
                            tt="lowercase"
                            style={{ opacity: 0.65 }}
                        >
                            sign out
                        </Button>
                    ) : (
                        <Button
                            onClick={() => setLoginOpened(true)}
                            variant="subtle"
                            color="#a5b4fc"
                            size="sm"
                            className="font-tiempos-text"
                            tt="lowercase"
                        >
                            sign in
                        </Button>
                    )}
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
                <Stack gap="sm">
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
                                variant="outline"
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
