import { useEffect, useState } from 'react';
import { IconAlertCircle, IconEdit, IconKey, IconTrash } from '@tabler/icons-react';
import useSWR from 'swr';
import {
  ActionIcon,
  Alert,
  Autocomplete,
  Avatar,
  Badge,
  Button,
  Card,
  Center,
  Container,
  Divider,
  FileInput,
  Group,
  Loader,
  Modal,
  Pagination,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useUserStore } from '../../../utils/authAPI/userApi';
import axios from '../../../utils/axiosInstance';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  role: string;
  profile_picture: string | null;
}

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function UserTable() {
  // Get user role directly from Zustand store
  const { role, isLoading: userLoading } = useUserStore();
  const isAdmin = role === 'admin';

  // Fetch user data on component mount
  useEffect(() => {
    useUserStore.getState().fetchUserData();
  }, []);

  const { data, error, mutate } = useSWR<User[]>('users/', fetcher);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [password, setPassword] = useState('');
  const [newProfilePic, setNewProfilePic] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [autocompleteValue, setAutocompleteValue] = useState<string>('');
  const [sortCriteria, setSortCriteria] = useState<keyof User>('first_name');
  const itemsPerPage = 5;

  if (userLoading) {
    return (
      <Center mih="50vh" style={{ flexDirection: 'column' }}>
        <Loader size="lg" color="blue" />
        <Text mt="md" c="dimmed">
          Loading, please wait...
        </Text>
      </Center>
    );
  }

  if (error) {
    return (
      <Center mih="50vh">
        <Alert
          icon={<IconAlertCircle size="1.2rem" />}
          title="Error"
          color="red"
          radius="md"
          variant="light"
        >
          Failed to load. Please try again later.
        </Alert>
      </Center>
    );
  }

  if (!data) {
    return (
      <Center mih="50vh" style={{ flexDirection: 'column' }}>
        <Loader size="lg" color="blue" />
        <Text mt="md" c="dimmed">
          Loading, please wait...
        </Text>
      </Center>
    );
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleChangePassword = (user: User) => {
    setSelectedUser(user);
    setPasswordModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    const formData = new FormData();
    formData.append('first_name', selectedUser.first_name);
    formData.append('last_name', selectedUser.last_name);
    formData.append('email', selectedUser.email);
    formData.append('username', selectedUser.username);
    if (newProfilePic) {
      formData.append('profile_picture', newProfilePic);
    }

    try {
      await axios.put(`users/?user_id=${selectedUser.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      notifications.show({
        title: 'User Updated',
        message: `User ${selectedUser.username} has been updated successfully`,
        color: 'blue',
      });
      setEditModalOpen(false);
      setNewProfilePic(null);
      mutate();
    } catch (error) {
      console.error(error);
      notifications.show({
        title: 'Error',
        message: 'Failed to update user',
        color: 'red',
      });
    }
  };

  const handleSavePassword = async () => {
    if (!selectedUser) return;

    try {
      await axios.put(`users/?user_id=${selectedUser.id}`, { password });
      notifications.show({
        title: 'Password Changed',
        message: `Password for ${selectedUser.username} has been changed successfully`,
        color: 'blue',
      });
      setPasswordModalOpen(false);
      setPassword('');
    } catch (error) {
      console.error(error);
      notifications.show({
        title: 'Error',
        message: 'Failed to change password',
        color: 'red',
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    try {
      await axios.delete(`users/${selectedUser.id}/`);
      notifications.show({
        title: 'User Deleted',
        message: `User ${selectedUser.username} has been deleted successfully`,
        color: 'red',
      });
      setDeleteModalOpen(false);
      mutate();
    } catch (error) {
      console.error(error);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete user',
        color: 'red',
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedUser((prev) => (prev ? { ...prev, [e.target.name]: e.target.value } : null));
  };

  const handleFileChange = (file: File | null) => {
    setNewProfilePic(file);
  };

  // Filter and sort users
  const filteredUsers = data
    .filter((user) =>
      [user.first_name, user.last_name, user.email, user.username]
        .join(' ')
        .toLowerCase()
        .includes(autocompleteValue.toLowerCase())
    )
    .sort((a, b) => {
      if (a[sortCriteria] && b[sortCriteria] && a[sortCriteria] < b[sortCriteria]) return -1;
      if (a[sortCriteria] && b[sortCriteria] && a[sortCriteria] > b[sortCriteria]) return 1;
      return 0;
    });

  // Paginate users
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const rows = paginatedUsers.map((user) => (
    <Table.Tr key={user.id}>
      <Table.Td>{user.first_name}</Table.Td>
      <Table.Td>{user.last_name}</Table.Td>
      <Table.Td>{user.email}</Table.Td>
      <Table.Td>{user.username}</Table.Td>
      <Table.Td>
        <Badge
          color={user.role === 'admin' ? 'blue' : user.role === 'employee' ? 'yellow' : 'green'}
        >
          {user.role}
        </Badge>
      </Table.Td>

      {/* Only show action buttons for admin users */}
      {isAdmin && (
        <Table.Td>
          <Group gap="xs">
            <ActionIcon onClick={() => handleEditUser(user)}>
              <IconEdit size={16} />
            </ActionIcon>
            <ActionIcon onClick={() => handleChangePassword(user)}>
              <IconKey size={16} />
            </ActionIcon>
            <ActionIcon onClick={() => handleDeleteUser(user)}>
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        </Table.Td>
      )}
    </Table.Tr>
  ));

  return (
    <>
      <Title order={2} mb="md">
        User Management
      </Title>

      <Group mb="md" grow>
        <Autocomplete
          placeholder="Search users"
          value={autocompleteValue}
          onChange={setAutocompleteValue}
          data={data.map((user) => `${user.first_name} ${user.last_name} `)}
        />
        <Select
          placeholder="Sort by"
          value={sortCriteria}
          onChange={(value) => setSortCriteria((value as keyof User) || 'first_name')}
          data={[
            { value: 'first_name', label: 'First Name' },
            { value: 'last_name', label: 'Last Name' },
            { value: 'email', label: 'Email' },
            { value: 'username', label: 'Username' },
          ]}
          clearable
        />
      </Group>

      <Table.ScrollContainer minWidth={500}>
        <Table stickyHeader striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>First Name</Table.Th>
              <Table.Th>Last Name</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Username</Table.Th>
              <Table.Th>Role</Table.Th>
              {isAdmin && <Table.Th>Actions</Table.Th>}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Table.ScrollContainer>
      <Center>
        <Pagination
          total={totalPages}
          onChange={setCurrentPage}
          value={currentPage}
          mt="md"
          color="blue"
        />
      </Center>

      {/* Only render modals if user is admin - these won't be accessible to employees */}
      {isAdmin && (
        <>
          <Modal opened={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit User">
            {selectedUser && (
              <>
                <Group justify="center" mb="lg" px={'md'}>
                  <Stack justify="center" px={'md'}>
                    <Avatar
                      size={120}
                      radius={60}
                      src={`http://localhost:8000${selectedUser.profile_picture}` || null}
                      alt="Profile Picture"
                    />
                    <Text mx={'auto'}>Old Picture</Text>
                  </Stack>

                  {newProfilePic && (
                    <Stack justify="center" px={'md'}>
                      <Avatar
                        size={120}
                        radius={60}
                        src={newProfilePic ? URL.createObjectURL(newProfilePic) : null}
                        alt="New Profile Picture Preview"
                      />
                      <Text mx={'auto'}>New Picture</Text>
                    </Stack>
                  )}
                </Group>

                <Group justify="center" mb="md">
                  <FileInput
                    label="Upload New Profile Picture"
                    accept="image/*"
                    onChange={handleFileChange}
                    placeholder="Select a new profile picture"
                  />
                </Group>

                <TextInput
                  label="First Name"
                  name="first_name"
                  value={selectedUser.first_name}
                  onChange={handleInputChange}
                  mb="md"
                />
                <TextInput
                  label="Last Name"
                  name="last_name"
                  value={selectedUser.last_name}
                  onChange={handleInputChange}
                  mb="md"
                />
                <TextInput
                  label="Email"
                  name="email"
                  value={selectedUser.email}
                  onChange={handleInputChange}
                  mb="md"
                />
                <TextInput
                  label="Username"
                  name="username"
                  value={selectedUser.username}
                  onChange={handleInputChange}
                  mb="md"
                />
                <Group justify="flex-end" mt="md">
                  <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveUser}>Save</Button>
                </Group>
              </>
            )}
          </Modal>

          <Modal
            opened={passwordModalOpen}
            onClose={() => setPasswordModalOpen(false)}
            title="Change Password"
          >
            <TextInput
              label="New Password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={() => setPasswordModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSavePassword}>Change Password</Button>
            </Group>
          </Modal>

          <Modal
            opened={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            title="Confirm Delete"
          >
            <Alert icon={<IconAlertCircle size="1rem" />} title="Warning" color="red" mb="md">
              Deleting a user will remove all their data and cannot be undone.
            </Alert>
            <Text mb="md">
              Are you sure you want to delete the user <strong>{selectedUser?.username}</strong>?
            </Text>
            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button color="red" onClick={handleConfirmDelete}>
                Yes, Delete User
              </Button>
            </Group>
          </Modal>
        </>
      )}
    </>
  );
}
