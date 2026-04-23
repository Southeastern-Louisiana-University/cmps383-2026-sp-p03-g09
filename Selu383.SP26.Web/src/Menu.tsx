import {
    AppShell,
    Text,
    Stack,
    Container,
    Grid,
    Box,
    Modal,
    Button,
    Group,
    Checkbox,
    SegmentedControl,
    Loader,
    Center,
    Divider,
} from '@mantine/core';
import { useState, useEffect } from 'react';
import { api, type MenuItemDto } from './api';
import { useCart } from './CartContext';

import icedLatteImg from './assets/photos/iced latte.png';
import supernovaImg from './assets/photos/supernova.png';
import roaringFrappeImg from './assets/photos/roaring frappe.png';
import blackWhiteColdBrewImg from './assets/photos/black and white cold brew.png';
import strawberryLimeadeImg from './assets/photos/strawberry limeade.png';
import shakenLemonadeImg from './assets/photos/shaken lemonade.png';
import manninoCrepeImg from './assets/photos/mannino crepe.png';
import downtownerImg from './assets/photos/downtowner.png';
import funkyMonkeyImg from './assets/photos/funky monkey.png';
import leSmoresImg from './assets/photos/le smores.png';
import strawberryFieldsImg from './assets/photos/strawberry fields.png';
import bonjourImg from './assets/photos/bonjour.png';
import bananasFosterImg from './assets/photos/bananas foster.png';

const MENU_PHOTOS: Record<string, string> = {
    'iced latte': icedLatteImg,
    'supernova': supernovaImg,
    'roaring frappe': roaringFrappeImg,
    'black & white cold brew': blackWhiteColdBrewImg,
    'strawberry limeade': strawberryLimeadeImg,
    'shaken lemonade': shakenLemonadeImg,
    'mannino honey crepe': manninoCrepeImg,
    'downtowner': downtownerImg,
    'funky monkey': funkyMonkeyImg,
    "le s'mores": leSmoresImg,
    'strawberry fields': strawberryFieldsImg,
    'bonjour': bonjourImg,
    'banana foster': bananasFosterImg,
};

function getSizeBasePrice(item: MenuItemDto, size: 'small' | 'medium' | 'large'): number {
    if (size === 'small')  return item.smallPrice  ?? item.basePrice;
    if (size === 'medium') return item.mediumPrice ?? item.basePrice + 0.75;
    return item.largePrice ?? item.basePrice + 1.5;
}

const CATEGORY_ORDER = ['drinks', 'sweet crepes', 'savory crepes', 'bagels'];

function MenuSection({
    title,
    items,
    onSelect,
}: {
    title: string;
    items: MenuItemDto[];
    onSelect: (item: MenuItemDto) => void;
}) {
    return (
        <Stack gap="md">
            <Text size="28pt" className="font-tiempos-headline" fw={300}>
                {title}
            </Text>
            <Grid gutter="md">
                {items.map((item) => (
                    <Grid.Col key={item.id} span={12 / 5}>
                        <Box
                            onClick={() => onSelect(item)}
                            style={{
                                position: 'relative',
                                width: '100%',
                                aspectRatio: '1 / 1',
                                overflow: 'hidden',
                                borderRadius: 8,
                                cursor: 'pointer',
                            }}
                        >
                            {MENU_PHOTOS[item.name] ? (
                                <img
                                    src={MENU_PHOTOS[item.name]}
                                    alt={item.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <Box style={{ width: '100%', height: '100%', background: '#1c1c2e' }} />
                            )}
                            <Box
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    padding: '8px',
                                    background: 'rgba(0,0,0,0.5)',
                                    textAlign: 'center',
                                }}
                            >
                                <Text size="12pt" c="white" fw={500}>
                                    {item.name}
                                </Text>
                            </Box>
                        </Box>
                    </Grid.Col>
                ))}
            </Grid>
        </Stack>
    );
}

export default function Menu() {
    const { addItem } = useCart();
    const [menuItems, setMenuItems] = useState<MenuItemDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selected, setSelected] = useState<MenuItemDto | null>(null);
    const [size, setSize] = useState<'small' | 'medium' | 'large'>('medium');
    const [selectedAddOnIds, setSelectedAddOnIds] = useState<number[]>([]);
    const [selectedToggleLabels, setSelectedToggleLabels] = useState<string[]>([]);
    const [qty, setQty] = useState(1);
    const [addedMsg, setAddedMsg] = useState(false);

    useEffect(() => {
        api.menuItems.getAll()
            .then(setMenuItems)
            .catch(() => setError('could not load menu items.'))
            .finally(() => setLoading(false));
    }, []);

    const openModal = (item: MenuItemDto) => {
        setSelected(item);
        setSize('medium');
        setSelectedAddOnIds([]);
        setSelectedToggleLabels(item.toggles.filter(t => t.defaultOn).map(t => t.label));
        setQty(1);
        setAddedMsg(false);
    };

    const closeModal = () => {
        setSelected(null);
        setAddedMsg(false);
    };

    const computedUnitPrice = selected
        ? (selected.hasSizes ? getSizeBasePrice(selected, size) : selected.basePrice)
            + selected.addOns
                .filter(a => selectedAddOnIds.includes(a.id))
                .reduce((sum, a) => sum + a.price, 0)
        : 0;

    const handleAddToBag = () => {
        if (!selected) return;
        addItem({
            menuItemId: selected.id,
            name: selected.name,
            size: selected.hasSizes ? size : undefined,
            selectedAddOns: selected.addOns
                .filter(a => selectedAddOnIds.includes(a.id))
                .map(a => ({ id: a.id, label: a.label, price: a.price })),
            selectedToggleLabels,
            qty,
            unitPrice: computedUnitPrice,
        });
        setAddedMsg(true);
        setTimeout(closeModal, 800);
    };

    const toggleAddOn = (id: number, checked: boolean) => {
        setSelectedAddOnIds(prev =>
            checked ? [...prev, id] : prev.filter(x => x !== id)
        );
    };

    const toggleToggle = (label: string, checked: boolean) => {
        setSelectedToggleLabels(prev =>
            checked ? [...prev, label] : prev.filter(x => x !== label)
        );
    };

    const groupedItems = CATEGORY_ORDER.map(cat => ({
        category: cat,
        items: menuItems.filter(i => i.category === cat),
    })).filter(g => g.items.length > 0);

    if (loading) {
        return (
            <Center h="50vh">
                <Loader color="#a5b4fc" />
            </Center>
        );
    }

    if (error) {
        return (
            <Center h="50vh">
                <Text c="dimmed">{error}</Text>
            </Center>
        );
    }

    return (
        <AppShell>
            <Container size="lg" py="xl">
                <Stack gap="xl">
                    {groupedItems.map(g => (
                        <MenuSection
                            key={g.category}
                            title={g.category}
                            items={g.items}
                            onSelect={openModal}
                        />
                    ))}
                    <Text size="11pt" c="dimmed" style={{ maxWidth: 380 }}>
                        * availability and price depends on location
                    </Text>
                </Stack>
            </Container>

            <Modal
                opened={!!selected}
                onClose={closeModal}
                centered
                size="md"
                withCloseButton={false}
                overlayProps={{ opacity: 0.55, blur: 3 }}
            >
                {selected && (
                    <Stack gap="md">
                        {MENU_PHOTOS[selected.name] ? (
                            <img
                                src={MENU_PHOTOS[selected.name]}
                                alt={selected.name}
                                style={{ width: '100%', borderRadius: 8, objectFit: 'cover' }}
                            />
                        ) : (
                            <Box style={{ width: '100%', aspectRatio: '1 / 1', borderRadius: 8, background: '#1c1c2e' }} />
                        )}

                        <Group justify="space-between" align="flex-end">
                            <Text size="20pt" fw={600} className="font-tiempos-headline">
                                {selected.name}
                            </Text>
                            <Text size="16pt" fw={500}>
                                ${computedUnitPrice.toFixed(2)}
                            </Text>
                        </Group>

                        <Text size="12pt" c="dimmed">
                            {selected.description}
                        </Text>

                        {/* Size selector */}
                        {selected.hasSizes && (
                            <Stack gap={6}>
                                <Text size="11pt" fw={600} tt="uppercase" style={{ letterSpacing: '0.08em' }} c="dimmed">
                                    size
                                </Text>
                                <SegmentedControl
                                    value={size}
                                    onChange={(v) => setSize(v as 'small' | 'medium' | 'large')}
                                    color="#a5b4fc"
                                    data={[
                                        { label: `small  $${getSizeBasePrice(selected, 'small').toFixed(2)}`, value: 'small' },
                                        { label: `medium  $${getSizeBasePrice(selected, 'medium').toFixed(2)}`, value: 'medium' },
                                        { label: `large  $${getSizeBasePrice(selected, 'large').toFixed(2)}`, value: 'large' },
                                    ]}
                                    fullWidth
                                    classNames={{ label: 'font-tiempos-text' }}
                                />
                            </Stack>
                        )}

                        {/* Add-ons */}
                        {selected.addOns.length > 0 && (
                            <Stack gap={6}>
                                <Text size="11pt" fw={600} tt="uppercase" style={{ letterSpacing: '0.08em' }} c="dimmed">
                                    add-ons
                                </Text>
                                <Grid gutter="xs">
                                    {selected.addOns.map(a => (
                                        <Grid.Col key={a.id} span={6}>
                                            <Checkbox
                                                checked={selectedAddOnIds.includes(a.id)}
                                                onChange={e => toggleAddOn(a.id, e.currentTarget.checked)}
                                                label={`${a.label}${a.price > 0 ? ` (+$${a.price.toFixed(2)})` : ' (free)'}`}
                                                color="#a5b4fc"
                                                size="sm"
                                                classNames={{ label: 'font-tiempos-text' }}
                                            />
                                        </Grid.Col>
                                    ))}
                                </Grid>
                            </Stack>
                        )}

                        {/* Toggles */}
                        {selected.toggles.length > 0 && (
                            <Stack gap={6}>
                                <Text size="11pt" fw={600} tt="uppercase" style={{ letterSpacing: '0.08em' }} c="dimmed">
                                    options
                                </Text>
                                {selected.toggles.map(t => (
                                    <Checkbox
                                        key={t.id}
                                        checked={selectedToggleLabels.includes(t.label)}
                                        onChange={e => toggleToggle(t.label, e.currentTarget.checked)}
                                        label={t.label}
                                        color="#a5b4fc"
                                        size="sm"
                                        classNames={{ label: 'font-tiempos-text' }}
                                    />
                                ))}
                            </Stack>
                        )}

                        <Divider />

                        {/* Quantity */}
                        <Group justify="center" gap="md">
                            <Button
                                onClick={() => setQty(q => Math.max(1, q - 1))}
                                variant="outline"
                                color="#a5b4fc"
                                size="sm"
                            >
                                −
                            </Button>
                            <Text size="16pt" fw={500}>{qty}</Text>
                            <Button
                                onClick={() => setQty(q => q + 1)}
                                variant="outline"
                                color="#a5b4fc"
                                size="sm"
                            >
                                +
                            </Button>
                        </Group>

                        <Text size="12pt" ta="center" c="dimmed" className="font-tiempos-text">
                            total: ${(computedUnitPrice * qty).toFixed(2)}
                        </Text>

                        <Group grow>
                            <Button
                                onClick={handleAddToBag}
                                color="#a5b4fc"
                                disabled={addedMsg}
                                className="font-tiempos-text"
                                tt="lowercase"
                            >
                                {addedMsg ? 'added!' : 'add to bag'}
                            </Button>
                            <Button
                                variant="light"
                                color="gray"
                                onClick={closeModal}
                                className="font-tiempos-text"
                                tt="lowercase"
                            >
                                cancel
                            </Button>
                        </Group>
                    </Stack>
                )}
            </Modal>
        </AppShell>
    );
}
