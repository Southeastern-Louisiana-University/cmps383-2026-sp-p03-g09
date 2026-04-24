import {
    Container,
    Text,
    Stack,
    Group,
    Badge,
    Card,
    Loader,
    Center,
    Button,
    Tabs,
    Table,
    ActionIcon,
    Modal,
    TextInput,
    NumberInput,
    Select,
    Checkbox,
    Divider,
    FileInput,
} from '@mantine/core';
import { IconPencil, IconTrash, IconPlus, IconShield, IconStar, IconStarFilled } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type UserDto, type MenuItemDto, type SaveMenuItemDto } from './api';
import { useAuth } from './AuthContext';

const TIER_COLORS: Record<string, string> = {
    'cub': '#9ca3af',
    'silver paw': '#94a3b8',
    'golden paw': '#f59e0b',
};

const CATEGORIES = ['drinks', 'sweet crepes', 'savory crepes', 'bagels'];

// ── Users tab ─────────────────────────────────────────────────────────────────

function UsersTab() {
    const [users, setUsers] = useState<UserDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [editUser, setEditUser] = useState<UserDto | null>(null);
    const [newPoints, setNewPoints] = useState<number>(0);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        api.admin.getUsers()
            .then(setUsers)
            .catch(() => setError('failed to load users'))
            .finally(() => setLoading(false));
    }, []);

    const openEdit = (u: UserDto) => {
        setEditUser(u);
        setNewPoints(u.loyaltyPoints);
        setError(null);
    };

    const savePoints = async () => {
        if (!editUser) return;
        setSaving(true);
        setError(null);
        try {
            const updated = await api.admin.updateLoyaltyPoints(editUser.id, newPoints);
            setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
            setEditUser(null);
        } catch {
            setError('failed to save points');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Center py={60}><Loader color="#a5b4fc" /></Center>;

    return (
        <>
            <Table highlightOnHover>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>username</Table.Th>
                        <Table.Th>roles</Table.Th>
                        <Table.Th>tier</Table.Th>
                        <Table.Th>points</Table.Th>
                        <Table.Th>member since</Table.Th>
                        <Table.Th />
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {users.map(u => (
                        <Table.Tr key={u.id}>
                            <Table.Td>
                                <Text size="sm" fw={500}>{u.userName}</Text>
                            </Table.Td>
                            <Table.Td>
                                <Group gap={4}>
                                    {u.roles.map(r => (
                                        <Badge key={r} size="xs" color={r === 'Admin' ? '#a5b4fc' : 'gray'} variant="light">
                                            {r.toLowerCase()}
                                        </Badge>
                                    ))}
                                </Group>
                            </Table.Td>
                            <Table.Td>
                                <Badge size="xs" color={TIER_COLORS[u.tier] ?? 'gray'} variant="dot">
                                    {u.tier}
                                </Badge>
                            </Table.Td>
                            <Table.Td>
                                <Text size="sm">{u.loyaltyPoints.toLocaleString()} pts</Text>
                            </Table.Td>
                            <Table.Td>
                                <Text size="xs" c="dimmed">
                                    {u.memberSince ? new Date(u.memberSince).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : '—'}
                                </Text>
                            </Table.Td>
                            <Table.Td>
                                <ActionIcon
                                    size="sm"
                                    variant="subtle"
                                    color="#a5b4fc"
                                    onClick={() => openEdit(u)}
                                    aria-label="edit points"
                                >
                                    <IconPencil size={14} />
                                </ActionIcon>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>

            <Modal
                opened={editUser !== null}
                onClose={() => setEditUser(null)}
                title={
                    <Text size="16pt" className="font-tiempos-headline" fw={300}>
                        edit loyalty points
                    </Text>
                }
                centered
            >
                <Stack gap="md">
                    <Text size="sm" c="dimmed">
                        adjusting points for <strong>{editUser?.userName}</strong>
                    </Text>
                    <NumberInput
                        label="loyalty points"
                        value={newPoints}
                        onChange={v => setNewPoints(typeof v === 'number' ? v : 0)}
                        min={0}
                        step={50}
                    />
                    {error && <Text size="xs" c="red">{error}</Text>}
                    <Group justify="flex-end">
                        <Button variant="subtle" color="gray" size="sm" tt="lowercase" onClick={() => setEditUser(null)}>
                            cancel
                        </Button>
                        <Button
                            variant="outline"
                            color="#a5b4fc"
                            size="sm"
                            tt="lowercase"
                            loading={saving}
                            onClick={savePoints}
                        >
                            save
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </>
    );
}

// ── Menu Items tab ─────────────────────────────────────────────────────────────

const BLANK_FORM: SaveMenuItemDto = {
    name: '',
    description: '',
    basePrice: 0,
    category: 'drinks',
    hasSizes: false,
    smallPrice: null,
    mediumPrice: null,
    largePrice: null,
};

function MenuItemsTab() {
    const [items, setItems] = useState<MenuItemDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editItem, setEditItem] = useState<MenuItemDto | null>(null);
    const [form, setForm] = useState<SaveMenuItemDto>(BLANK_FORM);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<MenuItemDto | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        api.menuItems.getAll()
            .then(setItems)
            .catch(() => setError('failed to load menu items'))
            .finally(() => setLoading(false));
    }, []);

    const openCreate = () => {
        setEditItem(null);
        setForm(BLANK_FORM);
        setImageFile(null);
        setError(null);
        setModalOpen(true);
    };

    const openEdit = (item: MenuItemDto) => {
        setEditItem(item);
        setForm({
            name: item.name,
            description: item.description,
            basePrice: item.basePrice,
            category: item.category,
            hasSizes: item.hasSizes,
            smallPrice: item.smallPrice,
            mediumPrice: item.mediumPrice,
            largePrice: item.largePrice,
        });
        setImageFile(null);
        setError(null);
        setModalOpen(true);
    };

    const save = async () => {
        if (!form.name.trim() || !form.category) {
            setError('name and category are required');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            let saved = editItem
                ? await api.admin.updateMenuItem(editItem.id, form)
                : await api.admin.createMenuItem(form);

            if (imageFile) {
                saved = await api.admin.uploadMenuItemImage(saved.id, imageFile);
            }

            setItems(prev =>
                prev.some(i => i.id === saved.id)
                    ? prev.map(i => i.id === saved.id ? saved : i)
                    : [...prev, saved]
            );
            setModalOpen(false);
        } catch {
            setError('failed to save item');
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await api.admin.deleteMenuItem(deleteTarget.id);
            setItems(prev => prev.filter(i => i.id !== deleteTarget.id));
            setDeleteTarget(null);
        } catch {
            setError('failed to delete item');
        } finally {
            setDeleting(false);
        }
    };

    const grouped = CATEGORIES.map(cat => ({
        cat,
        items: items.filter(i => i.category === cat),
    }));

    if (loading) return <Center py={60}><Loader color="#a5b4fc" /></Center>;

    return (
        <>
            <Group justify="flex-end" mb="md">
                <Button
                    leftSection={<IconPlus size={14} />}
                    variant="outline"
                    color="#a5b4fc"
                    size="sm"
                    tt="lowercase"
                    onClick={openCreate}
                >
                    add item
                </Button>
            </Group>

            {error && <Text size="xs" c="red" mb="sm">{error}</Text>}

            <Stack gap="xl">
                {grouped.map(({ cat, items: catItems }) => (
                    catItems.length === 0 ? null : (
                        <div key={cat}>
                            <Text size="xs" tt="uppercase" c="dimmed" fw={600} mb="xs" style={{ letterSpacing: 2 }}>
                                {cat}
                            </Text>
                            <Table highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>name</Table.Th>
                                        <Table.Th>description</Table.Th>
                                        <Table.Th>price</Table.Th>
                                        <Table.Th>sizes</Table.Th>
                                        <Table.Th>featured</Table.Th>
                                        <Table.Th />
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {catItems.map(item => (
                                        <Table.Tr key={item.id}>
                                            <Table.Td>
                                                <Text size="sm" fw={500}>{item.name}</Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="xs" c="dimmed" lineClamp={1}>{item.description}</Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm">${item.basePrice.toFixed(2)}</Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Badge size="xs" variant="dot" color={item.hasSizes ? '#a5b4fc' : 'gray'}>
                                                    {item.hasSizes ? 'yes' : 'no'}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td>
                                                <ActionIcon
                                                    size="sm"
                                                    variant="subtle"
                                                    color={item.isFeatured ? '#f59e0b' : 'gray'}
                                                    aria-label="toggle featured"
                                                    onClick={async () => {
                                                        const updated = await api.admin.setFeatured(item.id, !item.isFeatured);
                                                        setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
                                                    }}
                                                >
                                                    {item.isFeatured ? <IconStarFilled size={14} /> : <IconStar size={14} />}
                                                </ActionIcon>
                                            </Table.Td>
                                            <Table.Td>
                                                <Group gap={4} justify="flex-end">
                                                    <ActionIcon size="sm" variant="subtle" color="#a5b4fc" onClick={() => openEdit(item)} aria-label="edit">
                                                        <IconPencil size={14} />
                                                    </ActionIcon>
                                                    <ActionIcon size="sm" variant="subtle" color="red" onClick={() => setDeleteTarget(item)} aria-label="delete">
                                                        <IconTrash size={14} />
                                                    </ActionIcon>
                                                </Group>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        </div>
                    )
                ))}
            </Stack>

            {/* Create / Edit modal */}
            <Modal
                opened={modalOpen}
                onClose={() => setModalOpen(false)}
                title={
                    <Text size="16pt" className="font-tiempos-headline" fw={300}>
                        {editItem ? 'edit menu item' : 'new menu item'}
                    </Text>
                }
                centered
                size="md"
            >
                <Stack gap="sm">
                    <TextInput
                        label="name"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        required
                    />
                    <TextInput
                        label="description"
                        value={form.description}
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    />
                    <Select
                        label="category"
                        data={CATEGORIES}
                        value={form.category}
                        onChange={v => setForm(f => ({ ...f, category: v ?? 'drinks' }))}
                        required
                    />
                    <Checkbox
                        label="has sizes (small / medium / large)"
                        checked={form.hasSizes}
                        onChange={e => setForm(f => ({
                            ...f,
                            hasSizes: e.target.checked,
                            smallPrice: e.target.checked ? (f.smallPrice ?? 0) : null,
                            mediumPrice: e.target.checked ? (f.mediumPrice ?? 0) : null,
                            largePrice: e.target.checked ? (f.largePrice ?? 0) : null,
                        }))}
                    />
                    {form.hasSizes ? (
                        <Group grow>
                            <NumberInput
                                label="small price"
                                value={form.smallPrice ?? 0}
                                onChange={v => setForm(f => ({ ...f, smallPrice: typeof v === 'number' ? v : (parseFloat(String(v)) || 0) }))}
                                min={0} step={0.25} prefix="$" decimalScale={2} fixedDecimalScale
                            />
                            <NumberInput
                                label="medium price"
                                value={form.mediumPrice ?? 0}
                                onChange={v => setForm(f => ({ ...f, mediumPrice: typeof v === 'number' ? v : (parseFloat(String(v)) || 0) }))}
                                min={0} step={0.25} prefix="$" decimalScale={2} fixedDecimalScale
                            />
                            <NumberInput
                                label="large price"
                                value={form.largePrice ?? 0}
                                onChange={v => setForm(f => ({ ...f, largePrice: typeof v === 'number' ? v : (parseFloat(String(v)) || 0) }))}
                                min={0} step={0.25} prefix="$" decimalScale={2} fixedDecimalScale
                            />
                        </Group>
                    ) : (
                        <NumberInput
                            label="price"
                            value={form.basePrice}
                            onChange={v => setForm(f => ({ ...f, basePrice: typeof v === 'number' ? v : (parseFloat(String(v)) || 0) }))}
                            min={0} step={0.25} prefix="$" decimalScale={2} fixedDecimalScale
                        />
                    )}
                    <Divider label="image" labelPosition="left" />
                    {editItem?.imageUrl && !imageFile && (
                        <img
                            src={editItem.imageUrl}
                            alt={editItem.name}
                            style={{ width: '100%', borderRadius: 6, objectFit: 'cover', maxHeight: 160 }}
                        />
                    )}
                    {imageFile && (
                        <img
                            src={URL.createObjectURL(imageFile)}
                            alt="preview"
                            style={{ width: '100%', borderRadius: 6, objectFit: 'cover', maxHeight: 160 }}
                        />
                    )}
                    <FileInput
                        label={editItem?.imageUrl ? 'replace image' : 'upload image'}
                        placeholder="choose a jpg, png, or webp file"
                        accept="image/jpeg,image/png,image/webp"
                        value={imageFile}
                        onChange={setImageFile}
                        clearable
                    />
                    {error && <Text size="xs" c="red">{error}</Text>}
                    <Divider />
                    <Group justify="flex-end">
                        <Button variant="subtle" color="gray" size="sm" tt="lowercase" onClick={() => setModalOpen(false)}>
                            cancel
                        </Button>
                        <Button
                            variant="outline"
                            color="#a5b4fc"
                            size="sm"
                            tt="lowercase"
                            loading={saving}
                            onClick={save}
                        >
                            {editItem ? 'save changes' : 'create item'}
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            {/* Delete confirm modal */}
            <Modal
                opened={deleteTarget !== null}
                onClose={() => setDeleteTarget(null)}
                title={
                    <Text size="16pt" className="font-tiempos-headline" fw={300}>
                        delete item
                    </Text>
                }
                centered
                size="sm"
            >
                <Stack gap="md">
                    <Text size="sm">
                        are you sure you want to delete <strong>{deleteTarget?.name}</strong>? this cannot be undone.
                    </Text>
                    <Group justify="flex-end">
                        <Button variant="subtle" color="gray" size="sm" tt="lowercase" onClick={() => setDeleteTarget(null)}>
                            cancel
                        </Button>
                        <Button
                            variant="outline"
                            color="red"
                            size="sm"
                            tt="lowercase"
                            loading={deleting}
                            onClick={confirmDelete}
                        >
                            delete
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </>
    );
}

// ── Main admin page ────────────────────────────────────────────────────────────

export default function Admin() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && (!user || !user.roles.includes('Admin'))) {
            navigate('/');
        }
    }, [user, loading, navigate]);

    if (loading) return <Center style={{ height: 'calc(100vh - 60px)' }}><Loader color="#a5b4fc" /></Center>;
    if (!user || !user.roles.includes('Admin')) return null;

    return (
        <Container size="lg" py="xl">
            <Stack gap="lg">
                <Group gap="xs" align="center">
                    <IconShield size={20} color="#a5b4fc" opacity={0.8} />
                    <Text size="28pt" className="font-tiempos-headline" fw={300}>
                        admin
                    </Text>
                </Group>

                <Card withBorder>
                    <Tabs defaultValue="users" color="#a5b4fc">
                        <Tabs.List mb="lg">
                            <Tabs.Tab value="users" tt="lowercase">users</Tabs.Tab>
                            <Tabs.Tab value="menu" tt="lowercase">menu items</Tabs.Tab>
                        </Tabs.List>

                        <Tabs.Panel value="users">
                            <UsersTab />
                        </Tabs.Panel>

                        <Tabs.Panel value="menu">
                            <MenuItemsTab />
                        </Tabs.Panel>
                    </Tabs>
                </Card>
            </Stack>
        </Container>
    );
}
