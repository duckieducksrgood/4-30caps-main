import { IconArrowDownRight, IconArrowsHorizontal, IconArrowUpRight } from '@tabler/icons-react';
import useSWR from 'swr';
import { Center, Group, Loader, Paper, SimpleGrid, Text, ThemeIcon } from '@mantine/core';
import axios from '../../../utils/axiosInstance';
import classes from './cards.module.css';

// Define the AnalyticsData interface
interface AnalyticsData {
  total_orders: number;
  total_orders_last_month: number;
  total_orders_last_week: number;
  total_orders_yesterday: number;
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

export function CardStats() {
  const { data, error } = useSWR<AnalyticsData>('analytics/', fetcher);

  // Handle loading state
  if (!data && !error) return <Loader />;
  if (error) return <Text color="red">Failed to load analytics data.</Text>;

  // Calculate diff percentages with checks to avoid division by zero
  const totalOrdersDiff =
    data?.total_orders_last_month !== 0
      ? ((data?.total_orders ?? 0 - (data?.total_orders_last_month ?? 0)) /
          (data?.total_orders_last_month ?? 1)) *
        100
      : 0;

  const completedThisWeekDiff =
    data?.total_orders_last_week !== 0
      ? (((data?.completed_this_week ?? 0) - (data?.total_orders_last_week ?? 0)) /
          (data?.total_orders_last_week ?? 1)) *
        100
      : 0;

  const deliveriesTodayDiff =
    data?.total_orders_yesterday !== 0
      ? (((data?.deliveries_today ?? 0) - (data?.total_orders_yesterday ?? 0)) /
          (data?.total_orders_yesterday ?? 1)) *
        100
      : 0;

  const stats = [
    {
      title: 'Total Orders',
      value: data?.total_orders,
      diff: totalOrdersDiff,
      comparison: 'last month',
    },
    {
      title: 'Completed This Week',
      value: data?.completed_this_week,
      diff: completedThisWeekDiff,
      comparison: 'last week',
    },
    {
      title: 'Deliveries Today',
      value: data?.deliveries_today,
      diff: deliveriesTodayDiff,
      comparison: 'yesterday',
    },
  ].map((stat) => {
    const DiffIcon =
      stat.diff > 0 ? IconArrowUpRight : stat.diff < 0 ? IconArrowDownRight : IconArrowsHorizontal;

    return (
      <Paper withBorder p="md" radius="md" key={stat.title}>
        <Group justify="apart">
          <div>
            <Text c="dimmed" tt="uppercase" fw={700} fz="xs" className={classes.label}>
              {stat.title}
            </Text>
            <Text fw={700} fz="xl">
              {stat.value}
            </Text>
          </div>
          <ThemeIcon
            color="gray"
            variant="light"
            style={{
              color:
                stat.diff > 0
                  ? 'var(--mantine-color-teal-6)'
                  : stat.diff < 0
                    ? 'var(--mantine-color-red-6)'
                    : 'gray',
            }}
            size={38}
            radius="md"
          >
            <DiffIcon size="1.8rem" stroke={1.5} />
          </ThemeIcon>
        </Group>
        <Text c="dimmed" fz="sm" mt="md">
          {stat.diff !== 0 ? (
            <>
              <Text component="span" c={stat.diff > 0 ? 'teal' : 'red'} fw={700}>
                {stat.diff.toFixed(2)}%
              </Text>{' '}
              {stat.diff > 0 ? 'increase' : 'decrease'} compared to {stat.comparison}
            </>
          ) : (
            `No change compared to ${stat.comparison}`
          )}
        </Text>
      </Paper>
    );
  });

  return <SimpleGrid cols={{ base: 1, sm: 3 }}>{stats}</SimpleGrid>;
}
