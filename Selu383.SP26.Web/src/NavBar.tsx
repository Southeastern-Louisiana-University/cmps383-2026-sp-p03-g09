import { Group, Tabs, Text, ActionIcon, Drawer, Stack } from '@mantine/core';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { IconShoppingBag } from '@tabler/icons-react';
import { useAuth } from './AuthContext';
import Login from './Login';

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const tabValue = location.pathname === '/menu' ? '/menu'
      : location.pathname === '/stores' ? '/stores'
      : location.pathname === '/promos' ? '/promos'
    : '/';

  const [drawerOpened, setDrawerOpened] = useState(false);
  const [loginOpened, setLoginOpened] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('cart');
      setCartItems(raw ? JSON.parse(raw) : []);
    } catch {
      setCartItems([]);
    }
  }, [drawerOpened]);

    return (
        <>
        <Group h={60} px="xl" justify="space-between" w="100%">
            <Text size="24pt" className="font-tiempos-headline" onClick={() => navigate('/')} style={{ cursor: 'pointer' }} role="button" aria-label="home">
              caffeinated lions
            </Text>
          <Group gap="md">
            <Tabs color="#a5b4fc" variant="pills" value={tabValue} onChange={(value) => navigate(value!)}>
              <Tabs.List justify="flex-end" className="font-tiempos-text">
                  <Tabs.Tab value="/menu">menu</Tabs.Tab>
                  <Tabs.Tab value="/stores">stores</Tabs.Tab>
              </Tabs.List>
            </Tabs>

            <ActionIcon size="lg" variant="transparent" onClick={() => setDrawerOpened((o) => !o)} aria-label="cart">
              <IconShoppingBag size={24} />
            </ActionIcon>

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

          <Drawer opened={drawerOpened} onClose={() => setDrawerOpened(false)} title="Your Order" position="right" padding="md" size="md">
            <Stack gap="sm">
              {cartItems && cartItems.length > 0 ? (
                cartItems.map((it: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{it.name ?? 'item'}</span>
                    <span style={{ color: '#6b7280' }}>{it.qty ?? 1}</span>
                  </div>
                ))
              ) : (
                <div style={{ color: '#6b7280' }}>No items in bag</div>
              )}
            </Stack>
          </Drawer>
        </Group>

        <Login opened={loginOpened} onClose={() => setLoginOpened(false)} />
        </>
  );
}

export default NavBar;
