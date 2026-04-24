import { Container, Text, Stack, Group, Button, Grid, Box, Badge, Loader, Center } from '@mantine/core';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api, type MenuItemDto } from './api';
import { MENU_PHOTOS } from './menuPhotos';


function FeaturedCard({ item }: { item: MenuItemDto }) {
    const navigate = useNavigate();
    const photo = item.imageUrl ?? MENU_PHOTOS[item.name];
    const price = item.hasSizes
        ? `from $${(item.smallPrice ?? item.basePrice).toFixed(2)}`
        : `$${item.basePrice.toFixed(2)}`;

    return (
        <Box
            onClick={() => navigate('/menu')}
            style={{
                position: 'relative',
                aspectRatio: '3 / 4',
                borderRadius: 12,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 300ms ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
            {photo ? (
                <img
                    src={photo}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
            ) : (
                <Box style={{ width: '100%', height: '100%', background: '#1c1c2e' }} />
            )}

            {/* gradient overlay */}
            <Box style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.1) 45%, transparent 70%)',
            }} />

            {/* text */}
            <Box style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 }}>
                <Badge
                    size="xs"
                    variant="light"
                    color="#a5b4fc"
                    mb={6}
                    tt="lowercase"
                    style={{ backdropFilter: 'blur(6px)', background: 'rgba(165,180,252,0.18)' }}
                >
                    {item.category}
                </Badge>
                <Text
                    size="15pt"
                    fw={500}
                    c="white"
                    className="font-tiempos-headline"
                    lh={1.2}
                >
                    {item.name}
                </Text>
                <Text size="11pt" c="rgba(255,255,255,0.65)" mt={3} className="font-tiempos-text">
                    {price}
                </Text>
            </Box>
        </Box>
    );
}

export default function Home() {
    const [featured, setFeatured] = useState<MenuItemDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.menuItems.getFeatured()
            .then(setFeatured)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div style={{ position: 'relative', minHeight: 'calc(100vh - 60px)' }}>

            {/* Fixed animated blob background */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                <div className="hero-blob hero-blob-1" />
                <div className="hero-blob hero-blob-2" />
                <div className="hero-blob hero-blob-3" />
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
                <Container size="lg" py="xl">
                    <Stack gap={64}>

                        {/* ── Intro ── */}
                        <Stack gap="lg" pt="xl">
                            <Text
                                className="font-tiempos-text"
                                style={{ fontSize: '10.5pt', letterSpacing: '0.2em', opacity: 0.42, textTransform: 'lowercase' }}
                            >
                                specialty coffee&nbsp;&nbsp;·&nbsp;&nbsp;hammond, la&nbsp;&nbsp;·&nbsp;&nbsp;new orleans, la&nbsp;&nbsp;·&nbsp;&nbsp;new york, ny
                            </Text>
                            <Text
                                className="font-tiempos-headline"
                                fw={300}
                                style={{ fontSize: 'clamp(38px, 5vw, 68px)', lineHeight: 1.07, letterSpacing: '-0.015em' }}
                            >
                                coffee, crepes,<br />and company.
                            </Text>
                            <Text
                                className="font-tiempos-text"
                                style={{ fontSize: '15pt', opacity: 0.5, maxWidth: 480 }}
                            >
                                three locations. one menu worth coming back to.
                            </Text>
                            <Group gap="sm">
                                <Button
                                    component={Link}
                                    to="/menu"
                                    size="lg"
                                    color="#a5b4fc"
                                    className="font-tiempos-text"
                                    tt="lowercase"
                                    style={{ letterSpacing: '0.06em', borderRadius: 12 }}
                                >
                                    explore menu
                                </Button>
                                <Button
                                    component={Link}
                                    to="/rewards"
                                    size="lg"
                                    variant="subtle"
                                    color="#a5b4fc"
                                    className="font-tiempos-text"
                                    tt="lowercase"
                                    style={{ letterSpacing: '0.06em' }}
                                >
                                    our rewards
                                </Button>
                            </Group>
                        </Stack>

                        {/* ── Featured ── */}
                        <Stack gap="lg" pb="xl">
                            <Group justify="space-between" align="baseline">
                                <Text size="28pt" className="font-tiempos-headline" fw={300}>
                                    featured.
                                </Text>
                                <Button
                                    component={Link}
                                    to="/menu"
                                    variant="subtle"
                                    color="#a5b4fc"
                                    size="sm"
                                    tt="lowercase"
                                    className="font-tiempos-text"
                                    style={{ letterSpacing: '0.04em' }}
                                >
                                    see all →
                                </Button>
                            </Group>

                            {loading ? (
                                <Center py={60}><Loader color="#a5b4fc" /></Center>
                            ) : (
                                <Grid gutter="md">
                                    {featured.map(item => (
                                        <Grid.Col key={item.id} span={{ base: 12, sm: 6, md: 4 }}>
                                            <FeaturedCard item={item} />
                                        </Grid.Col>
                                    ))}
                                </Grid>
                            )}
                        </Stack>

                    </Stack>
                </Container>
            </div>
        </div>
    );
}
