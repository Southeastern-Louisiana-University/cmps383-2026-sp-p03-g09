import { useState } from 'react';
import { Modal, Stack, TextInput, Button, Text, Alert } from '@mantine/core';
import { useAuth } from './AuthContext';

export default function Login({ opened, onClose }: { opened: boolean; onClose: () => void }) {
    const { login } = useAuth();
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setError('');
        setLoading(true);
        try {
            await login(userName, password);
            setUserName('');
            setPassword('');
            onClose();
        } catch {
            setError('invalid username or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            centered
            size="sm"
            title={
                <Text size="18pt" className="font-tiempos-headline" fw={300}>
                    sign in
                </Text>
            }
        >
            <Stack gap="md">
                {error && (
                    <Alert color="red" variant="light">
                        {error}
                    </Alert>
                )}
                <TextInput
                    label="username"
                    placeholder="your username"
                    value={userName}
                    onChange={(e) => setUserName(e.currentTarget.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    tt="lowercase"
                />
                <TextInput
                    label="password"
                    type="password"
                    placeholder="password"
                    value={password}
                    onChange={(e) => setPassword(e.currentTarget.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
                <Button
                    onClick={handleSubmit}
                    loading={loading}
                    fullWidth
                    tt="lowercase"
                    style={{ letterSpacing: '0.05em' }}
                >
                    sign in
                </Button>
            </Stack>
        </Modal>
    );
}
