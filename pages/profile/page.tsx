import { SetStateAction, useEffect, useState } from 'react';
import useSWR from 'swr';
import {
  AppShell,
  Avatar,
  Box,
  Button,
  Card,
  Container,
  Divider,
  FileInput,
  Group,
  LoadingOverlay,
  Progress,
  Select,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
  UnstyledButton,
  Badge,
  rem,
  Grid,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { 
  IconEdit, 
  IconArrowRight, 
  IconUser, 
  IconMail, 
  IconAt,
  IconMapPin,
  IconBuildingCommunity,
  IconStar,
  IconCheck,
  IconCalendarStats,
} from '@tabler/icons-react';
import HeaderComponent from '../../components/headerPAGE/headerComponent';
import { FooterLinks } from '../../components/landingPage/footer/footer';
import classes from '../../components/module.css/MobileNavbar.module.css';
import OrderTable from '../../components/profilePage/completedOrders';
import {
  fetchBarangays,
  fetchCitiesMunicipalities,
  fetchProvinces,
  fetchRegions,
} from '../../utils/authAPI/userApi';
import axios from '../../utils/axiosInstance';

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

const ProfilePage = () => {
  const [userData, setUserData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    profile_picture: null,
    delivery_address: '',
  });
  const [regions, setRegions] = useState<{ value: string; label: string }[]>([]);
  const [provinces, setProvinces] = useState<{ value: string; label: string }[]>([]);
  const [citiesMunicipalities, setCitiesMunicipalities] = useState<
    { value: string; label: string }[]
  >([]);
  const [barangays, setBarangays] = useState<{ value: string; label: string }[]>([]);

  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedCityMunicipality, setSelectedCityMunicipality] = useState<string | null>(null);
  const [selectedBarangay, setSelectedBarangay] = useState<string | null>(null);

  const [selectedRegionName, setSelectedRegionName] = useState<string | null>(null);
  const [selectedProvinceName, setSelectedProvinceName] = useState<string | null>(null);
  const [selectedCityMunicipalityName, setSelectedCityMunicipalityName] = useState<string | null>(
    null
  );
  const [selectedBarangayName, setSelectedBarangayName] = useState<string | null>(null);

  const [loadingAddress, setLoadingAddress] = useState({
    region: false,
    province: false,
    cityMunicipality: false,
    barangay: false,
  });
    // Account status indicators for displaying user activity metrics
  const [accountStatus, setAccountStatus] = useState({
    isVerified: true,
    joinDate: '2023-05-18',
  });

  useEffect(() => {
    const loadRegions = async () => {
      setLoadingAddress((prev) => ({ ...prev, region: true }));
      const regionsData = await fetchRegions();
      setRegions(
        regionsData.map((region: { code: string; name: string }) => ({
          value: region.code,
          label: region.name,
        }))
      );
      setLoadingAddress((prev) => ({ ...prev, region: false }));
    };
    loadRegions();
  }, []);

  const updateDeliveryAddress = (
    region: string | null,
    province: string | null,
    cityMunicipality: string | null,
    barangay: string | null
  ) => {
    const deliveryAddress = [region, province, cityMunicipality, barangay]
      .filter(Boolean)
      .join(', ');

    setUserData((prev) => ({ ...prev, delivery_address: deliveryAddress }));
  };

  const handleRegionChange = async (regionCode: string | null) => {
    const region = regions.find((r: { value: string; label: string }) => r.value === regionCode);
    setSelectedRegion(regionCode);
    setSelectedRegionName(region ? region.label : null);
    setProvinces([]);
    setCitiesMunicipalities([]);
    setBarangays([]);
    setSelectedProvince(null);
    setSelectedCityMunicipality(null);
    setSelectedBarangay(null);
    setSelectedProvinceName(null);
    setSelectedCityMunicipalityName(null);
    setSelectedBarangayName(null);

    setLoadingAddress((prev) => ({ ...prev, province: true }));
    const provincesData = await fetchProvinces(regionCode);
    setProvinces(
      provincesData.map((province: { code: string; name: string }) => ({
        value: province.code,
        label: province.name,
      }))
    );
    setLoadingAddress((prev) => ({ ...prev, province: false }));
    updateDeliveryAddress(region ? region.label : null, null, null, null);
  };

  const handleProvinceChange = async (provinceCode: string | null) => {
    const province = provinces.find((p: { value: string }) => p.value === provinceCode);
    setSelectedProvince(provinceCode);
    setSelectedProvinceName(province ? province.label : null);
    setCitiesMunicipalities([]);
    setBarangays([]);
    setSelectedCityMunicipality(null);
    setSelectedBarangay(null);
    setSelectedCityMunicipalityName(null);
    setSelectedBarangayName(null);

    setLoadingAddress((prev) => ({ ...prev, cityMunicipality: true }));
    const citiesMunicipalitiesData = await fetchCitiesMunicipalities(provinceCode);
    setCitiesMunicipalities(
      citiesMunicipalitiesData.map((city: { code: string; name: string }) => ({
        value: city.code,
        label: city.name,
      }))
    );
    setLoadingAddress((prev) => ({ ...prev, cityMunicipality: false }));
    updateDeliveryAddress(selectedRegionName, province ? province.label : null, null, null);
  };

  const handleCityMunicipalityChange = async (cityMunicipalityCode: string | null) => {
    const cityMunicipality = citiesMunicipalities.find(
      (c: { value: string }) => c.value === cityMunicipalityCode
    );
    setSelectedCityMunicipality(cityMunicipalityCode);
    setSelectedCityMunicipalityName(cityMunicipality ? cityMunicipality.label : null);
    setBarangays([]);
    setSelectedBarangay(null);
    setSelectedBarangayName(null);

    setLoadingAddress((prev) => ({ ...prev, barangay: true }));
    const barangaysData = await fetchBarangays(cityMunicipalityCode);
    setBarangays(
      barangaysData.map((barangay: { code: string; name: string }) => ({
        value: barangay.code,
        label: barangay.name,
      }))
    );
    setLoadingAddress((prev) => ({ ...prev, barangay: false }));
    updateDeliveryAddress(
      selectedRegionName,
      selectedProvinceName,
      cityMunicipality ? cityMunicipality.label : null,
      null
    );
  };

  const handleBarangayChange = (barangayCode: string | null) => {
    const barangay = barangays.find((b: { value: string }) => b.value === barangayCode);
    setSelectedBarangay(barangayCode);
    setSelectedBarangayName(barangay ? barangay.label : null);
    updateDeliveryAddress(
      selectedRegionName,
      selectedProvinceName,
      selectedCityMunicipalityName,
      barangay ? barangay.label : null
    );
  };

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [newProfilePic, setNewProfilePic] = useState<File | null>(null);
  const [opened, { toggle }] = useDisclosure();

  const { data, error: fetchError } = useSWR('profile/', fetcher);

  useEffect(() => {
    if (data) {
      setUserData(data);
      setLoading(false);
    }
    if (fetchError) {
      setError('Failed to fetch user data.');
      setLoading(false);
    }
  }, [data, fetchError]);

  // Reset new picture when exiting edit mode
  const handleEditToggle = () => {
    setEditing((prev) => !prev);
    
    // When entering edit mode, parse address and populate selections
    if (!editing) {
      parseAndPopulateAddress();
    } else {
      setNewProfilePic(null); // Clear new profile pic when exiting edit mode
    }
  };  // Function to parse the saved address and populate dropdown fields
  const parseAndPopulateAddress = async () => {
    try {
      if (!userData.delivery_address) return;
      
      // Split by comma, and handle different formats (with or without spaces after commas)
      const addressParts = userData.delivery_address.split(/,\s*/);
      console.log('Parsing address:', userData.delivery_address);
      console.log('Address parts:', addressParts);
    
    if (addressParts.length > 0) {
      // Load regions first
      setLoadingAddress(prev => ({ ...prev, region: true }));
      const regionsData = await fetchRegions();
      const formattedRegions = regionsData.map((region: { code: string; name: string }) => ({
        value: region.code,
        label: region.name,
      }));
      setRegions(formattedRegions);
        // Find and set region (with case-insensitive matching)
      const matchedRegion = formattedRegions.find(
        r => r.label.toLowerCase() === addressParts[0].toLowerCase()
      );
      if (matchedRegion) {
        setSelectedRegion(matchedRegion.value);
        setSelectedRegionName(matchedRegion.label);
        
        // Load provinces for this region
        setLoadingAddress(prev => ({ ...prev, province: true }));
        const provincesData = await fetchProvinces(matchedRegion.value);
        const formattedProvinces = provincesData.map((province: { code: string; name: string }) => ({
          value: province.code,
          label: province.name,
        }));
        setProvinces(formattedProvinces);
        setLoadingAddress(prev => ({ ...prev, region: false, province: false }));
        
        // Find and set province
        if (addressParts.length > 1) {          const matchedProvince = formattedProvinces.find(
            p => p.label.toLowerCase() === addressParts[1].toLowerCase()
          );
          if (matchedProvince) {
            setSelectedProvince(matchedProvince.value);
            setSelectedProvinceName(matchedProvince.label);
            
            // Load cities for this province
            setLoadingAddress(prev => ({ ...prev, cityMunicipality: true }));
            const citiesData = await fetchCitiesMunicipalities(matchedProvince.value);
            const formattedCities = citiesData.map((city: { code: string; name: string }) => ({
              value: city.code,
              label: city.name,
            }));
            setCitiesMunicipalities(formattedCities);
            setLoadingAddress(prev => ({ ...prev, cityMunicipality: false }));
            
            // Find and set city/municipality
            if (addressParts.length > 2) {              const matchedCity = formattedCities.find(
                c => c.label.toLowerCase() === addressParts[2].toLowerCase()
              );
              if (matchedCity) {
                setSelectedCityMunicipality(matchedCity.value);
                setSelectedCityMunicipalityName(matchedCity.label);
                
                // Load barangays for this city/municipality
                setLoadingAddress(prev => ({ ...prev, barangay: true }));
                const barangaysData = await fetchBarangays(matchedCity.value);
                const formattedBarangays = barangaysData.map((barangay: { code: string; name: string }) => ({
                  value: barangay.code,
                  label: barangay.name,
                }));
                setBarangays(formattedBarangays);
                setLoadingAddress(prev => ({ ...prev, barangay: false }));
                
                // Find and set barangay
                if (addressParts.length > 3) {                  const matchedBarangay = formattedBarangays.find(
                    b => b.label.toLowerCase() === addressParts[3].toLowerCase()
                  );
                  if (matchedBarangay) {
                    setSelectedBarangay(matchedBarangay.value);
                    setSelectedBarangayName(matchedBarangay.label);
                  }                }
              }
            }
          }
        }
      }
    }
    } catch (error) {
      console.error('Error parsing address:', error);
      setError('Failed to parse address for editing');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (file: File | null) => {
    setNewProfilePic(file);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    (Object.keys(userData) as (keyof typeof userData)[]).forEach((key) => {
      if (key !== 'profile_picture') {
        formData.append(key, userData[key] as string | Blob);
      }
    });
    if (newProfilePic) {
      formData.append('profile_picture', newProfilePic);
    }

    // Append address details
    const deliveryAddress = [
      selectedRegionName,
      selectedProvinceName,
      selectedCityMunicipalityName,
      selectedBarangayName,
    ]
      .filter(Boolean)
      .join(', ');

    formData.append('delivery_address', deliveryAddress);

    try {
      notifications.show({
        id: 'profile-update',
        loading: true,
        title: 'Updating Profile',
        message: 'Please wait while your profile is being updated...',
        autoClose: false,
      });

      const response = await axios.put('profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setUserData(response.data);
      
      notifications.update({
        id: 'profile-update',
        title: 'Profile Updated',
        message: 'Your profile has been successfully updated.',
        color: 'green',
        loading: false,
        autoClose: 3000,
      });
      
      setEditing(false);
      setNewProfilePic(null); // Clear the file input
    } catch (err) {
      console.error('Update profile error:', err);
      
      notifications.update({
        id: 'profile-update',
        title: 'Update Failed',
        message: 'There was a problem updating your profile.',
        color: 'red',
        loading: false,
        autoClose: 3000,
      });
      
      setError('Failed to update profile.');
    }
  };

  if (loading) {
    return <LoadingOverlay visible={true} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />;
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { desktop: true, mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header pos={'sticky'}>
        <>
          <HeaderComponent opened={opened} toggle={toggle} />
        </>
      </AppShell.Header>

      <AppShell.Navbar py="md" px={4}>
        <UnstyledButton component="a" href="/projects/page" className={classes.control}>
          Projects
        </UnstyledButton>
        <UnstyledButton component="a" href="/products/page" className={classes.control}>
          Products
        </UnstyledButton>
        <UnstyledButton className={classes.control}>Services</UnstyledButton>
        <UnstyledButton className={classes.control}>About Us</UnstyledButton>
      </AppShell.Navbar>      <AppShell.Main style={{ display: 'flex', flexDirection: 'column', 
        minHeight: '100vh', backgroundColor: '#f8f9fa', marginTop: '10px', padding: 0 }}>        <Container size="xl" pt={40} pb={20} style={{ flex: 1, marginBottom: '40px' }}>          <Tabs defaultValue="profile">            <Tabs.List 
              mb="md" 
              style={{ 
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                border: '1px solid #e9ecef',
                borderRadius: '8px',
                padding: '4px',
                gap: '0'
              }}
            >              <Tabs.Tab 
                value="profile" 
                leftSection={<IconUser size={16} />}
                style={{ 
                  textAlign: 'center',
                  width: '140px',
                  padding: '12px 8px',
                  margin: '0',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  fontSize: '14px'
                }}
              >
                Profile
              </Tabs.Tab>
              <Tabs.Tab 
                value="approve" 
                leftSection={<IconCheck size={16} />}
                style={{ 
                  textAlign: 'center',
                  width: '140px',
                  padding: '12px 8px',
                  margin: '0',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  fontSize: '14px'
                }}
              >
                To Approve
              </Tabs.Tab>
              <Tabs.Tab 
                value="ship" 
                leftSection={<IconMapPin size={16} />}
                style={{ 
                  textAlign: 'center',
                  width: '140px',
                  padding: '12px 8px',
                  margin: '0',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  fontSize: '14px'
                }}
              >
                To Be Shipped
              </Tabs.Tab>
              <Tabs.Tab 
                value="completed" 
                leftSection={<IconStar size={16} />}
                style={{ 
                  textAlign: 'center',
                  width: '140px',
                  padding: '12px 8px',
                  margin: '0',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  fontSize: '14px'
                }}
              >
                Completed
              </Tabs.Tab>
              <Tabs.Tab 
                value="cancelled" 
                leftSection={<IconCalendarStats size={16} />}
                style={{ 
                  textAlign: 'center',
                  width: '140px',
                  padding: '12px 8px',
                  margin: '0',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  fontSize: '14px'
                }}
              >
                Cancelled
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="profile" pt="md">
              <Grid gutter="xl">
                {/* Left Column - Profile Summary */}
                <Grid.Col span={{ base: 12, sm: 12, md: 4, lg: 3 }}>
                  <Card shadow="sm" radius="md" withBorder p="lg">
                    {/* Profile Header with gradient background */}
                    <Box 
                      style={{ 
                        textAlign: 'center',
                        position: 'relative',
                        marginBottom: '1.5rem'
                      }}
                    >
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <Avatar
                          size={130}
                          radius={65}
                          src={userData.profile_picture ? userData.profile_picture.toString() : null}
                          alt="Profile Picture"
                          mx="auto"
                          style={{ 
                            border: '4px solid #e9ecef',
                            boxShadow: '0 0 15px rgba(0,0,0,0.1)'
                          }}
                        />
                        {!editing && (
                          <div style={{
                            position: 'absolute',
                            bottom: 5,
                            right: 5,
                            backgroundColor: '#38C976',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            border: '2px solid white'
                          }}></div>
                        )}
                      </div>
                      <Title order={3} mt="md">{userData.first_name} {userData.last_name}</Title>
                      <Text c="dimmed" size="sm">@{userData.username}</Text>
                      <Badge color="teal" variant="light" mt="xs">Verified Customer</Badge>
                    </Box>
                    
                    <Divider my="md" />
                     <Button 
                      fullWidth 
                      mt="xl"
                      color={editing ? 'green' : 'blue'}
                      onClick={editing ? handleSubmit : handleEditToggle}
                      leftSection={editing ? <IconCheck size={16} /> : <IconEdit size={16} />}
                      radius="md"
                    >
                      {editing ? 'Save Changes' : 'Edit Profile'}
                    </Button>
                    
                    {editing && (
                      <Button 
                        fullWidth 
                        mt="md"
                        variant="outline" 
                        color="red" 
                        onClick={handleEditToggle}
                        radius="md"
                      >
                        Cancel
                      </Button>
                    )}
                  </Card>
                </Grid.Col>
                
                {/* Right Column - User Details */}
                <Grid.Col span={{ base: 12, sm: 12, md: 8, lg: 9 }}>
                  <Card shadow="sm" radius="md" withBorder p="lg">
                    <Title order={3} mb="md">User Information</Title>
                    
                    {error && (
                      <Box 
                        mb="md" 
                        p="sm" 
                        style={{ 
                          backgroundColor: '#FFF5F5', 
                          borderRadius: '8px',
                          border: '1px solid #FFD5D5'
                        }}
                      >
                        <Text color="red">{error}</Text>
                      </Box>
                    )}
                    
                    {editing && (
                      <Box 
                        mb="lg" 
                        p="md" 
                        style={{ 
                          backgroundColor: '#E3F2FD', 
                          borderRadius: '8px'
                        }}
                      >
                        <Text c="blue" size="sm">
                          <b>Edit Mode:</b> Make changes to your profile information and click Save Changes when done.
                        </Text>
                      </Box>
                    )}

                    {/* Profile picture upload in edit mode */}
                    {editing && (
                      <Card withBorder radius="md" mb="lg">
                        <Card.Section bg="blue.0" p="md">
                          <Title order={5}>Profile Picture</Title>
                        </Card.Section>
                        <Card.Section p="md">
                          <Group align="flex-start">
                            <Avatar
                              size={100}
                              radius={50}
                              src={userData.profile_picture ? userData.profile_picture.toString() : null}
                              alt="Current Profile Picture"
                            />
                            
                            <Box style={{ flex: 1 }}>
                              <Text fw={500} mb="xs">Update Profile Picture</Text>
                              <FileInput
                                label="Choose a new image"
                                description="Recommended: Square image (JPG, PNG)"
                                accept="image/*"
                                onChange={handleFileChange}
                                placeholder="Select image"
                                style={{ maxWidth: '100%' }}
                              />
                            </Box>
                            
                            {newProfilePic && (
                              <Box>
                                <Text fw={500} size="sm" mb="xs" ta="center">Preview</Text>
                                <Avatar
                                  size={100}
                                  radius={50}
                                  src={URL.createObjectURL(newProfilePic)}
                                  alt="New Profile Picture Preview"
                                  style={{ border: '2px solid #e9ecef' }}
                                />
                              </Box>
                            )}
                          </Group>
                        </Card.Section>
                      </Card>
                    )}
                    
                    {/* Personal Information */}
                    <Card withBorder radius="md" mb="lg">
                      <Card.Section bg="blue.0" p="md">
                        <Title order={5}>Personal Information</Title>
                      </Card.Section>
                      <Card.Section p="md">
                        <Grid>
                          <Grid.Col span={{ base: 12, sm: 6 }}>
                            <TextInput
                              label="First Name"
                              name="first_name"
                              value={userData.first_name}
                              onChange={handleInputChange}
                              readOnly={!editing}
                              leftSection={<IconUser size={16} color="#228be6" />}
                              mb="md"
                              styles={(theme) => ({
                                input: {
                                  borderColor: editing ? theme.colors.blue[3] : undefined,
                                  backgroundColor: !editing ? theme.colors.gray[0] : undefined,
                                }
                              })}
                            />
                          </Grid.Col>
                          
                          <Grid.Col span={{ base: 12, sm: 6 }}>
                            <TextInput
                              label="Last Name"
                              name="last_name"
                              value={userData.last_name}
                              onChange={handleInputChange}
                              readOnly={!editing}
                              leftSection={<IconUser size={16} color="#228be6" />}
                              mb="md"
                              styles={(theme) => ({
                                input: {
                                  borderColor: editing ? theme.colors.blue[3] : undefined,
                                  backgroundColor: !editing ? theme.colors.gray[0] : undefined,
                                }
                              })}
                            />
                          </Grid.Col>
                          
                          <Grid.Col span={{ base: 12, sm: 6 }}>
                            <TextInput
                              label="Username"
                              name="username"
                              value={userData.username}
                              onChange={handleInputChange}
                              readOnly={!editing}
                              leftSection={<IconAt size={16} color="#228be6" />}
                              mb="md"
                              styles={(theme) => ({
                                input: {
                                  borderColor: editing ? theme.colors.blue[3] : undefined,
                                  backgroundColor: !editing ? theme.colors.gray[0] : undefined,
                                }
                              })}
                            />
                          </Grid.Col>
                          
                          <Grid.Col span={{ base: 12, sm: 6 }}>
                            <TextInput
                              label="Email"
                              name="email"
                              value={userData.email}
                              onChange={handleInputChange}
                              readOnly={!editing}
                              leftSection={<IconMail size={16} color="#228be6" />}
                              mb="md"
                              styles={(theme) => ({
                                input: {
                                  borderColor: editing ? theme.colors.blue[3] : undefined,
                                  backgroundColor: !editing ? theme.colors.gray[0] : undefined,
                                }
                              })}
                            />
                          </Grid.Col>
                        </Grid>
                      </Card.Section>
                    </Card>
                    
                    {/* Address Information */}
                    <Card withBorder radius="md">
                      <Card.Section bg="blue.0" p="md">
                        <Title order={5}>Address Information</Title>
                      </Card.Section>
                      <Card.Section p="md">
                        <TextInput
                          label="Current Delivery Address"
                          name="delivery_address"
                          value={userData.delivery_address}
                          readOnly
                          leftSection={<IconMapPin size={16} color="#228be6" />}
                          mb={editing ? "lg" : "md"}
                          styles={(theme) => ({
                            input: {
                              backgroundColor: theme.colors.gray[0],
                            }
                          })}
                        />
                        
                        {editing && (
                          <>
                            <Divider label="Update Delivery Address" labelPosition="center" mb="md" />
                            
                            <Grid>
                              <Grid.Col span={{ base: 12, sm: 6 }}>
                                <Select
                                  label="Region"
                                  placeholder="Select Region"
                                  data={regions}
                                  value={selectedRegion}
                                  onChange={handleRegionChange}
                                  searchable
                                  disabled={loadingAddress.region}
                                  leftSection={<IconBuildingCommunity size={16} color="#228be6" />}
                                  mb="md"
                                />
                              </Grid.Col>
                              
                              <Grid.Col span={{ base: 12, sm: 6 }}>
                                <Select
                                  label="Province"
                                  placeholder="Select Province"
                                  data={provinces}
                                  value={selectedProvince}
                                  onChange={handleProvinceChange}
                                  searchable
                                  disabled={!selectedRegion || loadingAddress.province}
                                  leftSection={<IconBuildingCommunity size={16} color="#228be6" />}
                                  mb="md"
                                />
                              </Grid.Col>
                              
                              <Grid.Col span={{ base: 12, sm: 6 }}>
                                <Select
                                  label="City/Municipality"
                                  placeholder="Select City/Municipality"
                                  data={citiesMunicipalities}
                                  value={selectedCityMunicipality}
                                  onChange={handleCityMunicipalityChange}
                                  searchable
                                  disabled={!selectedProvince || loadingAddress.cityMunicipality}
                                  leftSection={<IconBuildingCommunity size={16} color="#228be6" />}
                                  mb="md"
                                />
                              </Grid.Col>
                              
                              <Grid.Col span={{ base: 12, sm: 6 }}>
                                <Select
                                  label="Barangay"
                                  placeholder="Select Barangay"
                                  data={barangays}
                                  value={selectedBarangay}
                                  onChange={handleBarangayChange}
                                  searchable
                                  disabled={!selectedCityMunicipality || loadingAddress.barangay}
                                  leftSection={<IconMapPin size={16} color="#228be6" />}
                                  mb="md"
                                />
                              </Grid.Col>
                            </Grid>
                          </>
                        )}
                      </Card.Section>
                    </Card>
                  </Card>
                </Grid.Col>
              </Grid>
            </Tabs.Panel>

            <Tabs.Panel value="approve" pt="xs">
              <OrderTable status="PENDING" />
            </Tabs.Panel>

            <Tabs.Panel value="ship" pt="xs">
              <OrderTable status="ACCEPTED" />
            </Tabs.Panel>

            <Tabs.Panel value="completed" pt="xs">
              <OrderTable status="DELIVERED" />
            </Tabs.Panel>

            <Tabs.Panel value="cancelled" pt="xs">
              <OrderTable status="CANCELLED" />
            </Tabs.Panel>          </Tabs>
        </Container>        <Box mt={80} style={{ width: '100%', marginTop: '80px' }}>
          <FooterLinks />
        </Box>
      </AppShell.Main>
    </AppShell>
  );
};

export default ProfilePage;
