import { Group, Tabs, Text, Container } from '@mantine/core';
import { useNavigate, useLocation } from 'react-router-dom';

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabValue = location.pathname === '/menu' ? '/menu'
    : location.pathname === '/order' ? '/order'
    : '/';

    return (

        <Group h={60} px="xl" justify="space-between" w="100%">
            <Text size="24pt" className="font-tiempos-headline">caffeinated lions</Text>
          <Tabs color="#a5b4fc" variant="pills" value={tabValue} onChange={(value) => navigate(value!)}>
              <Tabs.List justify="flex-end" className="font-tiempos-text">
                  <Tabs.Tab value="/">home</Tabs.Tab>
                  <Tabs.Tab value="/menu">menu</Tabs.Tab>
                  <Tabs.Tab value="/order">order</Tabs.Tab>
              </Tabs.List>
            </Tabs>
            </Group>
  );
}

export default NavBar;