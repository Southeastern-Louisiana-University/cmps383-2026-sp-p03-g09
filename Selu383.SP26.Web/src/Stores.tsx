import { useEffect, useState, useCallback } from 'react';
import { AppShell, Container, Stack, Text, Group, Badge, Loader, Center, Slider, Box, Card } from '@mantine/core';
import { IconMapPin, IconClock } from '@tabler/icons-react';
import { api, type LocationDto } from './api';

function formatHour(h: number): string {
    if (h === 0)  return '12 AM';
    if (h < 12)   return `${h} AM`;
    if (h === 12) return '12 PM';
    return `${h - 12} PM`;
}

function hoursLabel(open: number | null, close: number | null): string {
    if (open == null || close == null) return 'hours vary';
    return `${formatHour(open)} – ${formatHour(close)}`;
}

type TableGridProps = {
    tableCount: number;
    availableTables: number[] | null;
    closed: boolean;
};

function TableGrid({ tableCount, availableTables, closed }: TableGridProps) {
    return (
        <Box
            style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 5,
                alignContent: 'flex-start',
            }}
        >
            {Array.from({ length: tableCount }, (_, i) => i + 1).map(n => {
                let color = '#555';
                if (closed) {
                    color = 'rgba(120,120,120,0.25)';
                } else if (availableTables == null) {
                    color = 'rgba(165,180,252,0.25)';
                } else if (availableTables.includes(n)) {
                    color = '#4ade80';
                } else {
                    color = '#f87171';
                }

                return (
                    <Box
                        key={n}
                        title={closed ? 'closed' : availableTables == null ? 'loading…' : availableTables.includes(n) ? `table ${n} — available` : `table ${n} — reserved`}
                        style={{
                            width: 10,
                            height: 10,
                            borderRadius: 3,
                            background: color,
                            transition: 'background 300ms ease',
                        }}
                    />
                );
            })}
        </Box>
    );
}

type LocationCardProps = {
    loc: LocationDto;
    availableTables: number[] | null;
    loading: boolean;
    closed: boolean;
};

function LocationCard({ loc, availableTables, loading, closed }: LocationCardProps) {
    const availableCount = availableTables?.length ?? null;
    const shortName = loc.name.replace('Caffeinated Lions – ', '');

    return (
        <Card withBorder padding="lg" radius="md">
            <Group justify="space-between" align="flex-start" wrap="nowrap" gap="xl">
                {/* Left: info */}
                <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
                    <Group gap="sm" align="center">
                        <Text size="22pt" className="font-tiempos-headline" fw={300} lh={1.1}>
                            {shortName}
                        </Text>
                        {closed ? (
                            <Badge variant="light" color="gray" size="sm" tt="lowercase" fw={400}>
                                closed
                            </Badge>
                        ) : availableTables != null && (
                            <Badge
                                variant="light"
                                color={availableCount === 0 ? 'red' : 'green'}
                                size="sm"
                                tt="lowercase"
                                fw={400}
                            >
                                {availableCount === 0 ? 'full' : `${availableCount} open`}
                            </Badge>
                        )}
                    </Group>

                    <Group gap={6} align="flex-start">
                        <IconMapPin size={13} style={{ marginTop: 3, opacity: 0.45, flexShrink: 0 }} />
                        <Text size="11pt" className="font-tiempos-text" c="dimmed">
                            {loc.address}
                        </Text>
                    </Group>

                    <Group gap={6} align="center">
                        <IconClock size={13} style={{ opacity: 0.45, flexShrink: 0 }} />
                        <Text size="11pt" className="font-tiempos-text" c="dimmed">
                            {hoursLabel(loc.openHour, loc.closeHour)}
                        </Text>
                    </Group>
                </Stack>

                {/* Right: table grid */}
                <Stack gap={6} align="flex-end" style={{ flexShrink: 0 }}>
                    <Text size="9pt" c="dimmed" style={{ letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.5 }}>
                        {loc.tableCount} tables
                    </Text>
                    {loading ? (
                        <Loader size="xs" color="#a5b4fc" />
                    ) : (
                        <TableGrid
                            tableCount={loc.tableCount}
                            availableTables={availableTables}
                            closed={closed}
                        />
                    )}
                </Stack>
            </Group>
        </Card>
    );
}

export default function Stores() {
    const [locations, setLocations] = useState<LocationDto[]>([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState('');

    const [sliderHour, setSliderHour] = useState(() => {
        const now = new Date();
        return Math.min(Math.max(now.getHours(), 6), 22);
    });
    const [committedHour, setCommittedHour] = useState(sliderHour);

    type AvailMap = Record<number, number[] | null>;
    const [availMap, setAvailMap] = useState<AvailMap>({});
    const [tablesLoading, setTablesLoading] = useState(false);

    useEffect(() => {
        api.locations.getAll()
            .then(locs => {
                setLocations(locs);
                setPageLoading(false);
            })
            .catch(() => {
                setError('could not load locations');
                setPageLoading(false);
            });
    }, []);

    const fetchAvailability = useCallback(async (hour: number, locs: LocationDto[]) => {
        if (locs.length === 0) return;
        setTablesLoading(true);

        const today = new Date();
        today.setHours(hour, 0, 0, 0);
        const timeStr = today.toISOString();

        const results = await Promise.allSettled(
            locs.map(loc => api.locations.getAvailableTables(loc.id, timeStr))
        );

        const newMap: AvailMap = {};
        results.forEach((r, i) => {
            newMap[locs[i].id] = r.status === 'fulfilled' ? r.value : null;
        });

        setAvailMap(newMap);
        setTablesLoading(false);
    }, []);

    useEffect(() => {
        if (locations.length > 0) {
            fetchAvailability(committedHour, locations);
        }
    }, [committedHour, locations, fetchAvailability]);

    function isLocationClosed(loc: LocationDto, hour: number): boolean {
        if (loc.openHour == null || loc.closeHour == null) return false;
        return hour < loc.openHour || hour >= loc.closeHour;
    }

    const sliderMarks = [6, 8, 10, 12, 14, 16, 18, 20, 22].map(h => ({
        value: h,
        label: formatHour(h),
    }));

    return (
        <AppShell>
            <Container size="lg" py="xl">
                <Stack gap={40}>
                    <Stack gap={4}>
                        <Text size="36pt" className="font-tiempos-headline" fw={300}>
                            find us.
                        </Text>
                        <Text size="13pt" className="font-tiempos-text" c="dimmed">
                            visit one of our locations and say hi to your new favorite café.
                        </Text>
                    </Stack>

                    {/* Time slider */}
                    {!pageLoading && !error && (
                        <Stack gap={12}>
                            <Group gap="xs" align="center">
                                <IconClock size={14} style={{ opacity: 0.5 }} />
                                <Text size="11pt" c="dimmed" className="font-tiempos-text" style={{ letterSpacing: '0.06em' }}>
                                    checking availability at&nbsp;
                                    <span style={{ color: '#a5b4fc', fontWeight: 500 }}>
                                        {formatHour(sliderHour)}
                                    </span>
                                </Text>
                            </Group>
                            <Slider
                                min={6}
                                max={23}
                                step={1}
                                value={sliderHour}
                                onChange={setSliderHour}
                                onChangeEnd={setCommittedHour}
                                color="#a5b4fc"
                                marks={sliderMarks}
                                size="sm"
                                style={{ marginBottom: 28 }}
                                styles={{
                                    markLabel: {
                                        fontSize: '8pt',
                                        color: 'var(--mantine-color-dimmed)',
                                        marginTop: 4,
                                    },
                                }}
                            />
                        </Stack>
                    )}

                    {pageLoading && (
                        <Center py="xl">
                            <Loader size="sm" color="#a5b4fc" />
                        </Center>
                    )}

                    {error && (
                        <Text c="red" size="sm">{error}</Text>
                    )}

                    {!pageLoading && !error && (
                        <Stack gap="md">
                            {locations.map(loc => {
                                const closed = isLocationClosed(loc, sliderHour);
                                return (
                                    <LocationCard
                                        key={loc.id}
                                        loc={loc}
                                        availableTables={closed ? null : (availMap[loc.id] ?? null)}
                                        loading={!closed && tablesLoading}
                                        closed={closed}
                                    />
                                );
                            })}
                        </Stack>
                    )}

                    {/* Legend */}
                    {!pageLoading && !error && (
                        <Group gap="lg">
                            <Group gap={6}>
                                <Box style={{ width: 10, height: 10, borderRadius: 3, background: '#4ade80' }} />
                                <Text size="10pt" c="dimmed" className="font-tiempos-text">available</Text>
                            </Group>
                            <Group gap={6}>
                                <Box style={{ width: 10, height: 10, borderRadius: 3, background: '#f87171' }} />
                                <Text size="10pt" c="dimmed" className="font-tiempos-text">reserved</Text>
                            </Group>
                            <Group gap={6}>
                                <Box style={{ width: 10, height: 10, borderRadius: 3, background: 'rgba(120,120,120,0.25)' }} />
                                <Text size="10pt" c="dimmed" className="font-tiempos-text">closed</Text>
                            </Group>
                        </Group>
                    )}
                </Stack>
            </Container>
        </AppShell>
    );
}
