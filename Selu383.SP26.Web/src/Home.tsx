import { AppShell, Text, Center, Group, Space } from '@mantine/core';

export default function Home() {
    return (
        <AppShell>
                <Center h="calc(100vh - 120px)">
                    <Text size="48pt" className="font-tiempos-headline" fw={300} component="div">
                        five locations. <br></br>
                        twenty drinks. <br></br>
                        unlimited ways to smile.<br></br>

                        <Space h="md"/>
                    <Text size="24pt" c="dimmed" className="font-tiempos-headline">
                        come say hi today
                    </Text>

                    <Text size="24pt" c="dimmed" className="font-consolas" fw={500}>
                    (@^u^)
                    </Text>
                </Text>
            </Center>

            <Group justify="center">
                <Text size="16pt" className="font-tiempos-headline" fw={300}>
                    baton rouge {"\u2022"} hammond {"\u2022"} lafayette {"\u2022"} metairie {"\u2022"} new orleans
                </Text>
            </Group>

        </AppShell>
    );
}