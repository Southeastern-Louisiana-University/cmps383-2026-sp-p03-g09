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
    price: string;
    desc: string;
};

const allDrinks: Drink[] = [
    { name: 'iced latte', price: '$5.50', desc: 'espresso and milk served over ice for a refreshing coffee drink.' },
    { name: 'supernova', price: '$7.95', desc: 'a unique coffee blend with a complex, balanced profile and subtle sweetness. delicious as espresso or paired with milk.' },
    { name: 'roaring frappe', price: '$6.20', desc: 'cold brew, milk, and ice blended together with a signature syrup or flavor, topped with whipped cream.' },
    { name: 'black & white cold brew', price: '$5.15', desc: 'cold brew made with both dark and light roast beans, finished with a drizzle of condensed milk.' },
    { name: 'strawberry limeade', price: '$5.00', desc: 'fresh lime juice blended with strawberry purée for a refreshing, tangy drink.' },
    { name: 'shaken lemonade', price: '$5.00', desc: 'fresh lemon juice and simple syrup vigorously shaken for a bright, refreshing lemonade.' },
];

const sweetCrepes: Drink[] = [
    { name: 'mannino honey crepe', price: '$10.00', desc: 'a sweet crepe drizzled with mannino honey and topped with mixed berries.' },
    { name: 'downtowner', price: '$10.75', desc: "strawberries and bananas wrapped in a crepe, finished with nutella and hershey's chocolate sauce." },
    { name: 'funky monkey', price: '$10.00', desc: 'nutella and bananas wrapped in a crepe, served with whipped cream.' },
    { name: "le s'mores", price: '$9.50', desc: 'marshmallow cream and chocolate sauce inside a crepe, topped with graham cracker crumbs.' },
    { name: 'strawberry fields', price: '$10.00', desc: "fresh strawberries with hershey's chocolate drizzle and a dusting of powdered sugar." },
    { name: 'bonjour', price: '$8.50', desc: 'a sweet crepe filled with syrup and cinnamon, finished with powdered sugar.' },
    { name: 'banana foster', price: '$8.95', desc: 'bananas with cinnamon in a crepe, topped with a generous drizzle of caramel sauce.' },
];

const savoryCrapes: Drink[] = [
    { name: "matt's scrambled eggs", price: '$5.00', desc: 'scrambled eggs and melted mozzarella cheese wrapped in a crepe.' },
    { name: 'meanie mushroom', price: '$10.50', desc: 'sautéed mushrooms, mozzarella, tomato, and bacon inside a delicate crepe.' },
    { name: 'turkey club', price: '$10.50', desc: 'sliced turkey, bacon, spinach, and tomato wrapped in a savory crepe.' },
    { name: 'green machine', price: '$10.00', desc: 'spinach, artichokes, and mozzarella cheese inside a fresh crepe.' },
    { name: 'perfect pair', price: '$10.00', desc: 'a unique combination of bacon and nutella wrapped in a crepe.' },
    { name: 'crepe fromage', price: '$8.00', desc: 'a savory crepe filled with a blend of cheeses.' },
    { name: 'farmers market crepe', price: '$10.50', desc: 'turkey, spinach, and mozzarella wrapped in a savory crepe.' },
];

const bagels: Drink[] = [
    { name: 'travis special', price: '$14.00', desc: 'cream cheese, salmon, spinach, and a fried egg served on a freshly toasted bagel.' },
    { name: 'crème brulagel', price: '$8.00', desc: 'a toasted bagel with a caramelized sugar crust inspired by crème brûlée, served with cream cheese.' },
    { name: 'the fancy one', price: '$13.00', desc: 'smoked salmon, cream cheese, and fresh dill on a toasted bagel.' },
    { name: 'breakfast bagel', price: '$9.50', desc: 'a toasted bagel with your choice of ham, bacon, or sausage, a fried egg, and cheddar cheese.' },
    { name: 'the classic', price: '$5.25', desc: 'a toasted bagel with cream cheese.' },
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
                    <DrinkSection title="drinks" drinks={allDrinks} onSelect={openModal} />
                    <DrinkSection title="sweet crepes" drinks={sweetCrepes} onSelect={openModal} />
                    <DrinkSection title="savory crepes" drinks={savoryCrapes} onSelect={openModal} />
                    <DrinkSection title="bagels" drinks={bagels} onSelect={openModal} />

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

                        <Text size="14pt" fw={500}>
                            {selected.price}
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
                                add to bag
                            </Button>

                            <Button variant="light" color="gray" onClick={closeModal}>
                                cancel
                            </Button>
                        </Group>
                    </Stack>
                )}
            </Modal>
        </AppShell>
    );
}