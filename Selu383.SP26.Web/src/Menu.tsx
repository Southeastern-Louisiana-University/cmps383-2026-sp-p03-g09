import { AppShell, Text, Stack, Container, Divider, Group, Box } from '@mantine/core';

const coldDrinks = [
    { name: 'cold brew',              desc: 'steeped for 12 hours, smooth and naturally sweet' },
    { name: 'nitro cold brew',        desc: 'cold brew on tap, infused with nitrogen for a silky finish' },
    { name: 'iced coffee',            desc: 'freshly brewed coffee poured over ice' },
    { name: 'iced americano',         desc: 'espresso shots over ice, topped with cold water' },
    { name: 'iced latte',             desc: 'espresso with cold milk over ice' },
    { name: 'iced mocha',             desc: 'espresso, chocolate, and milk over ice' },
    { name: 'frappe',                 desc: 'blended ice, espresso, and milk' },
    { name: 'vietnamese iced coffee', desc: 'strong drip coffee with sweetened condensed milk over ice' },
    { name: 'cold foam latte',        desc: 'iced latte crowned with velvety cold foam' },
    { name: 'shaken espresso',        desc: 'espresso shaken with ice for a frothy, chilled pick-me-up' },
];

const hotDrinks = [
    { name: 'espresso',   desc: 'a concentrated shot of rich, bold coffee' },
    { name: 'americano',  desc: 'espresso diluted with hot water for a clean, smooth cup' },
    { name: 'cappuccino', desc: 'equal parts espresso, steamed milk, and thick foam' },
    { name: 'latte',      desc: 'espresso with a generous pour of silky steamed milk' },
    { name: 'macchiato',  desc: 'espresso marked with a dollop of foam' },
    { name: 'mocha',      desc: 'espresso blended with chocolate and steamed milk' },
    { name: 'flat white',  desc: 'velvety microfoam poured over a double ristretto' },
    { name: 'cortado',    desc: 'equal parts espresso and warm milk to balance the intensity' },
    { name: 'lungo',      desc: 'a long pull espresso, slower and more mellow' },
    { name: 'pour over',  desc: 'single-origin beans brewed to order, one careful pour at a time' },
];

function DrinkSection({ title, drinks }: { title: string; drinks: { name: string; desc: string }[] }) {
    return (
        <Stack gap={0}>
            <Text size="28pt" className="font-tiempos-headline" fw={300} mb="md">
                {title}
            </Text>
            {drinks.map((drink, i) => (
                <Box key={drink.name}>
                    <Group justify="space-between" align="baseline" py="xs">
                        <Text size="14pt" className="font-tiempos-text" fw={500} style={{ minWidth: 220 }}>
                            {drink.name}
                        </Text>
                        <Text size="11pt" className="font-tiempos-text" c="dimmed" style={{ textAlign: 'right', maxWidth: 380 }}>
                            {drink.desc}
                        </Text>
                    </Group>
                    {i < drinks.length - 1 && <Divider opacity={0.25} />}
                </Box>
            ))}
        </Stack>
    );
}

export default function Menu() {
    return (
        <AppShell>
            <Container size="md" py="xl">
                <Stack gap="xl">
                    <DrinkSection title="cold drinks" drinks={coldDrinks} />
                    <DrinkSection title="hot drinks"  drinks={hotDrinks} />
                </Stack>
            </Container>
        </AppShell>
    );
}
