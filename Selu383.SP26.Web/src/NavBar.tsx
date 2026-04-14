import { Group, Tabs, Text, ActionIcon, Drawer, Stack, Badge, Button } from '@mantine/core';
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
  const [countBadge, setCountBadge] = useState<number>(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('cart');
      setCartItems(raw ? JSON.parse(raw) : []);
    } catch {
      setCartItems([]);
    }
  }, [drawerOpened]);

  useEffect(() => {
    const update = () => {
      try {
        const raw = localStorage.getItem('cart');
        const current = raw ? JSON.parse(raw) : [];
        setCartItems(current);
        const total = current.reduce((s: number, it: any) => s + (it.qty || 0), 0);
        setCountBadge(total);
      } catch {
        setCartItems([]);
        setCountBadge(0);
      }
    };

    update();
    window.addEventListener('cartUpdated', update);
    return () => window.removeEventListener('cartUpdated', update);
  }, []);

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

            <ActionIcon size="lg" variant="transparent" onClick={() => setDrawerOpened((o) => !o)} aria-label="cart" style={{ position: 'relative' }}>
              <IconShoppingBag size={24} />
              {countBadge > 0 && (
                <Badge size="xs" color="pink" variant="filled" style={{ position: 'absolute', bottom: -6, left: -6 }}>
                  {countBadge}
                </Badge>
              )}
            </ActionIcon>
          </Group>

          <Drawer opened={drawerOpened} onClose={() => setDrawerOpened(false)} title="Your Order" position="right" padding="md" size="md">
            <Stack spacing="sm">
              {cartItems && cartItems.length > 0 ? (
                <>
                  {cartItems.map((it: any) => (
                    <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{it.name}</div>
                        <div style={{ color: '#6b7280', fontSize: 12 }}>
                          {[
                            it.size ? `size: ${it.size}` : null,
                            it.toasted ? 'toasted' : null,
                            it.whip ? 'whip' : null,
                          ].filter(Boolean).join(' • ')}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ color: '#6b7280', textAlign: 'right' }}>{it.qty} × ${(it.unitPrice || 0).toFixed(2)}</div>
                        <Button size="xs" variant="outline" onClick={() => {
                          try {
                            const raw = localStorage.getItem('cart');
                            const current = raw ? JSON.parse(raw) : [];
                            const idx = current.findIndex((ci: any) => ci.id === it.id);
                            if (idx >= 0) {
                              current[idx].qty = (current[idx].qty || 0) - 1;
                              if (current[idx].qty <= 0) current.splice(idx, 1);
                              localStorage.setItem('cart', JSON.stringify(current));
                              window.dispatchEvent(new Event('cartUpdated'));
                            }
                          } catch {}
                        }}>-</Button>
                      </div>
                    </div>
                  ))}

                  <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: 8, marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: '#6b7280' }}>Total</div>
                    <div style={{ fontWeight: 700 }}>${(cartItems.reduce((s: number, it: any) => s + ((it.unitPrice || 0) * (it.qty || 0)), 0)).toFixed(2)}</div>
                  </div>
                </>
              ) : (
                <div style={{ color: '#6b7280' }}>No items in bag</div>
              )}
            </Stack>
          </Drawer>
        </Group>
  );
}

export default NavBar;