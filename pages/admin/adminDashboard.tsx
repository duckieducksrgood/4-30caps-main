import { useEffect, useState } from 'react';
import {
  IconAlertCircle,
  IconDownload,
  IconGauge,
  IconPackage,
  IconShoppingCart,
  IconUsers,
} from '@tabler/icons-react';
import {
  Alert,
  AppShell,
  Button,
  Group,
  Modal,
  NavLink,
  Paper,
  Select,
  Stack,
  Text,
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import AdminProductsDashboard from '../../components/admingPageComponents/adminCrudProducts/AdminProductsDashboard';
import OrderCrudsTable from '../../components/admingPageComponents/adminCrudTransactions/adminCrudTransactions';
import UserTable from '../../components/admingPageComponents/adminUserCrud/adminUserCrud';
import Dashboard from '../../components/admingPageComponents/cardAnalytics.tsx/cardsAnalytics';
import OrderTable from '../../components/admingPageComponents/tableAnalytics';
import HeaderComponent from '../../components/headerPAGE/headerComponent';
import withRoleProtection, { useUserStore } from '../../utils/authAPI/userApi';
import axios from '../../utils/axiosInstance';

function AdminPage() {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const [opened, { toggle }] = useDisclosure();
  const [activeContent, setActiveContent] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportType, setReportType] = useState('custom');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Get user role directly from Zustand store
  const { role, isLoading: userLoading } = useUserStore();
  const isEmployee = role === 'employee';
  const isAdmin = role === 'admin';

  // Fetch user data on component mount
  useEffect(() => {
    useUserStore.getState().fetchUserData();
  }, []);

  const handleExportAnalytics = async () => {
    try {
      const params = new URLSearchParams();
      if (reportType === 'custom') {
        if (!startDate || !endDate) {
          alert('Please select both start and end dates for custom report');
          return;
        }
        params.append('start_date', startDate.toISOString().split('T')[0]);
        params.append('end_date', endDate.toISOString().split('T')[0]);
      }
      params.append('report_type', reportType);

      // Show loading notification
      const notificationId = notifications.show({
        title: 'Generating Report',
        message: 'Please wait while we prepare your combined report...',
        loading: true,
        autoClose: false,
      });

      const response = await axios.get(`exportAnalytics/?${params.toString()}`, {
        responseType: 'blob', // Important for downloading files
      });

      // Close loading notification
      notifications.update({
        id: notificationId,
        title: 'Report Ready',
        message: 'Your combined sales and stock report is ready for download.',
        color: 'green',
        icon: <IconDownload size="1rem" />,
        loading: false,
        autoClose: 3000,
      });

      // Create file name based on report type
      const date = new Date().toISOString().split('T')[0];
      let fileName = '';

      switch (reportType) {
        case 'daily':
          fileName = `4-30caps_daily_report_${date}.xlsx`;
          break;
        case 'monthly':
          fileName = `4-30caps_monthly_report_${date}.xlsx`;
          break;
        case 'yearly':
          fileName = `4-30caps_yearly_report_${date}.xlsx`;
          break;
        case 'custom':
          const startFormatted = startDate!.toISOString().split('T')[0];
          const endFormatted = endDate!.toISOString().split('T')[0];
          fileName = `4-30caps_custom_report_${startFormatted}_to_${endFormatted}.xlsx`;
          break;
        default:
          fileName = `4-30caps_report_${date}.xlsx`;
      }

      // Download the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Close modal after successful export
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to export analytics data:', error);
      notifications.show({
        title: 'Export Failed',
        message: 'There was an error generating your report. Please try again.',
        color: 'red',
      });
    }
  };

  const renderContent = () => {
    switch (activeContent) {
      case 'dashboard':
        return (
          <>
            {/* Show role-based alert at the top of the dashboard */}
            {isEmployee && (
              <Alert
                icon={<IconAlertCircle size="1rem" />}
                color="blue"
                mb="md"
                title="Employee Access"
              >
                Welcome to the admin dashboard. As an employee, you have view-only access to most
                sections. Some management actions are restricted to administrators only.
              </Alert>
            )}
            {isAdmin && (
              <Alert
                icon={<IconAlertCircle size="1rem" />}
                color="green"
                mb="md"
                title="Administrator Access"
              >
                Welcome to the admin dashboard. You have full access to all administrative features.
              </Alert>
            )}
            <Dashboard />
            <Paper shadow="xl" radius="xl" withBorder p="xl">
              <OrderTable />
            </Paper>
          </>
        );
      case 'order-crud':
        return <OrderCrudsTable />;
      case 'user-table':
        return (
          <Paper shadow="xl" radius="xl" withBorder p="xl" mt={150}>
            <UserTable />
          </Paper>
        );
      case 'product-crud':
        return <AdminProductsDashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <HeaderComponent opened={opened} toggle={toggle} />
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <NavLink
          label="Dashboard"
          leftSection={<IconGauge size="1rem" stroke={1.5} />}
          childrenOffset={28}
          active={activeContent === 'dashboard'}
          onClick={() => setActiveContent('dashboard')}
          color="orange"
        ></NavLink>

        <NavLink
          label="Orders"
          leftSection={<IconShoppingCart size="1rem" stroke={1.5} />}
          childrenOffset={28}
          active={activeContent === 'order-crud'}
          onClick={() => setActiveContent('order-crud')}
          color="orange"
        ></NavLink>

        <NavLink
          label="Users"
          leftSection={<IconUsers size="1rem" stroke={1.5} />}
          childrenOffset={28}
          active={activeContent === 'user-table'}
          onClick={() => setActiveContent('user-table')}
          color="orange"
        ></NavLink>

        <NavLink
          label="Products"
          leftSection={<IconPackage size="1rem" stroke={1.5} />}
          childrenOffset={28}
          active={activeContent === 'product-crud'}
          onClick={() => setActiveContent('product-crud')}
          color="orange"
        ></NavLink>

        {/* Only show Export Analytics button for admin users */}
        {isAdmin && (
          <Button
            leftSection={<IconDownload size="1rem" />}
            onClick={() => setIsModalOpen(true)}
            color="blue"
            mt="md"
            fullWidth
          >
            Export Sales & Stock Reports
          </Button>
        )}
      </AppShell.Navbar>

      <AppShell.Main>{renderContent()}</AppShell.Main>

      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Export Combined Analytics Report"
        size="md"
      >
        <Stack>
          <Text size="sm" mb="xs">
            This will generate a comprehensive Excel report containing both sales and inventory data
            in separate sheets.
          </Text>

          <Select
            label="Report Type"
            placeholder="Select report type"
            value={reportType}
            onChange={(value) => setReportType(value || 'custom')}
            data={[
              { value: 'daily', label: 'Daily Report (Today)' },
              { value: 'monthly', label: 'Monthly Report (Current Month)' },
              { value: 'yearly', label: 'Annual Report (Current Year)' },
              { value: 'custom', label: 'Custom Date Range' },
            ]}
          />

          {reportType === 'custom' && (
            <Group style={{ flex: 1 }} align="flex-start">
              <Stack>
                <Text size="sm">Start Date</Text>
                <DatePicker
                  value={startDate}
                  onChange={setStartDate}
                  maxDate={new Date()}
                  allowDeselect
                />
              </Stack>
              <Stack>
                <Text size="sm">End Date</Text>
                <DatePicker
                  value={endDate}
                  onChange={setEndDate}
                  minDate={startDate || undefined}
                  maxDate={new Date()}
                  allowDeselect
                />
              </Stack>
            </Group>
          )}

          <Button
            fullWidth
            mt="md"
            onClick={handleExportAnalytics}
            leftSection={<IconDownload size="1rem" />}
            disabled={reportType === 'custom' && (!startDate || !endDate)}
          >
            Export Combined Report
          </Button>
        </Stack>
      </Modal>
    </AppShell>
  );
}

export default withRoleProtection(AdminPage, ['admin', 'employee']);
