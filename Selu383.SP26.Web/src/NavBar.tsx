import { Group, Tabs } from '@mantine/core';

function NavBar() {
  return (
      <Group h="100%" px="md">
          <Tabs color="#a5b4fc" variant="pills" defaultValue="first">
              <Tabs.List>
                  <Tabs.Tab value="first">testest</Tabs.Tab>
                  <Tabs.Tab value="second">testsetstset</Tabs.Tab>
                  <Tabs.Tab value="third">testsetstestestes</Tabs.Tab>
              </Tabs.List>
          </Tabs>
      </Group>
  );
}

export default NavBar;