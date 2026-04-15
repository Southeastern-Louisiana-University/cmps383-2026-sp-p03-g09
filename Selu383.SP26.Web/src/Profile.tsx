import {
    AppShell,
    Container,
    Text,
    Stack,
    Group,
    Badge,
    Progress,
    Card,
    SimpleGrid,
    Loader,
    Center,
    Button,
    Divider,
    Avatar,
} from '@mantine/core';
import { IconPaw } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, OrderDto, UserDto } from './api';
import { useAuth } from './AuthContext';
import Login from './Login';

const NEXT_REWARD_INTERVAL = 250; // points needed per reward

const TIER_COLORS: Record<string, string> = {
    'cub': '#9ca3af',
    'silver paw': '#94a3b8',
    'golden paw': '#f59e0b',
};

function pointsToNextReward(points: number): number {
    return NEXT_REWARD_INTERVAL - (points % NEXT_REWARD_INTERVAL);
}

function formatDate(iso: string | null | undefined): string {
    if (!iso) return 'member';
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export default function Profile() {
    const { user: authUser, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [loginOpened, setLoginOpened] = useState(false);
    const [profile, setProfile] = useState<UserDto | null>(null);
    const [orders, setOrders] = useState<OrderDto[]>([]);
    const [loadingProfile, setLoadingProfile] = useState(true);

    useEffect(() => {
        if (!authLoading && authUser) {
            Promise.all([
                api.auth.me(),
                api.orders.getAll(),
            ])
                .then(([me, myOrders]) => {
                    setProfile(me);
                    setOrders(myOrders);
                })
                .catch(() => {})
                .finally(() => setLoadingProfile(false));
        } else if (!authLoading) {
            setLoadingProfile(false);
        }
    }, [authUser, authLoading]);

    if (authLoading || loadingProfile) {
        return (
            <Center h="50vh">
                <Loader color="#a5b4fc" />
            </Center>
        );
    }

    if (!authUser) {
        return (
            <AppShell>
                <Container size="sm" py="xl">
                    <Stack gap="xl" align="center">
                        <Text size="32pt" className="font-tiempos-headline" fw={300} ta="center">
                            sign in to see your profile.
                        </Text>
                        <Text size="13pt" c="dimmed" className="font-tiempos-text" ta="center">
                            track your points, tier, and order history.
                        </Text>
                        <Button
                            onClick={() => setLoginOpened(true)}
                            variant="outline"
                            color="#a5b4fc"
                            className="font-tiempos-text"
                            tt="lowercase"
                        >
                            sign in
                        </Button>
                    </Stack>
                    <Login opened={loginOpened} onClose={() => setLoginOpened(false)} />
                </Container>
            </AppShell>
        );
    }

    const u = profile ?? authUser;
    const pts = u.loyaltyPoints ?? 0;
    const tier = u.tier ?? 'cub';
    const toNext = pointsToNextReward(pts);
    const progress = ((NEXT_REWARD_INTERVAL - toNext) / NEXT_REWARD_INTERVAL) * 100;
    const tierColor = TIER_COLORS[tier] ?? '#9ca3af';

    return (
        <AppShell>
            <Container size="md" py="xl">
                <Stack gap="xl">
                    {/* Header */}
                    <Group gap="lg" align="flex-start">
                        <Avatar size={72} radius="xl" color="#a5b4fc">
                            <IconPaw size={36} />
                        </Avatar>
                        <Stack gap={4}>
                            <Text size="28pt" className="font-tiempos-headline" fw={300}>
                                {u.userName}
                            </Text>
                            <Text size="12pt" c="dimmed" className="font-tiempos-text">
                                member since {formatDate(u.memberSince)}
                            </Text>
                            <Badge
                                color={tierColor}
                                variant="light"
                                size="lg"
                                tt="lowercase"
                                className="font-tiempos-text"
                                style={{ letterSpacing: '0.1em' }}
                            >
                                {tier}
                            </Badge>
                        </Stack>
                    </Group>

                    <Divider />

                    {/* Points card */}
                    <Card withBorder radius="md" padding="lg">
                        <Stack gap="md">
                            <Group justify="space-between" align="flex-end">
                                <Stack gap={2}>
                                    <Text size="11pt" c="dimmed" tt="uppercase" style={{ letterSpacing: '0.08em' }}>
                                        paw points
                                    </Text>
                                    <Text size="32pt" className="font-tiempos-headline" fw={300} lh={1}>
                                        {pts.toLocaleString()}
                                    </Text>
                                </Stack>
                                <Button
                                    onClick={() => navigate('/rewards')}
                                    variant="light"
                                    color="#a5b4fc"
                                    className="font-tiempos-text"
                                    tt="lowercase"
                                    size="sm"
                                >
                                    view rewards
                                </Button>
                            </Group>

                            <Stack gap={4}>
                                <Progress
                                    value={progress}
                                    color="#a5b4fc"
                                    size="sm"
                                    radius="xl"
                                />
                                <Text size="10.5pt" c="dimmed" className="font-tiempos-text">
                                    {toNext} points to next reward
                                </Text>
                            </Stack>

                            <Divider />

                            <Group>
                                <Stack gap={2} style={{ flex: 1 }}>
                                    <Text size="11pt" c="dimmed" tt="uppercase" style={{ letterSpacing: '0.08em' }}>tier</Text>
                                    <Text size="13pt" className="font-tiempos-text">{tier}</Text>
                                </Stack>
                                <Stack gap={2} style={{ flex: 1 }}>
                                    <Text size="11pt" c="dimmed" tt="uppercase" style={{ letterSpacing: '0.08em' }}>next tier</Text>
                                    <Text size="13pt" className="font-tiempos-text">
                                        {tier === 'golden paw'
                                            ? 'you\'re at the top!'
                                            : tier === 'silver paw'
                                            ? `golden paw at 1,000 pts`
                                            : `silver paw at 500 pts`}
                                    </Text>
                                </Stack>
                            </Group>
                        </Stack>
                    </Card>

                    {/* Stats */}
                    <SimpleGrid cols={2} spacing="md">
                        <Card withBorder radius="md" padding="md">
                            <Stack gap={2} align="center">
                                <Text size="28pt" className="font-tiempos-headline" fw={300}>
                                    {orders.length}
                                </Text>
                                <Text size="11pt" c="dimmed" tt="uppercase" style={{ letterSpacing: '0.08em' }}>
                                    orders placed
                                </Text>
                            </Stack>
                        </Card>
                        <Card withBorder radius="md" padding="md">
                            <Stack gap={2} align="center">
                                <Text size="28pt" className="font-tiempos-headline" fw={300}>
                                    {orders.reduce((sum, o) => sum + o.pointsEarned, 0)}
                                </Text>
                                <Text size="11pt" c="dimmed" tt="uppercase" style={{ letterSpacing: '0.08em' }}>
                                    total points earned
                                </Text>
                            </Stack>
                        </Card>
                    </SimpleGrid>

                    {/* Recent orders */}
                    <Stack gap="md">
                        <Text size="24pt" className="font-tiempos-headline" fw={300}>
                            recent orders.
                        </Text>

                        {orders.length === 0 ? (
                            <Text size="13pt" c="dimmed" className="font-tiempos-text">
                                no orders yet — head to the menu and place your first one.
                            </Text>
                        ) : (
                            orders.slice(0, 5).map(order => (
                                <Card key={order.id} withBorder radius="md" padding="md">
                                    <Group justify="space-between" align="flex-start">
                                        <Stack gap={2}>
                                            <Text size="13pt" fw={500} className="font-tiempos-headline">
                                                {order.items.map(i => i.menuItemName).join(', ')}
                                            </Text>
                                            <Text size="10.5pt" c="dimmed" className="font-tiempos-text">
                                                {order.locationName}
                                                {' · '}
                                                {new Date(order.createdAt).toLocaleDateString(undefined, {
                                                    month: 'short', day: 'numeric'
                                                })}
                                            </Text>
                                        </Stack>
                                        <Stack gap={2} align="flex-end">
                                            <Text size="13pt" fw={600}>${order.total.toFixed(2)}</Text>
                                            {order.pointsEarned > 0 && (
                                                <Badge color="#a5b4fc" variant="light" size="sm">
                                                    +{order.pointsEarned} pts
                                                </Badge>
                                            )}
                                        </Stack>
                                    </Group>
                                </Card>
                            ))
                        )}
                    </Stack>
                </Stack>
            </Container>
        </AppShell>
    );
}
