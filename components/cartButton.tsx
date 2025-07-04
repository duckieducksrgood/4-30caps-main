import React, { useEffect, useState } from 'react';
import { IconPhoto, IconShoppingCart, IconTrash, IconUpload, IconX } from '@tabler/icons-react';
import useSWR from 'swr';
import {
  ActionIcon,
  Button,
  Card,
  Center,
  Checkbox,
  Drawer,
  Group,
  Image,
  Loader,
  Modal,
  Select,
  Text,
  TextInput,
} from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import axios from '../utils/axiosInstance';
import classes from './CartButton.module.css';

interface Cart {
  id: number;
  cart_id: number;
  cart_items: string;
  cart_items_quantity: number;
  cart_user: string;
  cart_price: number;
  cart_item_image: string;
}

interface Product {
  productID: string;
  stock: number;
}

interface User {
  delivery_address: string;
}

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function CartButton() {
  const [opened, { open, close }] = useDisclosure(false);
  const [checkoutModalOpened, { open: openCheckoutModal, close: closeCheckoutModal }] =
    useDisclosure(false);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] =
    useDisclosure(false);
  const [selectedItems, setSelectedItems] = useState<Cart[]>([]);
  const [cartItems, setCartItems] = useState<Cart[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [itemToDelete, setItemToDelete] = useState<Cart | null>(null);
  const [outOfStockItems, setOutOfStockItems] = useState<Cart[]>([]);
  const [useNewAddress, setUseNewAddress] = useState<boolean>(false);
  const [newDeliveryAddress, setNewDeliveryAddress] = useState<string>('');
  const [currentDeliveryAddress, setCurrentDeliveryAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('COD'); // Add state for payment method
  // Add these state variables inside your CartButton component
  const [paymentQrUrl, setPaymentQrUrl] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  // Add these state variables inside your CartButton component
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Add this function to handle file uploads
  const handleFileUpload = async (files: File[]) => {
    if (files.length > 0) {
      setPaymentProofFile(files[0]);

      try {
        // Generate a presigned URL for the upload
        const response = await axios.post('generate-presigned-url/', {
          file_name: `${Date.now()}-${files[0].name}`,
          file_type: files[0].type,
        });

        if (response.data && response.data.url && response.data.fields) {
          // Create a FormData object to upload the file
          const formData = new FormData();

          // Add all the fields from the presigned URL
          Object.entries(response.data.fields).forEach(([key, value]) => {
            formData.append(key, value as string);
          });

          // Add the file as the last field
          formData.append('file', files[0]);

          // Upload to S3 using the presigned URL
          const uploadResponse = await axios.post(response.data.url, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                setUploadProgress(percentCompleted);
              }
            },
          });

          if (uploadResponse.status === 204) {
            // Upload successful
            notifications.show({
              title: 'Upload Successful',
              message: 'Your payment proof was uploaded successfully',
              color: 'green',
            });

            // Store the uploaded file name for the order
            const fileName = `${Date.now()}-${files[0].name}`;

            // Now proceed with the order
            processOrderWithPaymentProof(fileName);
          }
        }
      } catch (error) {
        console.error('Failed to upload payment proof:', error);
        notifications.show({
          title: 'Upload Failed',
          message: 'Failed to upload payment proof. Please try again.',
          color: 'red',
        });
      }
    }
  };

  // Add this function to process the order with payment proof
  const processOrderWithPaymentProof = async (paymentProofFileName: string) => {
    try {
      const cartIds = selectedItems.map((item) => item.cart_id);
      const deliveryAddress = useNewAddress ? newDeliveryAddress : currentDeliveryAddress;

      const response = await axios.post('order/', {
        cart_id: cartIds,
        total_price: totalPrice,
        delivery_date: new Date().toISOString(),
        status: 'PENDING',
        delivery_address: deliveryAddress,
        payment_method: paymentMethod,
        payment_proof: `payment/images/${paymentProofFileName}`,
      });

      if (response.status === 201) {
        // Remove selected items from cartItems state
        setCartItems((prevCartItems) =>
          prevCartItems.filter((item) => !cartIds.includes(item.cart_id))
        );

        // Reset state and close modals
        setSelectedItems([]);
        closeCheckoutModal();
        setShowUploadModal(false);
        setTotalPrice(0);
        close();

        // Show success notification
        notifications.show({
          title: 'Order Placed Successfully',
          message: `Your order #${response.data.order_id} has been placed! You'll receive a confirmation email with details.`,
          color: 'green',
          autoClose: 5000,
        });
      }
    } catch (error: any) {
      console.error('Failed to place order:', error);

      // Add better error handling here similar to handleCheckout
      if (error.response) {
        notifications.show({
          title: 'Order Failed',
          message: error.response.data.message || 'Something went wrong with your order',
          color: 'red',
        });
      } else if (error.request) {
        notifications.show({
          title: 'Network Error',
          message: 'Could not connect to the server. Please check your internet connection.',
          color: 'red',
        });
      } else {
        notifications.show({
          title: 'Error',
          message: error.message || 'An unexpected error occurred',
          color: 'red',
        });
      }
    }
  };
  // Add this useEffect to fetch the QR code when payment method changes to ONLINE
  useEffect(() => {
    const fetchPaymentQr = async () => {
      if (paymentMethod === 'ONLINE') {
        try {
          const response = await axios.get('paymentqr/');
          if (response.data && response.data.payment_qr) {
            setPaymentQrUrl(response.data.payment_qr);
          }
        } catch (error) {
          console.error('Failed to fetch payment QR:', error);
        }
      }
    };

    fetchPaymentQr();
  }, [paymentMethod]);

  // Add this function to open the QR modal
  const openQrModal = () => {
    if (paymentMethod === 'ONLINE') {
      setShowQrModal(true);
    }
  };
  const { data: products } = useSWR('products/', fetcher, {
    refreshInterval: 1000,
  });
  const { data: cartItemsSWR } = useSWR('carts/', fetcher, {
    refreshInterval: 1000,
    onSuccess: (data) => {
      setCartItems(cartItemsSWR);
      if (data && products) {
        const outOfStock = data.filter((cartItem: Cart) => {
          const product = products.find((p: Product) => p.productID === cartItem.cart_items);
          return product && cartItem.cart_items_quantity > product.stock;
        });
        setOutOfStockItems(outOfStock);
      }
    },
  });

  const { data: user } = useSWR<User>('profile/', fetcher, {
    onSuccess: (data) => {
      setCurrentDeliveryAddress(data.delivery_address);
    },
  });

  if (!cartItems || cartItems.length === 0) {
    return (
      <div>
        <ActionIcon onClick={open} size="lg">
          <IconShoppingCart size={24} />
        </ActionIcon>
        <Drawer opened={opened} onClose={close} title="Your Cart" padding="md" position="right">
          <Group justify="center" align="column" gap="md" style={{ textAlign: 'center' }}>
            <IconShoppingCart size={48} color="gray" />
            <Text size="lg" w={500}>
              Your cart is empty
            </Text>
            <Text size="sm" color="dimmed">
              Add items to your cart to see them here.
            </Text>
          </Group>
        </Drawer>
      </div>
    );
  }

  if (!cartItems) {
    return (
      <Center mih="50vh" style={{ flexDirection: 'column' }}>
        <Loader size="lg" color="blue" />
        <Text mt="md" c="dimmed">
          Loading your cart items...
        </Text>
      </Center>
    );
  }

  const handleDelete = (cartItem: Cart) => {
    setItemToDelete(cartItem);
    openDeleteModal();
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      // Send a request to the server to delete the item
      await axios.delete(`carts/`, { data: { cart_id: itemToDelete.cart_id } });

      // Update the state locally
      setCartItems((prevCartItems) =>
        prevCartItems.filter((item) => item.cart_id !== itemToDelete.cart_id)
      );
      setSelectedItems((prevSelectedItems) =>
        prevSelectedItems.filter((item) => item.cart_id !== itemToDelete.cart_id)
      );
      closeDeleteModal();

      // Show success notification
      notifications.show({
        title: 'Item Deleted',
        message: 'The item has been successfully deleted from your cart.',
        color: 'green',
      });
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const handleSelect = (cartItem: Cart, checked: boolean) => {
    setSelectedItems((prevSelectedItems) => {
      const newSelectedItems = checked
        ? [...prevSelectedItems, cartItem]
        : prevSelectedItems.filter((item) => item.cart_id !== cartItem.cart_id);
      const newTotalPrice = newSelectedItems.reduce((total, item) => {
        const quantity = Number(item.cart_items_quantity);
        const price = Number(item.cart_price);
        return total + quantity * price;
      }, 0);
      setTotalPrice(newTotalPrice);
      return newSelectedItems;
    });
  };

  // Update the handleCheckout function

  const handleCheckout = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    try {
      setCheckoutLoading(true);
      // If payment method is ONLINE, show QR code first
      if (paymentMethod === 'ONLINE') {
        openQrModal();
        return;
      }

      const cartIds = selectedItems.map((item) => item.cart_id);

      const deliveryAddress = useNewAddress ? newDeliveryAddress : currentDeliveryAddress;
      const response = await axios.post('order/', {
        cart_id: cartIds,
        total_price: totalPrice,
        delivery_date: new Date().toISOString(),
        status: 'PENDING',
        delivery_address: deliveryAddress,
        payment_method: paymentMethod,
      });

      if (response.status === 201) {
        // Remove selected items from cartItems state
        setCartItems((prevCartItems) =>
          prevCartItems.filter((item) => !cartIds.includes(item.cart_id))
        );

        // Reset state and close modals
        setSelectedItems([]);
        closeCheckoutModal();
        setTotalPrice(0);
        setShowQrModal(false);
        close();

        // Show success notification
        notifications.show({
          title: 'Order Placed Successfully',
          message: `Your order #${response.data.order_id} has been placed! You'll receive a confirmation email with details.`,
          color: 'green',
          autoClose: 5000,
        });
      }
    } catch (error: any) {
      // Error handling code remains the same
    }
    setCheckoutLoading(false);
  };

  return (
    <div>
      <ActionIcon onClick={open} size="lg">
        <IconShoppingCart size={24} />
      </ActionIcon>
      <Drawer opened={opened} onClose={close} title="Your Cart" padding="md" position="right">
        {cartItems
          .filter((item) => !outOfStockItems.includes(item))
          .map((item) => {
            const isSelected = selectedItems.some(
              (selectedItem) => selectedItem.cart_id === item.cart_id
            );

            return (
              <Card
                key={item.cart_id}
                shadow="sm"
                padding="lg"
                style={{
                  marginBottom: '10px',
                  border: isSelected
                    ? '2px solid var(--mantine-color-blue-6)'
                    : '1px solid var(--mantine-color-gray-3)',
                  backgroundColor: isSelected ? 'var(--mantine-color-blue-0)' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => handleSelect(item, !isSelected)}
              >
                <Group justify="apart" align="flex-start">
                  <Group align="flex-start" style={{ flexGrow: 1 }}>
                    <div style={{ marginTop: '4px' }}>
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) => {
                          // Prevent the card click handler from being triggered
                          e.stopPropagation();
                          handleSelect(item, e.currentTarget.checked);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        style={{ pointerEvents: 'none' }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <Text fw={500} size="md" style={{ marginBottom: '5px' }}>
                        {item.cart_items}
                      </Text>
                      <Text size="sm" color="dimmed">
                        Quantity: {item.cart_items_quantity}
                      </Text>
                      <Text size="sm" c="dimmed">
                        User: {item.cart_user}
                      </Text>
                      <Text size="sm" c="dimmed">
                        Price: ₱{item.cart_price}
                      </Text>
                    </div>
                  </Group>
                  <Group align="center" gap="xs">
                    <Image src={`${item.cart_item_image}`} width={60} height={60} />
                    <ActionIcon
                      color="red"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item);
                      }}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Card>
            );
          })}
        <Text size="lg" w={500} mt="md">
          Total: ₱{totalPrice.toFixed(2)}
        </Text>
        <Button fullWidth mt="md" disabled={selectedItems.length === 0} onClick={openCheckoutModal}>
          Checkout
        </Button>
        <Text size="sm" c="dimmed" mt="md">
          An email about the order after checkout will be sent to your registered email address.
        </Text>

        {/* Out of stock items section - unchanged */}
        {outOfStockItems.length > 0 && (
          <>
            <Text size="lg" w={500} mt="md" c="red">
              Out of Stock Items
            </Text>
            {outOfStockItems.map((item) => (
              <Card key={item.cart_id} shadow="sm" padding="lg" style={{ marginBottom: '10px' }}>
                <Group justify="apart" align="center">
                  <div style={{ flex: 1, marginLeft: '10px' }}>
                    <Text w={500}>{item.cart_items}</Text>
                    <Text size="sm" color="dimmed">
                      Quantity: {item.cart_items_quantity}
                    </Text>
                    <Text size="sm" color="dimmed">
                      User: {item.cart_user}
                    </Text>
                    <Text size="sm" color="dimmed">
                      Price: ₱{item.cart_price}
                    </Text>
                  </div>
                  <ActionIcon color="red" onClick={() => handleDelete(item)}>
                    <IconTrash size={16} />
                  </ActionIcon>
                  <Image src={`${item.cart_item_image}`} width={50} height={50} />
                </Group>
              </Card>
            ))}
          </>
        )}
      </Drawer>
      <Modal opened={checkoutModalOpened} onClose={closeCheckoutModal} title="Confirm Checkout">
        <Text size="lg" mb="md">
          You are about to checkout the following items:
        </Text>
        {selectedItems.map((item) => (
          <div key={item.cart_id}>
            <Text>
              {item.cart_items} - Quantity: {item.cart_items_quantity} - Price: ₱{item.cart_price}
            </Text>
          </div>
        ))}
        <Text size="lg" mt="md">
          Total: ₱{totalPrice.toFixed(2)}
        </Text>
        <Text size="lg" mt="md">
          Current Delivery Address: {currentDeliveryAddress}
        </Text>
        <Checkbox
          label="Use a new delivery address"
          checked={useNewAddress}
          onChange={(e) => setUseNewAddress(e.currentTarget.checked)}
          mt="md"
        />
        {useNewAddress && (
          <>
            <TextInput
              label="New Delivery Address"
              placeholder="Enter new delivery address"
              value={newDeliveryAddress}
              onChange={(e) => setNewDeliveryAddress(e.currentTarget.value)}
              error={newDeliveryAddress.trim() === '' ? 'New delivery address is required' : null}
              mt="md"
              required
            />
          </>
        )}
        <Select
          label="Payment Method"
          placeholder="Select payment method"
          value={paymentMethod}
          onChange={(value) => setPaymentMethod(value || 'COD')}
          data={[
            { value: 'COD', label: 'Cash on Delivery (COD)' },
            { value: 'ONLINE', label: 'Online Payment (QR Code)' },
          ]}
          description={
            paymentMethod === 'ONLINE' ? 'You will need to scan a QR code to complete payment' : ''
          }
          mt="md"
        />
        <Button
          fullWidth
          mt="md"
          onClick={handleCheckout}
          disabled={useNewAddress && newDeliveryAddress.trim() === ''}
          loading={checkoutLoading}
        >
          Confirm and Place Order
        </Button>
      </Modal>
      <Modal opened={deleteModalOpened} onClose={closeDeleteModal} title="Confirm Deletion">
        <Text size="lg" mb="md">
          Are you sure you want to delete this item from your cart?
        </Text>
        {itemToDelete && (
          <div>
            <Text>
              {itemToDelete.cart_items} - Quantity: {itemToDelete.cart_items_quantity} - Price: ₱
              {itemToDelete.cart_price}
            </Text>
          </div>
        )}
        <Group mt="md" justify="right">
          <Button variant="outline" onClick={closeDeleteModal}>
            Cancel
          </Button>
          <Button color="red" onClick={confirmDelete}>
            Delete
          </Button>
        </Group>
      </Modal>
      <Modal
        opened={showQrModal}
        onClose={() => setShowQrModal(false)}
        title="Payment QR Code"
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Text size="md" mb="md">
            Please scan the QR code below to complete your payment.
          </Text>
          {paymentQrUrl ? (
            <Image
              src={paymentQrUrl}
              alt="Payment QR"
              width={250}
              height={250}
              style={{ marginBottom: '20px' }}
            />
          ) : (
            <Text>Loading QR code...</Text>
          )}
          <Text size="sm" mb="lg" color="dimmed" ta="center">
            After completing the payment, upload your payment proof below.
            <Text c="red">STRICTLY NO REFUNDS.</Text>
          </Text>

          {/* Payment Proof Upload Dropzone */}
          <Dropzone
            onDrop={handleFileUpload}
            onReject={(files) => console.log('rejected files', files)}
            maxSize={5 * 1024 ** 2}
            accept={IMAGE_MIME_TYPE}
            mb="md"
          >
            <Group justify="center" gap="xl" mih={150} style={{ pointerEvents: 'none' }}>
              <Dropzone.Accept>
                <IconUpload size={40} color="var(--mantine-color-blue-6)" stroke={1.5} />
              </Dropzone.Accept>
              <Dropzone.Reject>
                <IconX size={40} color="var(--mantine-color-red-6)" stroke={1.5} />
              </Dropzone.Reject>
              <Dropzone.Idle>
                <IconPhoto size={40} color="var(--mantine-color-dimmed)" stroke={1.5} />
              </Dropzone.Idle>

              <div>
                <Text size="md" inline>
                  Upload payment proof
                </Text>
                <Text size="sm" c="dimmed" inline mt={7}>
                  Drag your payment screenshot here or click to select
                </Text>
              </div>
            </Group>
          </Dropzone>

          {paymentProofFile && (
            <Text size="sm" c="blue" mb="md">
              File selected: {paymentProofFile.name}
            </Text>
          )}

          {uploadProgress > 0 && uploadProgress < 100 && (
            <Text size="sm" c="blue" mb="md">
              Uploading: {uploadProgress}%
            </Text>
          )}

          <Button
            fullWidth
            onClick={() => {
              if (!paymentProofFile) {
                notifications.show({
                  title: 'Missing Payment Proof',
                  message: 'Please upload your payment proof before continuing',
                  color: 'red',
                });
                return;
              }

              setShowQrModal(false);
              setShowUploadModal(false);
              handleCheckout({ preventDefault: () => {} });
            }}
          >
            I have completed the payment and uploaded proof
          </Button>
        </div>
      </Modal>
    </div>
  );
}
