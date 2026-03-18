import { Stepper, Button, Group, Container, Tabs, Flex } from '@mantine/core';
import { useState } from 'react';
import { IconPhoto, IconMessageCircle, IconSettings } from '@tabler/icons-react';

function Menu() {
    const [active, setActive] = useState(1);
    const nextStep = () => setActive((current) => (current < 3 ? current + 1 : current));
    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

    return (
        <>
            <Container
                size='100%'
            >
                <Flex
                    direction="column"
                    align="stretch"
                    align-content="stretch"
                    justify-content="space-between"
                >
                    <Flex
                        direction="row"

                    >
                <Stepper active={active} onStepClick={setActive}>
                <Stepper.Step label="First step" description="Create an account">
                    Step 1 content: Create an account
                </Stepper.Step>
                <Stepper.Step label="Second step" description="Verify email">
                    Step 2 content: Verify email
                </Stepper.Step>
                <Stepper.Step label="Final step" description="Get full access">
                    Step 3 content: Get full access
                </Stepper.Step>
                <Stepper.Completed>
                    Completed, click back button to get to previous step
                </Stepper.Completed>
                    </Stepper>

            <Group justify="center" mt="xl">
                <Button variant="default" onClick={prevStep}>Back</Button>
                <Button onClick={nextStep}>Next step</Button>
                    </Group>
                </Flex>

                <Flex>
            <Tabs defaultValue="gallery">
                <Tabs.List>
                    <Tabs.Tab value="gallery" leftSection={<IconPhoto size={12} />}>
                        Gallery
                    </Tabs.Tab>
                    <Tabs.Tab value="messages" leftSection={<IconMessageCircle size={12} />}>
                        Messages
                    </Tabs.Tab>
                    <Tabs.Tab value="settings" leftSection={<IconSettings size={12} />}>
                        Settings
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="gallery">
                    Gallery tab content
                </Tabs.Panel>

                <Tabs.Panel value="messages">
                    Messages tab content
                </Tabs.Panel>

                <Tabs.Panel value="settings">
                    Settings tab content
                </Tabs.Panel>
                    </Tabs>
                    </Flex>
                </Flex>
            </Container>


        </>
    );
}

export default Menu;