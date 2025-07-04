import { useEffect, useState } from 'react';
import {
  IconAlertCircle,
  IconCalendar,
  IconChevronDown,
  IconPackage,
  IconSquareCheck,
  IconUsers,
} from '@tabler/icons-react';
import useSWR from 'swr';
import {
  Alert,
  Button,
  Center,
  Container,
  Group,
  Loader,
  Menu,
  Modal,
  Paper,
  rem,
  Select,
  Text,
  TextInput,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useUserStore } from '../../../utils/authAPI/userApi';
import axios from '../../../utils/axiosInstance';
import { AdminProductsCrud } from './adminProductCards';

interface Category {
  name: string;
  categoryID: string;
}

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function AdminProductsDashboard() {
  const theme = useMantineTheme();

  // Get user role directly from Zustand store
  const { role, isLoading: userLoading } = useUserStore();
  const isEmployee = role === 'employee';

  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<JSX.Element | null>(null);
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState<boolean>(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(
    null
  );

  const { data: CategoryData, error, mutate } = useSWR<Category[]>('category/', fetcher, {});

  // Fetch user data on component mount
  useEffect(() => {
    useUserStore.getState().fetchUserData();
  }, []);

  const handleCreateCategory = async (name: string) => {
    if (!name || name.trim() === '') {
      notifications.show({
        title: 'Error',
        message: 'Category name cannot be empty',
        color: 'red',
      });
      return;
    }

    try {
      await axios.post('category/', { name });
      notifications.show({
        title: 'Category Created',
        message: `Category ${name} has been created successfully`,
        color: 'green',
      });
      mutate(); // Refresh the categories list
      setIsModalOpen(false);
    } catch (error) {
      const errorMessage = (error as any).response?.data?.message || 'Failed to create category';
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
    }
  };

  const handleUpdateCategory = async (categoryID: string, name: string) => {
    if (!categoryID) {
      notifications.show({
        title: 'Error',
        message: 'Please select a category to update',
        color: 'red',
      });
      return;
    }

    if (!name || name.trim() === '') {
      notifications.show({
        title: 'Error',
        message: 'New category name cannot be empty',
        color: 'red',
      });
      return;
    }

    try {
      await axios.put('category/', { categoryID, name });
      notifications.show({
        title: 'Category Updated',
        message: `Category has been updated to "${name}" successfully`,
        color: 'green',
      });
      mutate(); // Refresh the categories list
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      notifications.show({
        title: 'Error',
        message: 'Failed to update category',
        color: 'red',
      });
    }
  };

  const handleDeleteCategory = async (categoryID: string) => {
    try {
      await axios.delete('category/', { data: { categoryID } });
      notifications.show({
        title: 'Category Deleted',
        message: `Category has been deleted successfully`,
        color: 'green',
      });
      mutate(); // Refresh the categories list
      setConfirmDeleteModalOpen(false);
      setCategoryToDelete(null);
    } catch (error) {
      console.error(error);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete category. It might be in use by products.',
        color: 'red',
      });
    }
  };

  const openCreateModal = () => {
    setModalContent(
      <div>
        <TextInput
          label="Category Name"
          placeholder="Enter category name"
          id="create-category-name"
          required
        />
        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              const name = (document.getElementById('create-category-name') as HTMLInputElement)
                .value;
              handleCreateCategory(name);
            }}
          >
            Create
          </Button>
        </Group>
      </div>
    );
    setIsModalOpen(true);
  };

  const openUpdateModal = () => {
    setModalContent(
      <div>
        <Select
          label="Select Category"
          placeholder="Select category"
          data={
            CategoryData?.map((category) => ({
              value: category.categoryID,
              label: category.name,
            })) || []
          }
          id="update-category-id"
          required
        />
        <TextInput
          label="New Category Name"
          placeholder="Enter new category name"
          id="update-category-name"
          mt="md"
          required
        />
        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              const categoryID = (document.getElementById('update-category-id') as HTMLInputElement)
                .value;
              const name = (document.getElementById('update-category-name') as HTMLInputElement)
                .value;
              handleUpdateCategory(categoryID, name);
            }}
          >
            Update
          </Button>
        </Group>
      </div>
    );
    setIsModalOpen(true);
  };

  const openDeleteModal = () => {
    setModalContent(
      <div>
        <Select
          label="Select Category"
          placeholder="Select category"
          data={
            CategoryData?.map((category) => ({
              value: category.categoryID,
              label: category.name,
            })) || []
          }
          id="delete-category-id"
          onChange={(value) => {
            if (value) {
              const category = CategoryData?.find((cat) => cat.categoryID === value);
              if (category) {
                setCategoryToDelete({
                  id: value,
                  name: category.name,
                });
              }
            } else {
              setCategoryToDelete(null);
            }
          }}
          required
        />
        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button
            color="red"
            onClick={() => {
              if (categoryToDelete) {
                setIsModalOpen(false);
                setConfirmDeleteModalOpen(true);
              } else {
                notifications.show({
                  title: 'Error',
                  message: 'Please select a category to delete',
                  color: 'red',
                });
              }
            }}
          >
            Delete
          </Button>
        </Group>
      </div>
    );
    setIsModalOpen(true);
  };

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

  return (
    <Container mt={150}>
      <Group style={{ flex: 1 }}>
        <Select
          data={
            CategoryData?.map((category) => ({
              value: category.categoryID,
              label: category.name,
            })) || []
          }
          placeholder="Select category"
          value={selectedCategory}
          onChange={(value) => setSelectedCategory(value ?? '')}
          searchable
          clearable
        />

        {/* Only show Manage Categories button for non-employees */}
        {!isEmployee && (
          <Menu
            transitionProps={{ transition: 'pop-top-right' }}
            position="top-end"
            width={220}
            withinPortal
          >
            <Menu.Target>
              <Button
                rightSection={
                  <IconChevronDown style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
                }
                pr={12}
              >
                Manage Categories
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={
                  <IconPackage
                    style={{ width: rem(16), height: rem(16) }}
                    color={theme.colors.blue[6]}
                    stroke={1.5}
                  />
                }
                onClick={openCreateModal}
              >
                Create Category
              </Menu.Item>
              <Menu.Item
                leftSection={
                  <IconSquareCheck
                    style={{ width: rem(16), height: rem(16) }}
                    color={theme.colors.yellow[6]}
                    stroke={1.5}
                  />
                }
                onClick={openUpdateModal}
              >
                Update Category
              </Menu.Item>
              <Menu.Item
                leftSection={
                  <IconCalendar
                    style={{ width: rem(16), height: rem(16) }}
                    color={theme.colors.red[6]}
                    stroke={1.5}
                  />
                }
                onClick={openDeleteModal}
              >
                Delete Category
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </Group>

      <Paper shadow="xl" radius="xl" withBorder p="xl" mt={10}>
        <AdminProductsCrud categorySelected={selectedCategory} />
      </Paper>

      <Modal opened={isModalOpen} onClose={() => setIsModalOpen(false)} title="Manage Category">
        {modalContent}
      </Modal>

      {/* Confirmation modal for delete */}
      <Modal
        opened={confirmDeleteModalOpen}
        onClose={() => setConfirmDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <Alert icon={<IconAlertCircle size="1rem" />} title="Warning" color="red" mb="md">
          Deleting a category cannot be undone. Products in this category may be affected.
        </Alert>

        <Text mb="md">
          Are you sure you want to delete the category "{categoryToDelete?.name}"?
        </Text>

        <Group justify="flex-end" mt="xl">
          <Button variant="outline" onClick={() => setConfirmDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button
            color="red"
            onClick={() => categoryToDelete && handleDeleteCategory(categoryToDelete.id)}
          >
            Yes, Delete Category
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}
