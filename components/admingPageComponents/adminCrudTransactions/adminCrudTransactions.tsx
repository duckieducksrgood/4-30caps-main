import { useEffect, useState } from 'react';
import {
  IconAlertCircle,
  IconCheck,
  IconChevronDown,
  IconPackage,
  IconSquareCheck,
  IconX,
} from '@tabler/icons-react';
import useSWR from 'swr';
import {
  Alert,
  Autocomplete,
  Badge,
  Button,
  Center,
  Container,
  Image,
  Loader,
  LoadingOverlay,
  Menu,
  Modal,
  NumberInput,
  Pagination,
  rem,
  ScrollArea,
  Select,
  SimpleGrid,
  Table,
  Tabs,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { Dropzone, FileWithPath, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { notifications } from '@mantine/notifications';
import { useUserStore } from '../../../utils/authAPI/userApi';
import axios from '../../../utils/axiosInstance';

interface Order {
  order_id: string;
  user: string;
  total_price: string;
  order_date: string;
  status: 'delivered' | 'pending' | 'accepted' | 'cancelled';
  delivery_date: string;
  delivered_date?: string;
  custom_order_description?: string;
  custom_order: boolean;
  payment_method: string;
  payment_proof?: string;
  payment_qr?: string;
}

interface MonthlyReport {
  completed: number;
  cancelled: number;
  delivered: number;
}

interface AnalyticsData {
  total_orders: number;
  total_orders_last_month: number;
  total_orders_last_week: number;
  total_orders_yesterday: number;
  completed_this_week: number;
  deliveries_today: number;
  pending_orders: number;
  monthly_report: MonthlyReport;
  all_orders: Order[];
  message: string;
}

interface PaymentQR {
  payment_qr: string;
}

// Fetch function
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function OrderCrudsTable() {
  // Get user role from Zustand store
  const { role, isLoading: userLoading } = useUserStore();
  const isEmployee = role === 'employee';

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState<boolean>(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [customOrderPrice, setCustomOrderPrice] = useState<number | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<string>('PENDING');
  const [searchValue, setSearchValue] = useState<string>('');
  const [files, setFiles] = useState<FileWithPath[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch user data on component mount
  useEffect(() => {
    useUserStore.getState().fetchUserData();
  }, []);

  const { data: qrData } = useSWR<PaymentQR>('paymentqr/', fetcher, { revalidateOnFocus: false });

  const handleFileUpload = async () => {
    if (files.length > 0) {
      const file = files[0];
      setLoading(true);
      try {
        // Step 1: Get the presigned URL from the backend
        const presignedUrlResponse = await axios.post('generate-presigned-url/', {
          file_name: file.name,
          file_type: file.type,
        });

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

        // Step 4: Update the order with the uploaded QR code
        await axios.post('paymentqr/', {
          file_name: file.name,
        });

        notifications.show({ title: 'Success', message: 'QR code uploaded successfully.' });
        setIsUploadModalOpen(false);
        setFiles([]);
        setLoading(false);
      } catch (error) {
        console.error('Failed to upload QR code:', error);
        notifications.show({ title: 'Error', message: 'Failed to upload QR code.' });
        setLoading(false);
      }
    }
  };

  // Use SWR to fetch the data from the API
  const { data, error, mutate } = useSWR<AnalyticsData>('analytics/', fetcher);

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

  if (!data || userLoading) {
    return (
      <Center mih="50vh" style={{ flexDirection: 'column' }}>
        <Loader size="lg" color="blue" />
        <Text mt="md" c="dimmed">
          Loading, please wait...
        </Text>
      </Center>
    );
  }

  const itemsPerPage = 5;
  const filteredOrders = data.all_orders.filter(
    (order) =>
      order.status.toUpperCase() === activeTab &&
      !order.custom_order && // Exclude custom orders from other tabs
      (order.order_id.includes(searchValue) ||
        order.user.toLowerCase().includes(searchValue.toLowerCase()))
  );
  const customOrders = data.all_orders.filter((order) => order.custom_order);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'delivered':
        return <Badge color="green">Delivered</Badge>;
      case 'pending':
        return <Badge color="yellow">Pending</Badge>;
      case 'accepted':
        return <Badge color="orange">Accepted</Badge>;
      case 'cancelled':
        return <Badge color="red">Cancelled</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const handleUpdateStatus = async (order_id: string, newStatus: string, price?: number) => {
    try {
      setLoading(true);
      await axios.put('customOrder/', {
        order_id,
        status: newStatus,
        custom_price: price,
      });
      notifications.show({
        title: 'Order Status Updated',
        message: `Order ${order_id} status has been updated to ${newStatus}`,
        color: 'green',
      });
      mutate(); // Refresh the orders list
      setLoading(false);
    } catch (error) {
      console.error(error);
      notifications.show({
        title: 'Error',
        message: 'Failed to update order status',
        color: 'red',
      });
      setLoading(false);
    }
  };

  const handleStatusChange = (order: Order, newStatus: string) => {
    setSelectedOrder(order);
    setNewStatus(newStatus);

    if (newStatus === 'DELIVERED') {
      setIsDeliveryModalOpen(true);
    } else if (newStatus === 'ACCEPTED' && order.custom_order) {
      setIsPriceModalOpen(true);
    } else {
      setIsStatusModalOpen(true);
    }
  };

  const confirmDelivery = () => {
    if (selectedOrder) {
      handleUpdateStatus(selectedOrder.order_id, newStatus);
      setIsDeliveryModalOpen(false);
      setSelectedOrder(null);
      setNewStatus('');
    }
  };

  const confirmCustomOrderPrice = () => {
    if (selectedOrder && customOrderPrice !== undefined) {
      handleUpdateStatus(selectedOrder.order_id, newStatus, customOrderPrice);
      setIsPriceModalOpen(false);
      setSelectedOrder(null);
      setNewStatus('');
      setCustomOrderPrice(undefined);
    }
  };

  const confirmStatusChange = () => {
    if (selectedOrder) {
      handleUpdateStatus(selectedOrder.order_id, newStatus);
      setIsStatusModalOpen(false);
      setSelectedOrder(null);
      setNewStatus('');
    }
  };

  const rows = paginatedOrders.map((order) => (
    <Table.Tr key={order.order_id}>
      <Table.Td>{order.order_id}</Table.Td>
      <Table.Td>{order.user}</Table.Td>
      <Table.Td>{order.total_price}</Table.Td>
      <Table.Td>{new Date(order.order_date).toLocaleDateString()}</Table.Td>
      <Table.Td>
        {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : '-'}
      </Table.Td>
      <Table.Td>{order.payment_method}</Table.Td>
      <Table.Td>
        {order.payment_proof ? (
          <Image src={order.payment_proof} w={200} h={200} />
        ) : (
          <IconX color="red" />
        )}
      </Table.Td>
      <Table.Td>{getStatusBadge(order.status)}</Table.Td>
      {!isEmployee && (
        <Table.Td>
          <Select
            label="Update Status"
            placeholder="Select status"
            data={['PENDING', 'ACCEPTED', 'DELIVERED', 'CANCELLED']}
            value={order.status.toUpperCase()}
            onChange={(newStatus) => handleStatusChange(order, newStatus!)}
            disabled={order.status.toLowerCase() === 'delivered'}
          />
        </Table.Td>
      )}
    </Table.Tr>
  ));

  const customOrderRows = customOrders.map((order) => (
    <Table.Tr key={order.order_id}>
      <Table.Td>{order.order_id}</Table.Td>
      <Table.Td>{order.user}</Table.Td>
      <Table.Td>{order.total_price}</Table.Td>
      <Table.Td>{new Date(order.order_date).toLocaleDateString()}</Table.Td>
      <Table.Td>
        {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : '-'}
      </Table.Td>
      <Table.Td>{order.payment_method}</Table.Td>
      <Table.Td>
        {order.payment_proof ? <IconCheck color="green" /> : <IconX color="red" />}
      </Table.Td>
      <Table.Td>{getStatusBadge(order.status)}</Table.Td>
      <Table.Td>
        {order.custom_order ? <IconCheck color="green" /> : <IconX color="red" />}
      </Table.Td>
      <Table.Td>{order.custom_order_description || '-'}</Table.Td>
      {!isEmployee && (
        <Table.Td>
          <Select
            label="Update Status"
            placeholder="Select status"
            data={['PENDING', 'ACCEPTED', 'DELIVERED', 'CANCELLED']}
            value={order.status.toUpperCase()}
            onChange={(newStatus) => handleStatusChange(order, newStatus!)}
            disabled={order.status.toLowerCase() === 'delivered'}
          />
        </Table.Td>
      )}
    </Table.Tr>
  ));

  const autocompleteData = data.all_orders
    .filter((order) => order.status.toUpperCase() === activeTab)
    .map((order) => order.order_id);

  const theme = useMantineTheme();

  const previews = files.map((file, index) => {
    const imageUrl = URL.createObjectURL(file);
    return (
      <Center key={index}>
        <Image w={250} h={250} src={imageUrl} onLoad={() => URL.revokeObjectURL(imageUrl)} />
      </Center>
    );
  });

  return (
    <Container fluid my={100}>
      <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />

      <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'PENDING')}>
        <Tabs.List>
          <Tabs.Tab value="PENDING">Pending</Tabs.Tab>
          <Tabs.Tab value="ACCEPTED">Accepted</Tabs.Tab>
          <Tabs.Tab value="DELIVERED">Delivered</Tabs.Tab>
          <Tabs.Tab value="CANCELLED">Cancelled</Tabs.Tab>
          <Tabs.Tab value="CUSTOM">Custom Orders</Tabs.Tab>
        </Tabs.List>

        <Autocomplete
          value={searchValue}
          onChange={setSearchValue}
          data={autocompleteData}
          placeholder="Search by Order ID or Username"
          mt="md"
        />

        <Tabs.Panel value="PENDING" pt="xs">
          <Table.ScrollContainer minWidth={500}>
            <Table striped highlightOnHover withTableBorder withColumnBorders stickyHeader>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Order ID</Table.Th>
                  <Table.Th>Username</Table.Th>
                  <Table.Th>Total Price</Table.Th>
                  <Table.Th>Order Date</Table.Th>
                  <Table.Th>Delivery Date</Table.Th>
                  <Table.Th>Payment Method</Table.Th>
                  <Table.Th>Proof of Payment</Table.Th>
                  <Table.Th>Status</Table.Th>
                  {!isEmployee && <Table.Th>Action</Table.Th>}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Tabs.Panel>

        <Tabs.Panel value="ACCEPTED" pt="xs">
          <Table.ScrollContainer minWidth={500}>
            <Table striped highlightOnHover withTableBorder withColumnBorders stickyHeader>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Order ID</Table.Th>
                  <Table.Th>Username</Table.Th>
                  <Table.Th>Total Price</Table.Th>
                  <Table.Th>Order Date</Table.Th>
                  <Table.Th>Delivery Date</Table.Th>
                  <Table.Th>Payment Method</Table.Th>
                  <Table.Th>Proof of Payment</Table.Th>
                  <Table.Th>Status</Table.Th>
                  {!isEmployee && <Table.Th>Action</Table.Th>}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Tabs.Panel>

        <Tabs.Panel value="DELIVERED" pt="xs">
          <Table.ScrollContainer minWidth={500}>
            <Table striped highlightOnHover withTableBorder withColumnBorders stickyHeader>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Order ID</Table.Th>
                  <Table.Th>Username</Table.Th>
                  <Table.Th>Total Price</Table.Th>
                  <Table.Th>Order Date</Table.Th>
                  <Table.Th>Delivery Date</Table.Th>
                  <Table.Th>Payment Method</Table.Th>
                  <Table.Th>Proof of Payment</Table.Th>
                  <Table.Th>Status</Table.Th>
                  {!isEmployee && <Table.Th>Action</Table.Th>}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Tabs.Panel>

        <Tabs.Panel value="CANCELLED" pt="xs">
          <Table.ScrollContainer minWidth={500}>
            <Table striped highlightOnHover withTableBorder withColumnBorders stickyHeader>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Order ID</Table.Th>
                  <Table.Th>Username</Table.Th>
                  <Table.Th>Total Price</Table.Th>
                  <Table.Th>Order Date</Table.Th>
                  <Table.Th>Delivery Date</Table.Th>
                  <Table.Th>Payment Method</Table.Th>
                  <Table.Th>Proof of Payment</Table.Th>
                  <Table.Th>Status</Table.Th>
                  {!isEmployee && <Table.Th>Action</Table.Th>}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Tabs.Panel>

        <Tabs.Panel value="CUSTOM" pt="xs">
          <Table.ScrollContainer minWidth={500}>
            <Table striped highlightOnHover withTableBorder withColumnBorders stickyHeader>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Order ID</Table.Th>
                  <Table.Th>Username</Table.Th>
                  <Table.Th>Total Price</Table.Th>
                  <Table.Th>Order Date</Table.Th>
                  <Table.Th>Delivery Date</Table.Th>
                  <Table.Th>Payment Method</Table.Th>
                  <Table.Th>Paid</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Special Order</Table.Th>
                  <Table.Th>Custom Order Description</Table.Th>
                  {!isEmployee && <Table.Th>Action</Table.Th>}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{customOrderRows}</Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Tabs.Panel>
      </Tabs>

      <Center>
        <Pagination
          total={totalPages}
          onChange={setCurrentPage}
          value={currentPage}
          mt="md"
          color="blue"
        />
      </Center>

      {/* Delivery confirmation modal */}
      <Modal
        opened={isDeliveryModalOpen}
        onClose={() => setIsDeliveryModalOpen(false)}
        title="Confirm Delivery"
      >
        <Text mb="md">Are you sure you want to mark this order as delivered?</Text>

        {selectedOrder?.payment_method === 'ONLINE' && (
          <>
            {selectedOrder?.payment_proof ? (
              <Center>
                <Image
                  src={selectedOrder.payment_proof}
                  alt="Payment Proof"
                  width={250}
                  height={250}
                />
              </Center>
            ) : (
              <Alert color="red" title="Warning" mb="md">
                No payment proof uploaded yet. Are you sure you want to proceed?
              </Alert>
            )}
          </>
        )}

        <Button fullWidth mt="md" color="green" onClick={confirmDelivery}>
          Yes, Mark as Delivered
        </Button>
        <Button fullWidth mt="md" variant="outline" onClick={() => setIsDeliveryModalOpen(false)}>
          Cancel
        </Button>
      </Modal>

      {/* Custom order price modal */}
      <Modal
        opened={isPriceModalOpen}
        onClose={() => setIsPriceModalOpen(false)}
        title="Set Custom Order Price"
      >
        <Text mb="md">
          Please set the price for custom order: <strong>{selectedOrder?.order_id}</strong>
        </Text>
        <Text mb="md" size="sm" c="dimmed">
          Custom description: {selectedOrder?.custom_order_description}
        </Text>

        <NumberInput
          label="Custom Order Price"
          placeholder="Enter the price for the custom order"
          value={customOrderPrice}
          onChange={(value) => setCustomOrderPrice(typeof value === 'number' ? value : undefined)}
          min={0}
          withAsterisk
        />

        <Button
          fullWidth
          mt="md"
          onClick={confirmCustomOrderPrice}
          disabled={customOrderPrice === undefined}
        >
          Set Price and Accept Order
        </Button>
        <Button fullWidth mt="md" variant="outline" onClick={() => setIsPriceModalOpen(false)}>
          Cancel
        </Button>
      </Modal>

      {/* General status update modal */}
      <Modal
        opened={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title={`Change Status to ${newStatus}`}
      >
        <Text mb="md">
          Are you sure you want to change the status of order{' '}
          <strong>{selectedOrder?.order_id}</strong> to <strong>{newStatus}</strong>?
        </Text>

        {newStatus === 'CANCELLED' && (
          <Alert color="red" title="Warning" mb="md">
            Cancelling an order cannot be undone. Please make sure you want to proceed.
          </Alert>
        )}

        {newStatus === 'ACCEPTED' && (
          <Alert color="blue" title="Note" mb="md">
            Accepting the order will notify the customer that their order is being processed.
          </Alert>
        )}

        <Button fullWidth mt="md" onClick={confirmStatusChange}>
          Yes, Update Status
        </Button>
        <Button fullWidth mt="md" variant="outline" onClick={() => setIsStatusModalOpen(false)}>
          Cancel
        </Button>
      </Modal>

      {/* QR code upload modal */}
      <Modal
        opened={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setFiles([]);
        }}
        title="Upload GCash QR Code"
      >
        {qrData?.payment_qr ? (
          <>
            <Text ta="center" mt="md">
              A QR code is already uploaded. Do you want to update it?
            </Text>
            <Center mt="md" mb="md">
              <Image src={qrData.payment_qr} alt="Current QR Code" width={250} height={250} />
            </Center>
          </>
        ) : (
          <Text ta="center" mt="md">
            No QR code uploaded yet. Please upload a new QR code for customer payments.
          </Text>
        )}
        <Dropzone accept={IMAGE_MIME_TYPE} onDrop={setFiles}>
          <Text ta="center">Drop QR code image here or click to select file</Text>
        </Dropzone>
        <SimpleGrid cols={{ base: 1, sm: 1 }} mt={files.length > 0 ? 'xl' : 0}>
          {previews}
        </SimpleGrid>
        <Center mt="md">
          <Button onClick={handleFileUpload} disabled={files.length === 0}>
            {qrData?.payment_qr ? 'Update QR Code' : 'Upload QR Code'}
          </Button>
        </Center>
      </Modal>

      {!isEmployee && (
        <Button
          rightSection={
            <IconChevronDown style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
          }
          pr={12}
          onClick={() => setIsUploadModalOpen(true)}
          mt="md"
        >
          GCash QR Payment
        </Button>
      )}
    </Container>
  );
}
