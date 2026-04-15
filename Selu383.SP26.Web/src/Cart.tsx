import {
    AppShell,
    Container,
    Text,
    Stack,
    Group,
    Button,
    Card,
    Divider,
    Select,
    SegmentedControl,
    Loader,
    Center,
    Badge,
    Alert,
} from '@mantine/core';
import { TimeInput } from '@mantine/dates';
import { IconCheck, IconShoppingBagX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, LocationDto, OrderDto } from './api';
import { useCart } from './CartContext';

const TAX_RATE = 0.0975;

const ORDER_TYPES = [
    { label: 'dine in', value: 'dine_in' },
    { label: 'carry out', value: 'carry_out' },
    { label: 'drive thru', value: 'drive_thru' },
];

const PAYMENT_METHODS = [
    { label: 'card', value: 'card' },
    { label: 'cash', value: 'cash' },
    { label: 'apple pay', value: 'apple_pay' },
    { label: 'google pay', value: 'google_pay' },
];

// returns "HH:MM" string 30 min from now, rounded up to next 15
function defaultPickupTime(): string {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 30, 0, 0);
    const rem = d.getMinutes() % 15;
    if (rem !== 0) d.setMinutes(d.getMinutes() + (15 - rem));
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// converts "HH:MM" to today's ISO datetime string
function timeStrToISO(hhmm: string): string {
    const [h, m] = hhmm.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d.toISOString();
}

export default function Cart() {
    const { items, removeItem, updateQty, clearCart, total, itemCount } = useCart();
    const navigate = useNavigate();

    const [locations, setLocations] = useState<LocationDto[]>([]);
    const [locationId, setLocationId] = useState<string | null>(null);
    const [orderType, setOrderType] = useState('carry_out');
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [pickupTime, setPickupTime] = useState<string>(defaultPickupTime);
    const [submitting, setSubmitting] = useState(false);
    const [confirmedOrder, setConfirmedOrder] = useState<OrderDto | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        api.locations.getAll().then(locs => {
            setLocations(locs);
            if (locs.length > 0) setLocationId(String(locs[0].id));
        });
    }, []);

    const tax = total * TAX_RATE;
    const grandTotal = total + tax;

    const handlePlaceOrder = async () => {
        if (!locationId) {
            setError('Please select a location.');
            return;
        }
        setError(null);
        setSubmitting(true);
        try {
            const order = await api.orders.create({
                locationId: Number(locationId),
                orderType,
                pickupTime: timeStrToISO(pickupTime),
                paymentMethod,
                items: items.map(i => ({
                    menuItemId: i.menuItemId,
                    size: i.size,
                    quantity: i.qty,
                    selectedAddOnIds: i.selectedAddOns.map(a => a.id),
                    selectedToggleLabels: i.selectedToggleLabels,
                })),
            });
            clearCart();
            setConfirmedOrder(order);
        } catch {
            setError('something went wrong placing your order. please try again');
        } finally {
            setSubmitting(false);
        }
    };

    if (confirmedOrder) {
        return (
            <AppShell>
                <Container size="sm" py="xl">
                    <Stack gap="xl" align="center">
                        <IconCheck size={64} color="#a5b4fc" />
                        <Text size="32pt" className="font-tiempos-headline" fw={300} ta="center">
                            order confirmed.
                        </Text>
                        <Text size="13pt" c="dimmed" className="font-tiempos-text" ta="center">
                            your order is being prepared and will be ready at the time below.
                        </Text>

                        <Card withBorder radius="md" padding="lg" style={{ width: '100%' }}>
                            <Stack gap="sm">
                                <Group justify="space-between">
                                    <Text size="11pt" c="dimmed" tt="uppercase" style={{ letterSpacing: '0.08em' }}>order #</Text>
                                    <Text size="13pt" fw={600}>{confirmedOrder.id}</Text>
                                </Group>
                                <Group justify="space-between">
                                    <Text size="11pt" c="dimmed" tt="uppercase" style={{ letterSpacing: '0.08em' }}>location</Text>
                                    <Text size="13pt">{confirmedOrder.locationName}</Text>
                                </Group>
                                <Group justify="space-between">
                                    <Text size="11pt" c="dimmed" tt="uppercase" style={{ letterSpacing: '0.08em' }}>pickup time</Text>
                                    <Text size="13pt">
                                        {new Date(confirmedOrder.pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </Group>
                                <Group justify="space-between">
                                    <Text size="11pt" c="dimmed" tt="uppercase" style={{ letterSpacing: '0.08em' }}>total</Text>
                                    <Text size="13pt" fw={600}>${confirmedOrder.total.toFixed(2)}</Text>
                                </Group>
                                {confirmedOrder.pointsEarned > 0 && (
                                    <Group justify="space-between">
                                        <Text size="11pt" c="dimmed" tt="uppercase" style={{ letterSpacing: '0.08em' }}>points earned</Text>
                                        <Badge color="#a5b4fc" variant="light">+{confirmedOrder.pointsEarned} pts</Badge>
                                    </Group>
                                )}
                            </Stack>
                        </Card>

                        <Stack gap="xs" style={{ width: '100%' }}>
                            {confirmedOrder.items.map(item => (
                                <Group key={item.id} justify="space-between">
                                    <Text size="12pt" className="font-tiempos-text">
                                        {item.quantity}× {item.menuItemName}{item.size ? ` (${item.size})` : ''}
                                    </Text>
                                    <Text size="12pt" c="dimmed">${(item.unitPrice * item.quantity).toFixed(2)}</Text>
                                </Group>
                            ))}
                        </Stack>

                        <Button
                            onClick={() => navigate('/menu')}
                            variant="outline"
                            color="#a5b4fc"
                            className="font-tiempos-text"
                            tt="lowercase"
                        >
                            back to menu
                        </Button>
                    </Stack>
                </Container>
            </AppShell>
        );
    }

    if (itemCount === 0) {
        return (
            <AppShell>
                <Container size="sm" py="xl">
                    <Stack gap="xl" align="center">
                        <IconShoppingBagX size={64} color="#6b7280" />
                        <Text size="28pt" className="font-tiempos-headline" fw={300} ta="center">
                            your bag is empty.
                        </Text>
                        <Text size="13pt" c="dimmed" className="font-tiempos-text" ta="center">
                            head to the menu and add something delicious.
                        </Text>
                        <Button
                            onClick={() => navigate('/menu')}
                            variant="outline"
                            color="#a5b4fc"
                            className="font-tiempos-text"
                            tt="lowercase"
                        >
                            view menu
                        </Button>
                    </Stack>
                </Container>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <Container size="md" py="xl">
                <Stack gap="xl">
                    <Text size="32pt" className="font-tiempos-headline" fw={300}>
                        your bag.
                    </Text>

                    {/* cart items */}
                    <Stack gap="sm">
                        {items.map(item => (
                            <Card key={item.cartItemId} withBorder radius="md" padding="md">
                                <Group justify="space-between" align="flex-start">
                                    <Stack gap={2} style={{ flex: 1 }}>
                                        <Text size="14pt" fw={500} className="font-tiempos-headline">
                                            {item.name}
                                            {item.size && (
                                                <Text span size="11pt" c="dimmed"> — {item.size}</Text>
                                            )}
                                        </Text>
                                        {item.selectedAddOns.length > 0 && (
                                            <Text size="10pt" c="dimmed" className="font-tiempos-text">
                                                {item.selectedAddOns.map(a => a.label).join(', ')}
                                            </Text>
                                        )}
                                        {item.selectedToggleLabels.length > 0 && (
                                            <Text size="10pt" c="dimmed" className="font-tiempos-text">
                                                {item.selectedToggleLabels.join(', ')}
                                            </Text>
                                        )}
                                        <Text size="11pt" c="dimmed">${item.unitPrice.toFixed(2)} each</Text>
                                    </Stack>

                                    <Group gap="xs" align="center">
                                        <Button
                                            size="xs"
                                            variant="subtle"
                                            color="gray"
                                            onClick={() => updateQty(item.cartItemId, item.qty - 1)}
                                            px={6}
                                        >
                                            −
                                        </Button>
                                        <Text size="13pt" fw={500} style={{ minWidth: 20, textAlign: 'center' }}>
                                            {item.qty}
                                        </Text>
                                        <Button
                                            size="xs"
                                            variant="subtle"
                                            color="gray"
                                            onClick={() => updateQty(item.cartItemId, item.qty + 1)}
                                            px={6}
                                        >
                                            +
                                        </Button>
                                        <Text size="13pt" fw={600} style={{ minWidth: 56, textAlign: 'right' }}>
                                            ${(item.unitPrice * item.qty).toFixed(2)}
                                        </Text>
                                        <Button
                                            size="xs"
                                            variant="subtle"
                                            color="red"
                                            onClick={() => removeItem(item.cartItemId)}
                                        >
                                            ×
                                        </Button>
                                    </Group>
                                </Group>
                            </Card>
                        ))}
                    </Stack>

                    {/* order summary */}
                    <Card withBorder radius="md" padding="lg">
                        <Stack gap="xs">
                            <Group justify="space-between">
                                <Text size="12pt" c="dimmed">subtotal</Text>
                                <Text size="12pt">${total.toFixed(2)}</Text>
                            </Group>
                            <Group justify="space-between">
                                <Text size="12pt" c="dimmed">tax (9.75%)</Text>
                                <Text size="12pt">${tax.toFixed(2)}</Text>
                            </Group>
                            <Divider />
                            <Group justify="space-between">
                                <Text size="14pt" fw={600}>total</Text>
                                <Text size="14pt" fw={600}>${grandTotal.toFixed(2)}</Text>
                            </Group>
                        </Stack>
                    </Card>

                    <Divider />

                    {/* checkout options */}
                    <Stack gap="lg">
                        <Text size="24pt" className="font-tiempos-headline" fw={300}>
                            order details.
                        </Text>

                        {/* location */}
                        <Stack gap={6}>
                            <Text size="11pt" fw={600} tt="uppercase" style={{ letterSpacing: '0.08em' }} c="dimmed">
                                location
                            </Text>
                            <Select
                                value={locationId}
                                onChange={setLocationId}
                                data={locations.map(l => ({ label: l.name, value: String(l.id) }))}
                                placeholder="choose a location"
                                classNames={{ input: 'font-tiempos-text' }}
                            />
                        </Stack>

                        {/* order type */}
                        <Stack gap={6}>
                            <Text size="11pt" fw={600} tt="uppercase" style={{ letterSpacing: '0.08em' }} c="dimmed">
                                order type
                            </Text>
                            <SegmentedControl
                                value={orderType}
                                onChange={setOrderType}
                                color="#a5b4fc"
                                data={ORDER_TYPES}
                                fullWidth
                                classNames={{ label: 'font-tiempos-text' }}
                            />
                        </Stack>

                        {/* pickup time */}
                        <Stack gap={6}>
                            <Text size="11pt" fw={600} tt="uppercase" style={{ letterSpacing: '0.08em' }} c="dimmed">
                                pickup time
                            </Text>
                            <TimeInput
                                value={pickupTime}
                                onChange={e => setPickupTime(e.currentTarget.value)}
                                classNames={{ input: 'font-tiempos-text' }}
                            />
                        </Stack>

                        {/* payment method */}
                        <Stack gap={6}>
                            <Text size="11pt" fw={600} tt="uppercase" style={{ letterSpacing: '0.08em' }} c="dimmed">
                                payment
                            </Text>
                            <SegmentedControl
                                value={paymentMethod}
                                onChange={setPaymentMethod}
                                color="#a5b4fc"
                                data={PAYMENT_METHODS}
                                fullWidth
                                classNames={{ label: 'font-tiempos-text' }}
                            />
                        </Stack>
                    </Stack>

                    {error && (
                        <Alert color="red" variant="light">
                            <Text size="12pt">{error}</Text>
                        </Alert>
                    )}

                    <Button
                        onClick={handlePlaceOrder}
                        loading={submitting}
                        size="lg"
                        color="#a5b4fc"
                        className="font-tiempos-text"
                        tt="lowercase"
                        style={{ letterSpacing: '0.08em' }}
                    >
                        place order — ${grandTotal.toFixed(2)}
                    </Button>
                </Stack>
            </Container>
        </AppShell>
    );
}
