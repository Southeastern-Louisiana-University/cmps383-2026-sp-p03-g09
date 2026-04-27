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
    Modal,
    ActionIcon,
} from '@mantine/core';
import { IconPaw, IconQrcode } from '@tabler/icons-react';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type OrderDto, type UserDto } from './api';
import { useAuth } from './AuthContext';
import Login from './Login';

const NEXT_REWARD_INTERVAL = 250;

const DEFAULT_COLOR = '#a5b4fc';

const COLOR_OPTIONS = [
    { name: 'Mint Green', value: '#86efac' },
    { name: 'Ice Blue', value: '#7dd3fc' },
    { name: 'Soft Pink', value: '#f9a8d4' },
    { name: 'Peach', value: '#fdba74' },
];

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
    const [qrOrder, setQrOrder] = useState<OrderDto | null>(null);

    const u = (profile ?? authUser)!;

    const accentColor =
        u?.themeColor ||
        DEFAULT_COLOR;

    useEffect(() => {
        document.documentElement.style.setProperty('--accent-color', accentColor);
    }, [accentColor]);

    async function changeColor(color: string | null) {
        const newColor = color ?? DEFAULT_COLOR;

        try {
            if (authUser?.id) {
                await api.admin.updateThemeColor(authUser.id, newColor);
            }

            const updated = await api.auth.me();
            setProfile(updated);

        } catch (err) {
            console.error("Failed to save theme color:", err);
        }
    }

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
                <Loader color={accentColor} />
            </Center>
        );
    }

    if (!authUser) {
        return (
            <AppShell>
                <Container size="sm" py="xl">
                    <Stack gap="xl" align="center">
                        <Text size="32pt" fw={300} ta="center">
                            sign in to see your profile.
                        </Text>
                        <Text size="13pt" c="dimmed" ta="center">
                            track your points, tier, and order history.
                        </Text>
                        <Button
                            onClick={() => setLoginOpened(true)}
                            variant="outline"
                            color={accentColor}
                        >
                            sign in
                        </Button>
                    </Stack>

                    <Login opened={loginOpened} onClose={() => setLoginOpened(false)} />
                </Container>
            </AppShell>
        );
    }

    const pts = u.loyaltyPoints ?? 0;
    const tier = u.tier ?? 'cub';
    const toNext = pointsToNextReward(pts);
    const progress = ((NEXT_REWARD_INTERVAL - toNext) / NEXT_REWARD_INTERVAL) * 100;
    const tierColor = TIER_COLORS[tier] ?? '#9ca3af';

    return (
        <AppShell>
            <Container size="md" py="xl">
                <Stack gap="xl">

                    {/* HEADER */}
                    <Group gap="lg" align="flex-start">
                        <Avatar
                            size={72}
                            radius="xl"
                            style={{ backgroundColor: accentColor }}
                        >
                            <IconPaw size={36} />
                        </Avatar>

                        <Stack gap={4}>
                            <Text size="28pt" fw={300}>
                                {u.userName}
                            </Text>

                            <Text size="12pt" c="dimmed">
                                member since {formatDate(u.memberSince)}
                            </Text>

                            <Badge
                                color={tierColor}
                                variant="light"
                                size="lg"
                            >
                                {tier}
                            </Badge>

                            {/* 🎨 COLOR PICKER */}
                            <Group gap={6} mt={8}>
                                {COLOR_OPTIONS.map((c) => (
                                    <Button
                                        key={c.name}
                                        onClick={() => changeColor(c.value)}
                                        style={{
                                            backgroundColor: c.value,
                                            width: 22,
                                            height: 22,
                                            padding: 0,
                                            minWidth: 22,
                                        }}
                                    />
                                ))}

                                <Button
                                    onClick={() => changeColor(null)}
                                    variant="light"
                                    size="xs"
                                >
                                    default
                                </Button>
                            </Group>
                        </Stack>
                    </Group>

                    <Divider />

                    {/* POINTS */}
                    <Card withBorder radius="md" padding="lg">
                        <Stack gap="md">
                            <Group justify="space-between" align="flex-end">
                                <Stack gap={2}>
                                    <Text size="11pt" c="dimmed">
                                        paw points
                                    </Text>
                                    <Text size="32pt" fw={300} lh={1}>
                                        {pts.toLocaleString()}
                                    </Text>
                                </Stack>

                                <Button
                                    onClick={() => navigate('/rewards')}
                                    variant="light"
                                    color={accentColor}
                                    size="sm"
                                >
                                    view rewards
                                </Button>
                            </Group>

                            <Stack gap={4}>
                                <Progress
                                    value={progress}
                                    color={accentColor}
                                    size="sm"
                                    radius="xl"
                                />
                                <Text size="10.5pt" c="dimmed">
                                    {toNext} points to next reward
                                </Text>
                            </Stack>

                            <Divider />

                            <Group>
                                <Stack gap={2} style={{ flex: 1 }}>
                                    <Text size="11pt" c="dimmed">tier</Text>
                                    <Text size="13pt">{tier}</Text>
                                </Stack>

                                <Stack gap={2} style={{ flex: 1 }}>
                                    <Text size="11pt" c="dimmed">next tier</Text>
                                    <Text size="13pt">
                                        {tier === 'golden paw'
                                            ? 'you’re at the top!'
                                            : tier === 'silver paw'
                                            ? `golden paw at 1,000 pts`
                                            : `silver paw at 500 pts`}
                                    </Text>
                                </Stack>
                            </Group>
                        </Stack>
                    </Card>

                    {/* STATS */}
                    <SimpleGrid cols={2} spacing="md">
                        <Card withBorder radius="md" padding="md">
                            <Stack gap={2} align="center">
                                <Text size="28pt" fw={300}>
                                    {orders.length}
                                </Text>
                                <Text size="11pt" c="dimmed">
                                    orders placed
                                </Text>
                            </Stack>
                        </Card>

                        <Card withBorder radius="md" padding="md">
                            <Stack gap={2} align="center">
                                <Text size="28pt" fw={300}>
                                    {orders.reduce((sum, o) => sum + o.pointsEarned, 0)}
                                </Text>
                                <Text size="11pt" c="dimmed">
                                    total points earned
                                </Text>
                            </Stack>
                        </Card>
                    </SimpleGrid>

                    {/* RECENT ORDERS */}
                    <Stack gap="md">
                        <Text size="24pt" fw={300}>
                            recent orders.
                        </Text>

                        {orders.length === 0 ? (
                            <Text size="13pt" c="dimmed">
                                no orders yet — head to the menu and place your first one.
                            </Text>
                        ) : (
                            orders.slice(0, 5).map(order => (
                                <Card key={order.id} withBorder radius="md" padding="md">
                                    <Group justify="space-between" align="flex-start">
                                        <Stack gap={2} style={{ flex: 1 }}>
                                            <Text size="13pt" fw={500}>
                                                {order.items.map(i => i.menuItemName).join(', ')}
                                            </Text>
                                            <Text size="10.5pt" c="dimmed">
                                                {order.locationName} · {new Date(order.createdAt).toLocaleDateString()}
                                            </Text>
                                        </Stack>

                                        <Group gap="sm">
                                            <Stack gap={2} align="flex-end">
                                                <Text size="13pt" fw={600}>
                                                    ${order.total.toFixed(2)}
                                                </Text>
                                                {order.pointsEarned > 0 && (
                                                    <Badge color={accentColor} variant="light" size="sm">
                                                        +{order.pointsEarned} pts
                                                    </Badge>
                                                )}
                                            </Stack>

                                            <ActionIcon
                                                variant="subtle"
                                                color={accentColor}
                                                size="lg"
                                                onClick={() => setQrOrder(order)}
                                            >
                                                <IconQrcode size={20} />
                                            </ActionIcon>
                                        </Group>
                                    </Group>
                                </Card>
                            ))
                        )}
                    </Stack>
                </Stack>
            </Container>

            <Modal
                opened={!!qrOrder}
                onClose={() => setQrOrder(null)}
                centered
                size="xs"
                title={`order #${qrOrder?.id}`}
            >
                {qrOrder && (
                    <Stack align="center" gap="md" pb="sm">
                        <Text size="11pt" c="dimmed" ta="center">
                            show this at the pickup window or drive-thru.
                        </Text>

                        <QRCodeSVG
                            value={`order:${qrOrder.id}`}
                            size={180}
                            bgColor="transparent"
                            fgColor="currentColor"
                        />

                        <Text size="10pt" c="dimmed">
                            {qrOrder.items.map(i => i.menuItemName).join(', ')}
                        </Text>
                    </Stack>
                )}
            </Modal>
        </AppShell>
    );
}