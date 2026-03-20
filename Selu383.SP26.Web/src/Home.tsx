import { AppShell, Text, Group, Tabs } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
export default function Home() {
    const [opened, { toggle }] = useDisclosure();
    return (
        <AppShell
            header={{ height: 60 }}
            padding="md"
        >
            <AppShell.Header>
                <Group h="100%" px="md">
                    <Tabs color="#a5b4fc" variant="pills" defaultValue="first">
                        <Tabs.List>
                            <Tabs.Tab value="first">home</Tabs.Tab>
                            <Tabs.Tab value="second">menu</Tabs.Tab>
                            <Tabs.Tab value="third">order</Tabs.Tab>
                        </Tabs.List>
                    </Tabs>
                </Group>
            </AppShell.Header>

            <AppShell.Main>
                <Text>This is the main section, your app content here.</Text>
                <Text>Layout used in most cases – Navbar and Header with fixed position</Text>
            </AppShell.Main>

        </AppShell>
    );
}