import { Group, Tabs } from '@mantine/core';
import { useNavigate, useLocation } from 'react-router-dom';

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabValue = location.pathname === '/menu' ? '/menu'
    : location.pathname === '/order' ? '/order'
    : '/';

  return (
      <Group h={60} px="md" style={{ width: '100%' }}>
          <Tabs color="#a5b4fc" variant="pills" value={tabValue} onChange={(value) => navigate(value!)}>
              <Tabs.List justify="flex-start">
                  <Tabs.Tab value="/">home</Tabs.Tab>
                  <Tabs.Tab value="/menu">menu</Tabs.Tab>
                  <Tabs.Tab value="/order">order</Tabs.Tab>
              </Tabs.List>
          </Tabs>
      </Group>
  );
}

export default NavBar;