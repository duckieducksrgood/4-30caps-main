// pages/dashboard.js
import { useEffect } from 'react';
import useSWR from 'swr';
import {
  Button,
  Card,
  Center,
  Container,
  Flex,
  Grid,
  Group,
  Image,
  Loader,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import axios from '../../../utils/axiosInstance';
import { CardStats } from './cards';

// Define the Order interface
interface Order {
  order_id: string;
  user: string; // Adjust this to your user model or interface
  total_price: number;
  order_date: string; // ISO string
  delivery_date: string | null; // ISO string or null
  status: string; // e.g., "Pending", "Completed", "Cancelled"
}

interface AnalyticsData {
  total_orders: number;
  completed_this_week: number;
  deliveries_today: number;
  pending_orders: number;
  monthly_report: {
    completed: number;
    cancelled: number;
    delivered: number;
  };
}

// Fetcher function for SWR
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

const Dashboard = () => {
  const { data, error } = useSWR<AnalyticsData>('analytics/', fetcher);

  console.log(data);

  // Handle loading state
  if (!data && !error) return <Loader />;
  if (error) return <Text color="red">Failed to load analytics data.</Text>;

  return (
    <Flex m={50} direction={{ base: 'column', sm: 'row' }} gap={{ base: 'sm', sm: 'lg' }}>
      <Paper shadow="xl" radius="xl" withBorder p="xl">
        <Center>
          <Image radius="md" src="/welder.png" h={200} w="auto" />
        </Center>
        <Stack>
          <Title textWrap="wrap" order={2}>
          Overview of Completed Product Deliveries
          </Title>
          <Text size="lg">{data?.total_orders} Orders Successfully Delivered</Text>
        </Stack>
      </Paper>
      <Paper shadow="xl" radius="xl" p="xl" withBorder>
        <Title order={1} p={'xl'} textWrap="balance">
          Transactions Overview
        </Title>
        <CardStats />
      </Paper>
    </Flex>
  );
};

export default Dashboard;
