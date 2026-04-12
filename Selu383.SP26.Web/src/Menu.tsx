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
} from '@mantine/core';
import { useState } from 'react';

type Drink = {
    name: string;
    desc: string;
};

const coldDrinks: Drink[] = [
    { name: 'cold brew', desc: 'steeped for 12 hours, smooth and naturally sweet' },
    { name: 'nitro cold brew', desc: 'cold brew on tap, infused with nitrogen for a silky finish' },
    { name: 'iced coffee', desc: 'freshly brewed coffee poured over ice' },
    { name: 'iced americano', desc: 'espresso shots over ice, topped with cold water' },
    { name: 'iced latte', desc: 'espresso with cold milk over ice' },
    { name: 'iced mocha', desc: 'espresso, chocolate, and milk over ice' },
    { name: 'frappe', desc: 'blended ice, espresso, and milk' },
    { name: 'vietnamese iced coffee', desc: 'strong drip coffee with sweetened condensed milk over ice' },
    { name: 'cold foam latte', desc: 'iced latte crowned with velvety cold foam' },
    { name: 'shaken espresso', desc: 'espresso shaken with ice for a frothy, chilled pick-me-up' },
];

const hotDrinks: Drink[] = [
    { name: 'espresso', desc: 'a concentrated shot of rich, bold coffee' },
    { name: 'americano', desc: 'espresso diluted with hot water for a clean, smooth cup' },
    { name: 'cappuccino', desc: 'equal parts espresso, steamed milk, and thick foam' },
    { name: 'latte', desc: 'espresso with a generous pour of silky steamed milk' },
    { name: 'macchiato', desc: 'espresso marked with a dollop of foam' },
    { name: 'mocha', desc: 'espresso blended with chocolate and steamed milk' },
    { name: 'flat white', desc: 'velvety microfoam poured over a double ristretto' },
    { name: 'cortado', desc: 'equal parts espresso and warm milk to balance the intensity' },
    { name: 'lungo', desc: 'a long pull espresso, slower and more mellow' },
    { name: 'pour over', desc: 'single-origin beans brewed to order, one careful pour at a time' },
];

function DrinkSection({
    title,
    drinks,
    onSelect,
}: {
    title: string;
    drinks: Drink[];
    onSelect: (drink: Drink, index: number) => void;
}) {
    return (
        <Stack gap="md">
            <Text size="28pt" className="font-tiempos-headline" fw={300}>
                {title}
            </Text>

            <Grid gutter="md">
                {drinks.map((drink, i) => (
                    <Grid.Col key={drink.name} span={12 / 5}>
                        <Box
                            onClick={() => onSelect(drink, i)}
                            style={{
                                position: 'relative',
                                width: '100%',
                                aspectRatio: '1 / 1',
                                overflow: 'hidden',
                                borderRadius: 8,
                                cursor: 'pointer',
                            }}
                        >
                            <img
                                src={`https://source.unsplash.com/400x400/?coffee&sig=${i}`}
                                alt={drink.name}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                }}
                            />

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
                                    {drink.name}
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
    const [selected, setSelected] = useState<Drink | null>(null);
    const [imageIndex, setImageIndex] = useState<number>(0);
    const [count, setCount] = useState<number>(1);

    const openModal = (drink: Drink, index: number) => {
        setSelected(drink);
        setImageIndex(index);
        setCount(1);
    };

    const closeModal = () => {
        setSelected(null);
        setCount(1);
    };

    return (
        <AppShell>
            <Container size="lg" py="xl">
                <Stack gap="xl">
                    <DrinkSection title="cold drinks" drinks={coldDrinks} onSelect={openModal} />
                    <DrinkSection title="hot drinks" drinks={hotDrinks} onSelect={openModal} />

                    <Text size="11pt" c="dimmed" style={{ maxWidth: 380 }}>
                        * availability and price depends on location
                    </Text>
                </Stack>
            </Container>

            {/* Overlay Modal */}
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
                        <img
                            src={`https://source.unsplash.com/600x600/?coffee&sig=${imageIndex}`}
                            alt={selected.name}
                            style={{
                                width: '100%',
                                borderRadius: 8,
                                objectFit: 'cover',
                            }}
                        />

                        <Text size="20pt" fw={600}>
                            {selected.name}
                        </Text>

                        <Text size="12pt" c="dimmed">
                            {selected.desc}
                        </Text>

                        {/* Quantity Controls */}
                        <Group justify="center" gap="md">
                            <Button
                                onClick={() => setCount((c) => Math.max(1, c - 1))}
                                variant="outline"
                            >
                                -
                            </Button>

                            <Text size="14pt">{count}</Text>

                            <Button
                                onClick={() => setCount((c) => c + 1)}
                                variant="outline"
                            >
                                +
                            </Button>
                        </Group>

                        {/* Action Buttons */}
                        <Group grow mt="md">
                            <Button onClick={() => { }}>
                                Add to Cart
                            </Button>

                            <Button variant="light" color="gray" onClick={closeModal}>
                                Cancel
                            </Button>
                        </Group>
                    </Stack>
                )}
            </Modal>
        </AppShell>
    );
}