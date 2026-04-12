import { AppShell, Text, Center, Group, Space, Container, Stack, SimpleGrid, Card, Badge, Button } from '@mantine/core';
import { Link } from 'react-router-dom';

const promos = [
    {
        badge: 'every day 2–4pm',
        badgeColor: "#a5b4fc",
        title: 'happy roar',
        subtitle: '$1 off any cold drink',
        body: "afternoons hit different. fuel your 2pm roar with a buck off any cold drink- you've earned it and so has your wallet.",
    },
    {
        badge: 'mondays only',
        badgeColor: "#a5b4fc",
        title: 'mane-ia monday',
        subtitle: 'buy a frappe, get a pastry free',
        body: "monday doesn't stand a chance. grab any frappe and we'll throw in a free pastry. consider it our apology on behalf of the week.",
    },
    {
        badge: 'before 9am',
        badgeColor: "#a5b4fc",
        title: 'the early lion',
        subtitle: 'any hot drink for $3',
        body: "you're already up before the sun. the least we can do is make it worth it. any hot drink, any size, just $3 before 9am.",
    },
    {
        badge: 'bring a friend',
        badgeColor: "#a5b4fc",
        title: 'the pride deal',
        subtitle: '10% off for you and your crew',
        body: "lions are better in prides. roll in with a friend and you both get 10% off your order. do not ask us what happens if you bring ten friends.",
    },
    {
        badge: 'loyalty reward',
        badgeColor: "#a5b4fc",
        title: 'tenth drink on us',
        subtitle: 'your 10th drink is free, always',
        body: "we see you. we appreciate you. every 10th drink you order is completely on the house! no fine print, no tricks, just good coffee and good vibes.",
    },
    {
        badge: 'weekends',
        badgeColor: "#a5b4fc",
        title: 'wild card weekend',
        subtitle: 'mystery discount at checkout',
        body: "saturdays and sundays we spin the wheel. you could get 5% off, 20% off, or a free upgrade. it's a surprise- even we don't know until you order.",
    },
];

export default function Home() {
    return (
        <AppShell>

            {/* ── Hero / Welcome ── */}
            <Center h="calc(100vh - 120px)">
                <Text size="48pt" className="font-tiempos-headline" fw={300} component="div">
                    five locations. <br />
                    twenty drinks. <br />
                    unlimited ways to smile.<br />

                    <Space h="md" />
                    <Text size="24pt" c="dimmed" className="font-tiempos-headline">
                        come say hi today
                    </Text>

                    <Text size="24pt" c="dimmed" className="font-courier" fw={500}>
                        (@^u^)
                    </Text>
                </Text>
            </Center>

            <Group justify="center">
                <Text size="16pt" className="font-tiempos-headline" fw={300}>
                    baton rouge {"\u2022"} hammond {"\u2022"} lafayette {"\u2022"} metairie {"\u2022"} new orleans
                </Text>
            </Group>

            {/* ── View Menu Bridge ── */}
            <Center h="50vh">
                <Stack align="center" gap="lg">
                    <Text size="28pt" className="font-tiempos-headline" fw={300} ta="center">
                        curious what we're brewing?
                    </Text>
                    <Text size="13pt" className="font-tiempos-text" c="dimmed" ta="center">
                        explore our full lineup of drinks and find your new favorite.
                    </Text>
                    <Button
                        component={Link}
                        to="/menu"
                        size="lg"
                        variant="outline"
                        className="font-tiempos-text"
                        tt="lowercase"
                        style={{ letterSpacing: '0.08em', fontSize: '13pt' }}
                    >
                        view menu
                    </Button>
                </Stack>
            </Center>

            {/* ── Promos ── */}
            <Container size="lg" py="xl">
                <Stack gap="xl">
                    <Stack gap={4}>
                        <Text size="36pt" className="font-tiempos-headline" fw={300}>
                            deals worth roaring about.
                        </Text>
                        <Text size="13pt" className="font-tiempos-text" c="dimmed">
                            limited time offers, weekly specials, and a few things we do because we like you.
                        </Text>
                    </Stack>

                    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
                        {promos.map((promo) => (
                            <Card key={promo.title} radius="md" withBorder padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <Group justify="space-between" align="flex-start">
                                    <Badge color={promo.badgeColor} variant="light" size="sm" tt="lowercase" className="font-tiempos-text" fw={300} style={{ letterSpacing: '0.15em' }}>
                                        {promo.badge}
                                    </Badge>
                                </Group>
                                <Stack gap={4}>
                                    <Text size="18pt" className="font-tiempos-headline" tt="lowercase" fw={400} lh={1.2}>
                                        {promo.title}
                                    </Text>
                                    <Text size="11pt" className="font-tiempos-text" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
                                        {promo.subtitle}
                                    </Text>
                                </Stack>
                                <Text size="10.5pt" className="font-tiempos-text" c="dimmed" lh={1.6}>
                                    {promo.body}
                                </Text>
                            </Card>
                        ))}
                    </SimpleGrid>
                </Stack>

                <Space h="sm" />
                <Text size="10pt" className="font-tiempos-text" c="dimmed">* promos cannot be combined</Text>
                <Space h="sm" />
                <Text size="10pt" className="font-tiempos-text" c="dimmed">** availability varies by location</Text>
                <Space h="sm" />
                <Text size="10pt" className="font-tiempos-text" c="dimmed">*** we reserve the right to be silly and/or goofy</Text>
            </Container>

        </AppShell>
    );
}