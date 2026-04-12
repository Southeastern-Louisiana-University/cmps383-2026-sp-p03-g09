import { Group, Tabs, Text, ActionIcon, Drawer, Stack } from '@mantine/core';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { IconShoppingBag } from '@tabler/icons-react';

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabValue = location.pathname === '/menu' ? '/menu'
      : location.pathname === '/promos' ? '/promos'
    : '/';

  const [drawerOpened, setDrawerOpened] = useState(false);
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

        <Group h={60} px="xl" justify="space-between" w="100%">
            <Text size="24pt" className="font-tiempos-headline" onClick={() => navigate('/')} style={{ cursor: 'pointer' }} role="button" aria-label="home">
              caffeinated lions
            </Text>
          <Group spacing="md">
            <Tabs color="#a5b4fc" variant="pills" value={tabValue} onChange={(value) => navigate(value!)}>
              <Tabs.List justify="flex-end" className="font-tiempos-text">
                  <Tabs.Tab value="/menu">menu</Tabs.Tab>
              </Tabs.List>
            </Tabs>

            <ActionIcon size="lg" variant="transparent" onClick={() => setDrawerOpened((o) => !o)} aria-label="cart">
              <IconShoppingBag size={24} />
            </ActionIcon>
          </Group>

          <Drawer opened={drawerOpened} onClose={() => setDrawerOpened(false)} title="Your Order" position="right" padding="md" size="md">
            <Stack spacing="sm">
              {cartItems && cartItems.length > 0 ? (
                cartItems.map((it: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{it.name ?? 'item'}</span>
                    <span style={{ color: '#6b7280' }}>{it.qty ?? 1}</span>
                  </div>
                ))
              ) : (
                <div style={{ color: '#6b7280' }}>No items in cart</div>
              )}
            </Stack>
          </Drawer>
        </Group>
  );
}

export default NavBar;