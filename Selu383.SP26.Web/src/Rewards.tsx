import {
    AppShell,
    Container,
    Text,
    Stack,
    Group,
    Badge,
    Progress,
    Card,
    Button,
    SimpleGrid,
    Loader,
    Center,
    Divider,
    Modal,
} from '@mantine/core';
import { IconCoffee, IconToolsKitchen2 } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { api, type RewardDto, type UserDto } from './api';
import { useAuth } from './AuthContext';
import Login from './Login';

const NEXT_REWARD_INTERVAL = 250;

const TIER_COLORS: Record<string, string> = {
    'cub': '#9ca3af',
    'silver paw': '#94a3b8',
    'golden paw': '#f59e0b',
};

function pointsToNextReward(points: number): number {
    return NEXT_REWARD_INTERVAL - (points % NEXT_REWARD_INTERVAL);
}

export default function Rewards() {
    const { user: authUser, loading: authLoading } = useAuth();
    const [loginOpened, setLoginOpened] = useState(false);

    const [rewards, setRewards] = useState<RewardDto[]>([]);
    const [profile, setProfile] = useState<UserDto | null>(null);
    const [loading, setLoading] = useState(true);

    const [confirmReward, setConfirmReward] = useState<RewardDto | null>(null);
    const [redeeming, setRedeeming] = useState(false);
    const [redeemError, setRedeemError] = useState<string | null>(null);
    const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);

    useEffect(() => {
        const tasks: Promise<void>[] = [
            api.rewards.getAll().then(setRewards).catch(() => {})
        ];
        if (!authLoading && authUser) {
            tasks.push(
                api.auth.me().then(setProfile).catch(() => {})
            );
        }
        Promise.all(tasks).finally(() => setLoading(false));
    }, [authUser, authLoading]);

    const pts = profile?.loyaltyPoints ?? authUser?.loyaltyPoints ?? 0;
    const tier = profile?.tier ?? authUser?.tier ?? 'cub';
    const toNext = pointsToNextReward(pts);
    const progress = ((NEXT_REWARD_INTERVAL - toNext) / NEXT_REWARD_INTERVAL) * 100;
    const tierColor = TIER_COLORS[tier] ?? '#9ca3af';

    const handleRedeem = async () => {
        if (!confirmReward) return;
        setRedeeming(true);
        setRedeemError(null);
        try {
            const updatedUser = await api.rewards.redeem(confirmReward.id);
            setProfile(updatedUser);
            setRedeemSuccess(`redeemed! check your profile for the QR code to show at the pickup window — enjoy your ${confirmReward.name}.`);
            setConfirmReward(null);
        } catch {
            setRedeemError('could not redeem reward. please try again.');
        } finally {
            setRedeeming(false);
        }
    };

    if (authLoading || loading) {
        return (
            <Center h="50vh">
                <Loader color="#a5b4fc" />
            </Center>
        );
    }

    return (
        <AppShell>
            <Container size="md" py="xl">
                <Stack gap="xl">
                    <Stack gap={4}>
                        <Text size="36pt" className="font-tiempos-headline" fw={300}>
                            rewards.
                        </Text>
                        <Text size="13pt" c="dimmed" className="font-tiempos-text">
                            earn points with every order. redeem them for free stuff.
                        </Text>
                    </Stack>

                    {/* Points summary (only when logged in) */}
                    {authUser && (
                        <Card withBorder radius="md" padding="lg">
                            <Stack gap="md">
                                <Group justify="space-between" align="flex-end">
                                    <Stack gap={2}>
                                        <Text size="11pt" c="dimmed" tt="uppercase" style={{ letterSpacing: '0.08em' }}>
                                            your points
                                        </Text>
                                        <Group gap="sm" align="flex-end">
                                            <Text size="36pt" className="font-tiempos-headline" fw={300} lh={1}>
                                                {pts.toLocaleString()}
                                            </Text>
                                            <Badge
                                                color={tierColor}
                                                variant="light"
                                                size="lg"
                                                tt="lowercase"
                                                className="font-tiempos-text"
                                                mb={4}
                                            >
                                                {tier}
                                            </Badge>
                                        </Group>
                                    </Stack>
                                </Group>

                                <Stack gap={4}>
                                    <Progress value={progress} color="#a5b4fc" size="sm" radius="xl" />
                                    <Text size="10.5pt" c="dimmed" className="font-tiempos-text">
                                        {toNext} points to next reward
                                    </Text>
                                </Stack>
                            </Stack>
                        </Card>
                    )}

                    {!authUser && (
                        <Card withBorder radius="md" padding="lg" style={{ background: 'transparent' }}>
                            <Stack gap="sm" align="center">
                                <Text size="14pt" className="font-tiempos-headline" fw={300} ta="center">
                                    sign in to see your points and redeem rewards.
                                </Text>
                                <Button
                                    onClick={() => setLoginOpened(true)}
                                    variant="light"
                                    color="#a5b4fc"
                                    className="font-tiempos-text"
                                    tt="lowercase"
                                    size="sm"
                                >
                                    sign in
                                </Button>
                            </Stack>
                        </Card>
                    )}

                    {redeemSuccess && (
                        <Card withBorder radius="md" padding="md" style={{ borderColor: '#a5b4fc' }}>
                            <Text size="12pt" className="font-tiempos-text" ta="center">
                                🎉 {redeemSuccess}
                            </Text>
                        </Card>
                    )}

                    <Divider />

                    {/* Rewards catalog */}
                    <Stack gap="md">
                        <Text size="24pt" className="font-tiempos-headline" fw={300}>
                            available rewards.
                        </Text>

                        <Text size="11pt" c="dimmed" className="font-tiempos-text">
                            earn 5 points per item ordered. every {NEXT_REWARD_INTERVAL} points unlocks a new reward.
                        </Text>

                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                            {rewards.map(reward => {
                                const canRedeem = authUser && pts >= reward.pointCost;
                                return (
                                    <Card key={reward.id} withBorder radius="md" padding="lg">
                                        <Stack gap="sm">
                                            <Group justify="space-between" align="flex-start">
                                                {reward.category === 'drink'
                                                    ? <IconCoffee size={20} color="#a5b4fc" />
                                                    : <IconToolsKitchen2 size={20} color="#a5b4fc" />
                                                }
                                                <Badge
                                                    color={canRedeem ? '#a5b4fc' : 'gray'}
                                                    variant="light"
                                                    size="sm"
                                                    className="font-tiempos-text"
                                                >
                                                    {reward.pointCost} pts
                                                </Badge>
                                            </Group>

                                            <Stack gap={2}>
                                                <Text size="16pt" className="font-tiempos-headline" fw={400} lh={1.2}>
                                                    {reward.name}
                                                </Text>
                                                <Text size="10.5pt" c="dimmed" className="font-tiempos-text" lh={1.6}>
                                                    {reward.description}
                                                </Text>
                                            </Stack>

                                            {authUser ? (
                                                <Button
                                                    onClick={() => {
                                                        setRedeemSuccess(null);
                                                        setRedeemError(null);
                                                        setConfirmReward(reward);
                                                    }}
                                                    disabled={!canRedeem}
                                                    variant={canRedeem ? 'light' : 'default'}
                                                    color="#a5b4fc"
                                                    size="sm"
                                                    className="font-tiempos-text"
                                                    tt="lowercase"
                                                    fullWidth
                                                >
                                                    {canRedeem ? 'redeem' : `need ${reward.pointCost - pts} more pts`}
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={() => setLoginOpened(true)}
                                                    variant="default"
                                                    size="sm"
                                                    className="font-tiempos-text"
                                                    tt="lowercase"
                                                    fullWidth
                                                >
                                                    sign in to redeem
                                                </Button>
                                            )}
                                        </Stack>
                                    </Card>
                                );
                            })}
                        </SimpleGrid>
                    </Stack>

                    {/* Tier info */}
                    <Divider />
                    <Stack gap="md">
                        <Text size="24pt" className="font-tiempos-headline" fw={300}>
                            tiers.
                        </Text>
                        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                            {[
                                { name: 'cub', range: '0 – 499 pts', color: '#9ca3af', perks: 'welcome to the pride. earn 5 pts per item.' },
                                { name: 'silver paw', range: '500 – 999 pts', color: '#94a3b8', perks: 'keep coming back. you\'re on your way.' },
                                { name: 'golden paw', range: '1,000+ pts', color: '#f59e0b', perks: 'top of the pride. you\'re a legend around here.' },
                            ].map(t => (
                                <Card key={t.name} withBorder radius="md" padding="md">
                                    <Stack gap="xs">
                                        <Badge color={t.color} variant="light" tt="lowercase" className="font-tiempos-text" size="lg">
                                            {t.name}
                                        </Badge>
                                        <Text size="11pt" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
                                            {t.range}
                                        </Text>
                                        <Text size="10.5pt" c="dimmed" className="font-tiempos-text" lh={1.6}>
                                            {t.perks}
                                        </Text>
                                    </Stack>
                                </Card>
                            ))}
                        </SimpleGrid>
                    </Stack>
                </Stack>
            </Container>

            {/* Redeem confirmation modal */}
            <Modal
                opened={!!confirmReward}
                onClose={() => setConfirmReward(null)}
                centered
                size="sm"
                title={
                    <Text size="16pt" className="font-tiempos-headline" fw={400}>
                        redeem reward?
                    </Text>
                }
            >
                {confirmReward && (
                    <Stack gap="md">
                        <Text size="13pt" className="font-tiempos-text">
                            redeem <strong>{confirmReward.name}</strong> for {confirmReward.pointCost} points?
                        </Text>
                        <Text size="11pt" c="dimmed" className="font-tiempos-text">
                            this will deduct {confirmReward.pointCost} points from your balance.
                            show the confirmation screen to the barista.
                        </Text>

                        {redeemError && (
                            <Text size="11pt" c="red">{redeemError}</Text>
                        )}

                        <Group grow>
                            <Button
                                onClick={handleRedeem}
                                loading={redeeming}
                                color="#a5b4fc"
                                className="font-tiempos-text"
                                tt="lowercase"
                            >
                                confirm redeem
                            </Button>
                            <Button
                                variant="light"
                                color="gray"
                                onClick={() => setConfirmReward(null)}
                                className="font-tiempos-text"
                                tt="lowercase"
                            >
                                cancel
                            </Button>
                        </Group>
                    </Stack>
                )}
            </Modal>

            <Login opened={loginOpened} onClose={() => setLoginOpened(false)} />
        </AppShell>
    );
}
