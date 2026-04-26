import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    TextInput, PasswordInput, Button, Alert, Text, Stack, ActionIcon,
} from '@mantine/core';
import { IconChevronRight, IconChevronLeft, IconAlertCircle } from '@tabler/icons-react';
import { useAuth } from './AuthContext';
import { api } from './api';

function Signup() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const viewportRef = useRef<HTMLDivElement>(null);

    const [step, setStep] = useState(0);
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const slideWidth = () => viewportRef.current?.clientWidth ?? 440;

    const validate = () => {
        if (step === 0) {
            if (!userName.trim()) return 'please enter a username';
            if (/\s/.test(userName)) return 'username cannot contain spaces';
        }
        if (step === 1) {
            if (!password) return 'please enter a password';
            if (password.length < 6) return 'password must be at least 6 characters';
            if (password !== confirm) return 'passwords do not match';
        }
        return null;
    };

    const goNext = () => {
        const err = validate();
        if (err) { setError(err); return; }
        setError('');
        setStep(s => s + 1);
    };

    const goPrev = () => {
        setError('');
        setStep(s => s - 1);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            await api.auth.signup({ userName, password });
            await login(userName, password);
            navigate('/');
        } catch {
            setError('something went wrong — that username may already be taken');
        } finally {
            setLoading(false);
        }
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (step < 2) goNext();
            else if (!loading) handleSubmit();
        }
    };

    return (
        <div className="signup-root" onKeyDown={onKeyDown}>
            <div className="hero-blob hero-blob-1" />
            <div className="hero-blob hero-blob-2" />
            <div className="hero-blob hero-blob-3" />

            <div className="signup-card">
                {/* Step dots */}
                <div className="signup-dots">
                    {[0, 1, 2].map(i => (
                        <div key={i} className="signup-dot" data-active={i === step ? 'true' : undefined} />
                    ))}
                </div>

                {/* Carousel viewport — overflow clips off-screen steps horizontally */}
                <div ref={viewportRef} style={{ overflow: 'hidden' }}>
                    <div
                        className="signup-track"
                        style={{ transform: `translateX(-${step * slideWidth()}px)` }}
                    >
                        {/* Step 0: Username */}
                        <div className="signup-step">
                            <Stack gap="lg">
                                <div>
                                    <Text className="font-tiempos-headline" size="26pt" fw={300} mb={4}>
                                        welcome.
                                    </Text>
                                    <Text size="11pt" c="dimmed" className="font-tiempos-text">
                                        pick a username to get started.
                                    </Text>
                                </div>
                                <TextInput
                                    label="username"
                                    placeholder="your_username"
                                    value={userName}
                                    onChange={e => setUserName(e.currentTarget.value)}
                                    autoFocus
                                    autoComplete="username"
                                    size="md"
                                />
                                {error && (
                                    <Alert
                                        color="red"
                                        variant="light"
                                        icon={<IconAlertCircle size={16} />}
                                        p="xs"
                                    >
                                        <Text size="11pt">{error}</Text>
                                    </Alert>
                                )}
                                {/* Spacer so all steps match step 2's height */}
                                <div style={{ height: 66 }} />
                            </Stack>
                        </div>

                        {/* Step 1: Password */}
                        <div className="signup-step">
                            <Stack gap="lg">
                                <div>
                                    <Text className="font-tiempos-headline" size="26pt" fw={300} mb={4}>
                                        secure it.
                                    </Text>
                                    <Text size="11pt" c="dimmed" className="font-tiempos-text">
                                        choose a strong password.
                                    </Text>
                                </div>
                                <PasswordInput
                                    label="password"
                                    placeholder="at least 6 characters"
                                    value={password}
                                    onChange={e => setPassword(e.currentTarget.value)}
                                    autoComplete="new-password"
                                    size="md"
                                />
                                <PasswordInput
                                    label="confirm password"
                                    placeholder="one more time"
                                    value={confirm}
                                    onChange={e => setConfirm(e.currentTarget.value)}
                                    autoComplete="new-password"
                                    size="md"
                                />
                                {error && (
                                    <Alert
                                        color="red"
                                        variant="light"
                                        icon={<IconAlertCircle size={16} />}
                                        p="xs"
                                    >
                                        <Text size="11pt">{error}</Text>
                                    </Alert>
                                )}
                            </Stack>
                        </div>

                        {/* Step 2: Review & submit */}
                        <div className="signup-step">
                            <Stack gap="lg">
                                <div>
                                    <Text className="font-tiempos-headline" size="26pt" fw={300} mb={4}>
                                        almost there.
                                    </Text>
                                    <Text size="11pt" c="dimmed" className="font-tiempos-text">
                                        ready to join as{' '}
                                        <Text span fw={600} style={{ color: '#a5b4fc' }} className="font-tiempos-text">
                                            {userName}
                                        </Text>
                                        ?
                                    </Text>
                                </div>
                                <div className="signup-review-box">
                                    <Text size="10pt" c="dimmed" mb={4} className="font-tiempos-text">
                                        joining as
                                    </Text>
                                    <Text size="14pt" fw={500} className="font-tiempos-text">
                                        {userName}
                                    </Text>
                                </div>
                                {error && (
                                    <Alert
                                        color="red"
                                        variant="light"
                                        icon={<IconAlertCircle size={16} />}
                                        p="xs"
                                    >
                                        <Text size="11pt">{error}</Text>
                                    </Alert>
                                )}
                                {/* Spacer to match step 2 height */}
                                <div style={{ height: 66 }} />
                            </Stack>
                        </div>
                    </div>
                </div>

                {/* Navigation row */}
                <div className="signup-nav">
                    {step > 0 ? (
                        <ActionIcon
                            variant="subtle"
                            color="gray"
                            size="lg"
                            onClick={goPrev}
                            aria-label="previous step"
                        >
                            <IconChevronLeft size={20} />
                        </ActionIcon>
                    ) : <span />}

                    {step < 2 ? (
                        <ActionIcon
                            variant="filled"
                            color="#a5b4fc"
                            size="lg"
                            onClick={goNext}
                            aria-label="next step"
                        >
                            <IconChevronRight size={20} />
                        </ActionIcon>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            loading={loading}
                            color="#a5b4fc"
                            variant="filled"
                            className="font-tiempos-text"
                            tt="lowercase"
                            size="sm"
                        >
                            create account
                        </Button>
                    )}
                </div>

                <Text size="10pt" c="dimmed" ta="center" pb={28} className="font-tiempos-text">
                    already have an account?{' '}
                    <Link to="/" style={{ color: '#a5b4fc' }}>sign in</Link>
                </Text>
            </div>
        </div>
    );
}

export default Signup;
