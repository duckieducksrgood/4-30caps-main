import { useEffect, useState } from 'react';
import { IconChevronDown, IconPlus, IconTrash, IconX } from '@tabler/icons-react';
import useSWR, { mutate } from 'swr';
import {
  ActionIcon,
  Autocomplete,
  Button,
  Center,
  Group,
  Image,
  LoadingOverlay,
  Menu,
  Modal,
  NumberInput,
  Pagination,
  Paper,
  rem,
  SimpleGrid,
  Text,
  TextInput,
  useMantineTheme,
} from '@mantine/core';
import { Dropzone, FileWithPath, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { notifications } from '@mantine/notifications';
import { useUserStore } from '../../../utils/authAPI/userApi';
// import { theme } from '../theme';
import axios from '../../../utils/axiosInstance';
import classes from './adminProductCards.module.css';

interface Product {
  productID: string;
  name: string;
  price: number;
  product_type: string;
  description: string;
  stock: number;
  productImage: string;
  categoryID: string;
}

interface StatsRingCard {
  categorySelected: string;
}

interface ProductType {
  name: string;
  category: string;
  created_at: string;
  updated_at: string;
}

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export function AdminProductsCrud({ categorySelected }: StatsRingCard) {
  const theme = useMantineTheme();

  // Get user role directly from Zustand store
  const { role, isLoading: userLoading } = useUserStore();
  const isEmployee = role === 'employee';

  // Fetch user data on component mount
  useEffect(() => {
    useUserStore.getState().fetchUserData();
  }, []);

  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [editStockModalOpen, setEditStockModalOpen] = useState(false);
  const [addProductModalOpen, setAddProductModalOpen] = useState(false);
  const [updateProductModalOpen, setUpdateProductModalOpen] = useState(false);
  const [deleteProductModalOpen, setDeleteProductModalOpen] = useState(false); // New state for delete confirmation modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null); // New state for product to delete
  const [newProduct, setNewProduct] = useState<Omit<Product, 'productID'>>({
    name: '',
    price: 0,
    product_type: '',
    description: '',
    stock: 0,
    productImage: '',
    categoryID: categorySelected,
  });
  const [files, setFiles] = useState<FileWithPath[]>([]);
  const [autocompleteValue, setAutocompleteValue] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const { data, mutate: productMutate } = useSWR<Product[]>(
    `products/?category=${categorySelected}`,
    fetcher,
    {
      onSuccess: (data) => setProducts(data),
    }
  );
  const { data: productTypes, error: productTypesError } = useSWR<ProductType>(
    'producttype/',
    fetcher,
    {}
  );
  const [isNewImage, setIsNewImage] = useState<boolean>(false); // Track if a new image is uploaded

  const handleEditStock = async (product: Product) => {
    setSelectedProduct(product);
    setEditStockModalOpen(true);
  };

  const handleUpdateProduct = (product: Product) => {
    setSelectedProduct(product);
    setUpdateProductModalOpen(true);
  };

  const handleSaveStock = async () => {
    try {
      setLoading(true);
      if (selectedProduct) {
        await axios.put(`products/`, {
          productID: selectedProduct.productID,
          stock: selectedProduct.stock,
        });
        setEditStockModalOpen(false);
        notifications.show({
          title: 'Stock updated',
          message: 'Stock updated successfully for the product ' + selectedProduct.name,
          color: 'green',
        });
        productMutate(); // Refresh the products list
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddProduct = async () => {
    const productFormData = new FormData();
    productFormData.append('name', newProduct.name);
    productFormData.append('price', newProduct.price.toString());
    productFormData.append('product_type', newProduct.product_type);
    productFormData.append('description', newProduct.description);
    productFormData.append('stock', newProduct.stock.toString());
    if (files.length > 0) {
      productFormData.append('productImage', files[0]);
    }
    productFormData.append('categoryID', categorySelected);

    try {
      await axios.post('products/', productFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setAddProductModalOpen(false);
      notifications.show({
        title: 'Product Added',
        message: `Product ${newProduct.name} has been added successfully`,
        color: 'blue',
        icon: '🎉',
        autoClose: true,
        autoCloseIn: 5000,
      });
      // Clear form fields
      setNewProduct({
        name: '',
        price: 0,
        product_type: '',
        description: '',
        stock: 0,
        productImage: '',
        categoryID: categorySelected,
      });
      setFiles([]);
      setAutocompleteValue(''); // Clear the Autocomplete input
      productMutate(); // Refresh the products list
    } catch (error) {
      const errorMessage =
        (error as any).response?.data?.message || 'An error occured, please try again later.';
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
    }
  };

  const handleUpdateProductSubmit = async () => {
    if (!selectedProduct) return;

    const productFormData = new FormData();
    productFormData.append('productID', selectedProduct.productID);
    productFormData.append('name', selectedProduct.name);
    productFormData.append('price', selectedProduct.price.toString());
    productFormData.append('product_type', selectedProduct.product_type);
    productFormData.append('description', selectedProduct.description);
    productFormData.append('stock', selectedProduct.stock.toString());
    if (files.length > 0) {
      productFormData.append('productImage', files[0]);
    }

    try {
      await axios.put(`products/`, productFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUpdateProductModalOpen(false);
      notifications.show({
        title: 'Product Updated',
        message: `Product ${selectedProduct.name} has been updated successfully`,
        color: 'blue',
      });
      // Clear selected product
      setSelectedProduct(null);
      setFiles([]);
    } catch (error) {
      console.error(error);
      notifications.show({
        title: 'Error',
        message: 'Failed to update product',
        color: 'red',
      });
    }
    mutate(`products/?category=${categorySelected}`); // Refresh the products list
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      await axios.delete(`products/`, { params: { productID: productToDelete.productID } });
      notifications.show({
        title: 'Product Deleted',
        message: 'The product has been deleted successfully',
        color: 'red',
      });
      mutate(`products/?category=${categorySelected}`); // Refresh the products list
      setDeleteProductModalOpen(false); // Close the confirmation modal
      setProductToDelete(null); // Clear the product to delete
    } catch (error) {
      console.error(error);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete product',
        color: 'red',
      });
    }
  };

  const resetUpdateModal = () => {
    setSelectedProduct(null);
    setFiles([]);
    setIsNewImage(false);
  };

  const filteredProducts = autocompleteValue
    ? products.filter((product) =>
        product.name.toLowerCase().includes(autocompleteValue.toLowerCase())
      )
    : products;

  // Prepare products for pagination
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (userLoading) {
    return (
      <Center mih="50vh">
        <LoadingOverlay visible={true} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
      </Center>
    );
  }

  return (
    <>
      <Group style={{ flex: 1 }}>
        <Autocomplete
          placeholder="Type product name"
          value={autocompleteValue}
          onChange={setAutocompleteValue}
          data={filteredProducts.map((product) => product.name)} // Show only matching products
          rightSection={
            <ActionIcon onClick={() => setAutocompleteValue('')} variant="subtle">
              <IconX size={16} />
            </ActionIcon>
          } // Allow clearing the input
        />

        {/* Only show Manage Products menu for non-employees */}
        {!isEmployee && (
          <Menu
            transitionProps={{ transition: 'pop-top-right' }}
            position="top-end"
            width={220}
            withinPortal
            disabled={!categorySelected} // Disable the menu if no category is selected
          >
            <Menu.Target>
              <Button
                rightSection={
                  <IconChevronDown style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
                }
                pr={12}
                disabled={!categorySelected} // Disable the button if no category is selected
              >
                Manage Products
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={
                  <IconPlus
                    style={{ width: rem(16), height: rem(16) }}
                    color={theme.colors.blue[6]}
                    stroke={1.5}
                  />
                }
                onClick={() => setAddProductModalOpen(true)}
              >
                Add Product
              </Menu.Item>
              <Menu.Item
                leftSection={
                  <IconTrash
                    style={{ width: rem(16), height: rem(16) }}
                    color={theme.colors.red[6]}
                    stroke={1.5}
                  />
                }
                onClick={() => setDeleteProductModalOpen(true)}
              >
                Delete Product
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </Group>

      {paginatedProducts.map((product) => (
        <Paper
          shadow="xl"
          radius={'xl'}
          m={10}
          key={product.productID}
          className={classes.card}
          p={50}
        >
          <Group p="apart">
            <div>
              <Text w={500}>{product.name}</Text>
              <Text size="sm" color="dimmed">
                {product.description}
              </Text>
              <Text size="sm" color="dimmed">
                Type: {product.product_type}
              </Text>
              <Text size="sm" color="dimmed">
                Price: ₱{product.price}
              </Text>
              <Text size="sm" color="dimmed">
                Stock: {product.stock}
              </Text>
            </div>
            <Image src={`${product.productImage}`} alt={product.name} width={100} height={100} />
          </Group>

          {/* Only show action buttons for non-employees */}
          {!isEmployee && (
            <Group p="apart" mt="md">
              <Button onClick={() => handleEditStock(product)}>Edit Stock</Button>
              <Button onClick={() => handleUpdateProduct(product)}>Update</Button>
              <Button
                color="red"
                onClick={() => {
                  setProductToDelete(product);
                  setDeleteProductModalOpen(true);
                }}
              >
                Delete
              </Button>
            </Group>
          )}
        </Paper>
      ))}

      <Center>
        <Pagination
          total={totalPages}
          onChange={setCurrentPage}
          value={currentPage}
          mt="md"
          color="blue"
        />
      </Center>

      {/* Modals - These will only be accessible if the action buttons are shown (for non-employees) */}
      <Modal
        opened={editStockModalOpen}
        onClose={() => setEditStockModalOpen(false)}
        title="Edit Stock"
      >
        <NumberInput
          label="Stock"
          value={selectedProduct?.stock}
          onChange={(value) =>
            setSelectedProduct((prev) =>
              prev ? { ...prev, stock: typeof value === 'number' ? value : 0 } : null
            )
          }
        />
        <Button onClick={handleSaveStock} mt="md">
          Save
        </Button>
      </Modal>

      {/* add product */}
      <Modal
        opened={addProductModalOpen}
        onClose={() => setAddProductModalOpen(false)}
        title="Add Product"
      >
        <TextInput
          label="Product Name"
          value={newProduct.name}
          onChange={(event) => setNewProduct({ ...newProduct, name: event.currentTarget.value })}
        />
        <NumberInput
          label="Price"
          value={newProduct.price}
          onChange={(value) =>
            setNewProduct({ ...newProduct, price: typeof value === 'number' ? value : 0 })
          }
        />
        <Autocomplete
          data={
            Array.isArray(productTypes)
              ? productTypes.map((product: { name: any }) => product.name)
              : []
          }
          label="Product Type"
          value={newProduct.product_type}
          onChange={(value) => setNewProduct({ ...newProduct, product_type: value })}
        />
        <TextInput
          label="Description"
          value={newProduct.description}
          onChange={(event) =>
            setNewProduct({ ...newProduct, description: event.currentTarget.value })
          }
        />
        <NumberInput
          label="Stock"
          value={newProduct.stock}
          onChange={(value) =>
            setNewProduct({ ...newProduct, stock: typeof value === 'number' ? value : 0 })
          }
        />
        <Dropzone
          accept={IMAGE_MIME_TYPE}
          onDrop={setFiles}
          style={{ marginBottom: '20px' }}
          mt={20}
        >
          <Text>Drag files here or click to select files</Text>
        </Dropzone>
        <SimpleGrid cols={4} mt={files.length > 0 ? 'xl' : 0}>
          {files.map((file, index) => {
            const imageUrl = URL.createObjectURL(file);
            return (
              <Center key={index}>
                <Image
                  src={imageUrl}
                  onLoad={() => URL.revokeObjectURL(imageUrl)}
                  style={{
                    margin: '0 auto',
                    maxWidth: '100%',
                    maxHeight: '300px',
                  }}
                />
              </Center>
            );
          })}
        </SimpleGrid>

        <Button onClick={handleAddProduct} mt="md">
          Add Product
        </Button>
      </Modal>

      <Modal
        opened={updateProductModalOpen}
        onClose={() => {
          setUpdateProductModalOpen(false);
          resetUpdateModal();
        }}
        title="Update Product"
      >
        <TextInput
          label="Product Name"
          value={selectedProduct?.name}
          onChange={(event) =>
            setSelectedProduct((prev) =>
              prev ? { ...prev, name: event.currentTarget.value } : null
            )
          }
        />
        <NumberInput
          label="Price"
          value={selectedProduct?.price}
          onChange={(value) =>
            setSelectedProduct((prev) =>
              prev ? { ...prev, price: typeof value === 'number' ? value : 0 } : null
            )
          }
        />
        <TextInput
          label="Product Type"
          value={selectedProduct?.product_type}
          onChange={(event) =>
            setSelectedProduct((prev) =>
              prev ? { ...prev, product_type: event.currentTarget.value } : null
            )
          }
        />
        <TextInput
          label="Description"
          value={selectedProduct?.description}
          onChange={(event) =>
            setSelectedProduct((prev) =>
              prev ? { ...prev, description: event.currentTarget.value } : null
            )
          }
        />
        <NumberInput
          label="Stock"
          value={selectedProduct?.stock}
          onChange={(value) =>
            setSelectedProduct((prev) =>
              prev ? { ...prev, stock: typeof value === 'number' ? value : 0 } : null
            )
          }
        />

        <Dropzone accept={IMAGE_MIME_TYPE} onDrop={setFiles} mt={50}>
          <Text ta="center">Drop images here</Text>
        </Dropzone>

        <>
          {files.length ? (
            <>
              <Text ta="center" size="lg" w={500} color={'black'}>
                New Product Image
              </Text>
              {files.map((file, index) => {
                const imageUrl = URL.createObjectURL(file);
                return (
                  <Image
                    key={index}
                    src={imageUrl}
                    onLoad={() => URL.revokeObjectURL(imageUrl)}
                    alt="New Product"
                    style={{
                      display: 'block',
                      margin: '0 auto',
                      maxWidth: '100%',
                      maxHeight: '300px',
                    }}
                  />
                );
              })}
            </>
          ) : (
            <>
              <Text ta="center" size="lg" w={500} color={'black'}>
                Old Product Image
              </Text>
              <img
                src={`http://localhost:8000${selectedProduct?.productImage}`}
                alt={selectedProduct?.name}
                style={{ display: 'block', margin: '0 auto', maxWidth: '100%', maxHeight: '300px' }}
              />
            </>
          )}
        </>
        <Center>
          <Button onClick={handleUpdateProductSubmit} mt="md">
            Update Product
          </Button>
        </Center>
      </Modal>

      <Modal
        opened={deleteProductModalOpen}
        onClose={() => setDeleteProductModalOpen(false)}
        title="Confirm Delete"
      >
        <Autocomplete
          placeholder="Search product to delete"
          value={productToDelete?.name || ''}
          onChange={(value) => {
            const product = products.find((p) => p.name === value);
            setProductToDelete(product || null);
          }}
          data={products.map((product) => product.name)}
        />
        <Text mt="md">Are you sure you want to delete this product?</Text>
        <Group justify="center" mt="md">
          <Button color="red" onClick={handleDeleteProduct} disabled={!productToDelete}>
            Yes, Delete
          </Button>
          <Button onClick={() => setDeleteProductModalOpen(false)}>Cancel</Button>
        </Group>
      </Modal>
    </>
  );
}
