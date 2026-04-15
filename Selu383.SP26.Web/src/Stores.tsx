import { useEffect, useState } from 'react';
import { AppShell, Container, Stack, Text, SimpleGrid, Card, Group, Badge, Loader, Center } from '@mantine/core';
import { IconMapPin, IconArmchair } from '@tabler/icons-react';
import { api, type LocationDto } from './api';

export default function Stores() {
    const [locations, setLocations] = useState<LocationDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.locations.getAll()
            .then(setLocations)
            .catch(() => setError('could not load locations'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <AppShell>
            <Container size="lg" py="xl">
                <Stack gap="xl">
                    <Stack gap={4}>
                        <Text size="36pt" className="font-tiempos-headline" fw={300}>
                            find us.
                        </Text>
                        <Text size="13pt" className="font-tiempos-text" c="dimmed">
                            visit one of our locations and say hi to your new favorite café.
                        </Text>
                    </Stack>

                    {loading && (
                        <Center py="xl">
                            <Loader size="sm" />
                        </Center>
                    )}

                    {error && (
                        <Text c="red" size="sm">{error}</Text>
                    )}

                    {!loading && !error && (
                        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
                            {locations.map((loc) => (
                                <Card key={loc.id} radius="md" withBorder padding="lg">
                                    <Stack gap="sm">
                                        <Text size="18pt" className="font-tiempos-headline" fw={400} lh={1.2}>
                                            {loc.name}
                                        </Text>
                                        <Group gap="xs" align="flex-start">
                                            <IconMapPin size={14} style={{ marginTop: 2, opacity: 0.5 }} />
                                            <Text size="12pt" className="font-tiempos-text" c="dimmed" style={{ flex: 1 }}>
                                                {loc.address}
                                            </Text>
                                        </Group>
                                        <Group gap="xs">
                                            <IconArmchair size={14} style={{ opacity: 0.5 }} />
                                            <Badge variant="light" size="sm" tt="lowercase" fw={300} style={{ letterSpacing: '0.1em' }}>
                                                {loc.tableCount} tables
                                            </Badge>
                                        </Group>
                                    </Stack>
                                </Card>
                            ))}
                        </SimpleGrid>
                    )}
                </Stack>
            </Container>
        </AppShell>
    );
}
