import { IconAlertCircle } from '@tabler/icons-react';
import useSWR from 'swr';
import { Alert, Badge, Center, Loader, ScrollArea, Table, Text } from '@mantine/core';
import axios from '../../utils/axiosInstance';

interface Order {
  order_id: string;
  user: number;
  total_price: string;
  order_date: string;
  status: 'delivered' | 'pending' | 'accepted' | 'cancelled';
  delivery_date: string;
  delivered_date?: string;
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

// Fetch function
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function OrderTable() {
  // Use SWR to fetch the data from the API
  const { data, error } = useSWR<AnalyticsData>('analytics/', fetcher);

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

  // Slice the latest 5 orders
  const latestOrders = data.all_orders
    .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime()) // Correct date comparison using timestamps
    .slice(0, 5); // Get the latest 5 orders

  // Handle row rendering with status badges
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

  const rows = latestOrders.map((order) => (
    <Table.Tr key={order.order_id}>
      <Table.Td>{order.order_id}</Table.Td>
      <Table.Td>{order.total_price}</Table.Td>
      <Table.Td>{new Date(order.order_date).toLocaleDateString()}</Table.Td>
      <Table.Td>
        {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : '-'}
      </Table.Td>
      <Table.Td>{getStatusBadge(order.status)}</Table.Td>
    </Table.Tr>
  ));

  return (
    <Table.ScrollContainer minWidth={500}>
      <Table striped highlightOnHover withTableBorder withColumnBorders stickyHeader>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Order ID</Table.Th>
            <Table.Th>Total Price</Table.Th>
            <Table.Th>Order Date</Table.Th>
            <Table.Th>Delivery Date</Table.Th>
            <Table.Th>Status</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
