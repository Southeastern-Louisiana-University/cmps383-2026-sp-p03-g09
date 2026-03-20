import { AppShell, Text, Group, Button, Stack, Tabs, Container } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
export default function Menu() {
    const [opened, { toggle }] = useDisclosure();

    return (
        <AppShell>

            <AppShell.Main>
                <Text>This is the main section, your app content here.</Text>
                <Text>Layout used in most cases – Navbar and Header with fixed position</Text>
            </AppShell.Main>
        </AppShell>
    );
}