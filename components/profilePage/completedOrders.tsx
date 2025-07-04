import { useEffect, useState } from 'react';
import {
  IconCheck,
  IconCircleCheck,
  IconCircleX,
  IconMailOpened,
  IconShieldCheck,
  IconUserCheck,
  IconAlertCircle,
  IconX,
} from '@tabler/icons-react';
import useSWR from 'swr';
import {
  Autocomplete,
  Badge,
  Button,
  Center,
  Group,
  Image,
  LoadingOverlay,
  Modal,
  Pagination,
  Paper,
  Alert,
  Loader,
  rem,
  SimpleGrid,
  Stepper,
  Table,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { Dropzone, FileWithPath, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { notifications } from '@mantine/notifications';
import axios from '../../utils/axiosInstance';
import classes from './completedOrders.module.css';

interface OrderItem {
  order: string;
  product: string;
  quantity: number;
  price: string;
  product_name: string;
  product_image: string;
}

interface Order {
  order_id: string;
  user: number;
  total_price: string;
  order_date: string;
  delivery_date: string | null;
  delivered_date: string | null;
  status: string;
  order_delivery_address: string;
  order_items: OrderItem[];
  payment_method: string; // Add this field to indicate the payment method
  payment_proof: string | null; // Add this field to store the file path of the proof of payment
}

interface OrderTableProps {
  status: string;
}

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

const OrderTable = ({ status }: OrderTableProps) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [modalOpened, setModalOpened] = useState<boolean>(false);
  const [confirmationModalOpened, setConfirmationModalOpened] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchValue, setSearchValue] = useState<string>('');
  const [autocompleteData, setAutocompleteData] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [proofImage, setProofImage] = useState<FileWithPath[]>([]);
  const [newproofImage, setNewProofImage] = useState<FileWithPath[]>([]);
  console.log('Proof Image:', newproofImage);
  const itemsPerPage = 5;

  const { data, error, mutate } = useSWR<{ orders: Order[]; order_items: OrderItem[] }>(
    'order/',
    fetcher
  );

  useEffect(() => {
    if (data) {
      const filteredOrderIds = data.orders
        .filter((order) => order.status === status)
        .map((order) => order.order_id);
      setAutocompleteData(filteredOrderIds);
    }
  }, [data, status]);

  if (error) {
    return (
      <Center mih="100vh">
        <Alert
          icon={<IconAlertCircle size="1.2rem" />}
          title="Failed to Load Orders"
          color="red"
          radius="md"
          variant="light"
        >
          {(error as any).response?.data?.message || 'An unexpected error occurred.'}
        </Alert>
      </Center>
    );
  }
  
  if (!data) {
    return (
      <Center mih="100vh" style={{ flexDirection: 'column' }}>
        <Loader size="lg" color="blue" />
        <Text mt="md" c="dimmed">
          Loading completed orders, please wait...
        </Text>
      </Center>
    );
  }

  // Merge orders with their respective order items
  const ordersWithItems = data.orders.map((order) => ({
    ...order,
    order_items: data.order_items.filter((item) => item.order === order.order_id),
  }));

  console.log('Orders with items: ', ordersWithItems);

  // Filter orders based on status and search value
  const filteredOrders = ordersWithItems.filter(
    (order) => order.status === status && order.order_id.includes(searchValue)
  );
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleRowClick = (order: Order) => {
    setSelectedOrder(order);
    if (order.payment_proof) {
      const proofImageFile = new File([], order.payment_proof);
      setProofImage([proofImageFile]);
    }
    setModalOpened(true);
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;

    try {
      setLoading(true);
      await axios.put(`order/`, { status: 'CANCELLED', order_id: selectedOrder.order_id });
      mutate(); // Refresh the data
      setModalOpened(false);
      setConfirmationModalOpened(false);
      notifications.show({ title: 'Order Cancelled', message: 'Your order has been cancelled.' });
    } catch (err) {
      notifications.show({ title: 'Error', message: 'Failed to cancel the order.' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (orderId: string) => {
    if (newproofImage.length > 0) {
      const file = newproofImage[0];
      try {
        // Step 1: Get the presigned URL from the backend
        const presignedUrlResponse = await axios.post('generate-presigned-url/', {
          file_name: file.name,
          file_type: file.type,
        });

        console.log('Presigned URL Response:', presignedUrlResponse.data);

        const { url, fields } = presignedUrlResponse.data;

        // Step 2: Prepare the form data for the S3 upload
        const uploadData = new FormData();
        Object.entries(fields).forEach(([key, value]) => {
          uploadData.append(key, value as string);
        });
        uploadData.append('file', file);

        // Step 3: Upload the file to S3 using the presigned URL
        await axios.post(url, uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        // Step 4: Update the order with the payment proof file path
        console.log('Updating order with proof of payment:', file.name);
        await axios.put('customOrder/', {
          order_id: orderId,
          status: 'ACCEPTED',
          proof_of_payment: file.name,
        });

        notifications.show({ title: 'Upload Successful', message: 'Proof of payment uploaded.' });
      } catch (error) {
        console.error('Failed to upload proof of payment:', error);
        notifications.show({ title: 'Error', message: 'Failed to upload proof of payment.' });
      }
      setModalOpened(false);
    }
  };

  const rows = paginatedOrders.map((order) => (
    <Tooltip key={order.order_id} label="Click for more info">
      <Table.Tr onClick={() => handleRowClick(order)} style={{ cursor: 'pointer' }}>
        <Table.Td>{order.order_id}</Table.Td>
        <Table.Td>
          {order.order_items.map((item) => (
            <div key={item.product}>
              {item.product_name} (x{item.quantity}) - ₱{item.price}
            </div>
          ))}
        </Table.Td>
        <Table.Td>₱{order.total_price}</Table.Td>
        <Table.Td>{order.order_date}</Table.Td>
        <Table.Td>{order.payment_method}</Table.Td> {/* New column for payment method */}
        <Table.Td>
          {order.payment_proof ? <IconCheck color="green" /> : <IconX color="red" />}{' '}
          {/* Added Paid column */}
        </Table.Td>
        <Table.Td>
          {order.status === 'DELIVERED' ? (
            <Badge color="green">{order.status}</Badge>
          ) : order.status === 'ACCEPTED' ? (
            <Badge color="orange">{order.status}</Badge>
          ) : order.status === 'PENDING' ? (
            <Badge color="yellow">{order.status}</Badge>
          ) : order.status === 'CANCELLED' ? (
            <Badge color="red">{order.status}</Badge>
          ) : (
            <Tooltip label="Check your email for more updates">
              <Badge color="yellow">{order.status}</Badge>
            </Tooltip>
          )}
        </Table.Td>
      </Table.Tr>
    </Tooltip>
  ));

  const previews = newproofImage.map((file, index) => {
    const imageUrl = URL.createObjectURL(file);
    return (
      <Center key={index}>
        <Image w={250} h={250} src={imageUrl} onLoad={() => URL.revokeObjectURL(imageUrl)} />
      </Center>
    );
  });

  return (
    <>
      <Autocomplete
        label="Search by Order ID"
        placeholder="Enter Order ID"
        data={autocompleteData}
        value={searchValue}
        onChange={setSearchValue}
        rightSection={
          searchValue ? (
            <button
              onClick={() => setSearchValue('')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'gray',
              }}
            >
              ✕
            </button>
          ) : null
        }
        mb="md"
      />

      {filteredOrders.length === 0 ? (
        <Center>
          <Title>No orders yet, try checking out some more!</Title>
        </Center>
      ) : (
        <>
          <Table.ScrollContainer minWidth={500}>
            <Table stickyHeader striped highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Order ID</Table.Th>
                  <Table.Th>Products</Table.Th>
                  <Table.Th>Total Price</Table.Th>
                  <Table.Th>Order Date</Table.Th>
                  <Table.Th>Payment Method</Table.Th> {/* New column header for payment method */}
                  <Table.Th>Paid</Table.Th> {/* New column header for paid status */}
                  <Table.Th>Status</Table.Th>
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
        </>
      )}

      <Modal
        size="75%"
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false);
          setNewProofImage([]);
        }}
        title="Order Details"
      >
        <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />

        {selectedOrder && (
          <>
            <Paper shadow="xl" radius="lg" withBorder p="xl">
              <Stepper
                active={
                  selectedOrder.status === 'DELIVERED'
                    ? 3
                    : selectedOrder.status === 'ACCEPTED'
                      ? 2
                      : selectedOrder.status === 'PENDING'
                        ? 0
                        : 3
                }
                completedIcon={
                  selectedOrder.status === 'CANCELLED' ? (
                    <IconCircleX style={{ width: rem(20), height: rem(20) }} />
                  ) : (
                    <IconCircleCheck style={{ width: rem(18), height: rem(18) }} />
                  )
                }
                color={selectedOrder.status === 'CANCELLED' ? 'red' : undefined}
                style={{ marginBottom: '20px' }}
              >
                <Stepper.Step
                  w={'fit-content'}
                  icon={<IconUserCheck style={{ width: rem(18), height: rem(18) }} />}
                  label="Order Under Review"
                  description="Your order is being reviewed"
                  color={selectedOrder.status === 'CANCELLED' ? 'red' : undefined}
                  completedIcon={
                    selectedOrder.status === 'CANCELLED' ? (
                      <IconCircleX style={{ width: rem(20), height: rem(20) }} />
                    ) : (
                      <IconCircleCheck style={{ width: rem(18), height: rem(18) }} />
                    )
                  }
                />
                <Stepper.Step
                  w={'fit-content'}
                  icon={<IconMailOpened style={{ width: rem(18), height: rem(18) }} />}
                  label="To be shipped"
                  description="Your order is being prepared for shipping"
                  color={selectedOrder.status === 'CANCELLED' ? 'red' : undefined}
                  completedIcon={
                    selectedOrder.status === 'CANCELLED' ? (
                      <IconCircleX style={{ width: rem(20), height: rem(20) }} />
                    ) : (
                      <IconCircleCheck style={{ width: rem(18), height: rem(18) }} />
                    )
                  }
                />
                <Stepper.Step
                  w={'fit-content'}
                  icon={<IconShieldCheck style={{ width: rem(18), height: rem(18) }} />}
                  label="Delivered"
                  description="Your order has been delivered"
                  color={selectedOrder.status === 'CANCELLED' ? 'red' : undefined}
                  completedIcon={
                    selectedOrder.status === 'CANCELLED' ? (
                      <IconCircleX style={{ width: rem(20), height: rem(20) }} />
                    ) : (
                      <IconCircleCheck style={{ width: rem(18), height: rem(18) }} />
                    )
                  }
                />
                <Stepper.Completed>
                  <Center>
                    <Title order={1} mt={25}>
                      {selectedOrder.status === 'CANCELLED' ? 'Order Cancelled' : 'Order Delivered'}
                    </Title>
                  </Center>
                </Stepper.Completed>
              </Stepper>
            </Paper>

            <Paper shadow="xl" radius="lg" withBorder p="xl" mt={10}>
              <div>
                <strong>Order ID:</strong> {selectedOrder.order_id}
              </div>
              <div>
                <strong>Total Price:</strong> ₱{selectedOrder.total_price}
              </div>
              <div>
                <strong>Order Date:</strong> {selectedOrder.order_date}
              </div>
              <div>
                <strong>Delivery Address:</strong> {selectedOrder.order_delivery_address}
              </div>
              <div>
                <strong>Proof of Payment:</strong>{' '}
                <Image radius="md" src={`${selectedOrder.payment_proof}`} alt="Proof of Payment" />
              </div>
              <div>
                <strong>Products:</strong>
                <Group>
                  {selectedOrder.order_items.map((item) => (
                    <div key={item.product} style={{ display: 'flex', alignItems: 'center' }}>
                      <Image
                        src={`${item.product_image}`}
                        alt={item.product_name}
                        width={50}
                        height={50}
                      />
                      <div style={{ marginLeft: '10px' }}>
                        {item.product_name} (x{item.quantity}) - ₱{item.price}
                      </div>
                    </div>
                  ))}
                </Group>
              </div>
              {selectedOrder.status === 'PENDING' && (
                <Center mt="md">
                  <Button color="red" onClick={() => setConfirmationModalOpened(true)}>
                    Cancel Order
                  </Button>
                </Center>
              )}
              {selectedOrder.status === 'ACCEPTED' && selectedOrder.payment_method === 'ONLINE' && (
                <div>
                  <Text ta="center" mt="md">
                    {selectedOrder.payment_proof && newproofImage.length === 0 ? (
                      <>
                        Payment proof already sent. Want to send a new one?
                        <Dropzone accept={IMAGE_MIME_TYPE} onDrop={setNewProofImage}>
                          <Text ta="center">Drop images here</Text>
                        </Dropzone>
                        <SimpleGrid
                          cols={{ base: 1, sm: 1 }}
                          mt={newproofImage.length === 0 ? 'xl' : 0}
                        >
                          {/* {previews} */}
                          <Center>
                            <Image
                              w={250}
                              h={250}
                              src={selectedOrder.payment_proof}
                              alt="Proof of Payment"
                            />
                          </Center>
                        </SimpleGrid>
                        <Center mt="md">
                          <Button
                            onClick={() => {
                              handleFileUpload(selectedOrder.order_id);
                            }}
                          >
                            Upload New Proof of Payment
                          </Button>
                        </Center>
                      </>
                    ) : (
                      <>
                        Send Proof of Payment Here
                        <Dropzone accept={IMAGE_MIME_TYPE} onDrop={setNewProofImage}>
                          <Text ta="center">Drop images here</Text>
                        </Dropzone>
                        <SimpleGrid cols={{ base: 1, sm: 1 }} mt={previews.length > 0 ? 'xl' : 0}>
                          {previews}
                        </SimpleGrid>
                        <Center mt="md">
                          <Button
                            onClick={() => {
                              handleFileUpload(selectedOrder.order_id);
                            }}
                          >
                            Upload Proof of Payment
                          </Button>
                        </Center>
                      </>
                    )}
                  </Text>
                </div>
              )}
            </Paper>
          </>
        )}
      </Modal>

      <Modal
        opened={confirmationModalOpened}
        onClose={() => setConfirmationModalOpened(false)}
        title="Confirm Cancellation"
      >
        <Text>Are you sure you want to cancel this order?</Text>
        <Group justify="center" mt="md">
          <Button color="red" onClick={handleCancelOrder}>
            Yes, Cancel Order
          </Button>
          <Button variant="outline" onClick={() => setConfirmationModalOpened(false)}>
            No, Keep Order
          </Button>
        </Group>
      </Modal>
    </>
  );
};

export default OrderTable;
