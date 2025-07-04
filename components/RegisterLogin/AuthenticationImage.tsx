import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Anchor,
  AppShell,
  Button,
  Checkbox,
  Paper,
  PasswordInput,
  Select,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  fetchBarangays,
  fetchCitiesMunicipalities,
  fetchProvinces,
  fetchRegions,
  obtainToken,
  registerUser,
  useUserStore,
} from '../../utils/authAPI/userApi';
import HeaderComponent from '../headerPAGE/headerComponent';
import classes from './AuthenticationImage.module.css';

export function AuthenticationImage() {
  const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(false); // State to toggle between login and register
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    delivery_address: '',
    username: '',
  }); // State to handle form data
  const [error, setError] = useState(''); // State to handle error messages

  //address
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

  const [loading, setLoading] = useState(false);

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

    setFormData((prev) => ({ ...prev, delivery_address: deliveryAddress }));
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

  // Function to reset form data and error state
  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      username: '',
      delivery_address: '',
    });
    setError(''); // Clear any existing errors
  };

  const handleInputChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRegisterClick = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setIsRegistering((prev) => !prev); // Toggle between register and loginj
    resetForm(); // Reset the form and error on toggle
  };

  const handleSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    try {
      setLoading(true);
      if (isRegistering) {
        // Handle registration
        try {
          const response = await registerUser(formData);

          resetForm(); // Clear the form after successful registration
          setIsRegistering(false); // Switch to login after registration
        } catch (err) {
          console.error('Error during submission:', err);
          setError('An error occurred. Please try again.'); // Set error message
        }
      } else {
        // Handle login
        const credentials = {
          username: formData.username,
          password: formData.password,
        };
        console.log('credentials:', credentials);
        const response = await obtainToken(credentials);
        console.log('Login successful:', response);
        resetForm(); // Clear the form after successful login
        // router.push('/profile/page');

        if (response.role === 'admin' || response.role === 'employee') {
          router.push('/admin/adminDashboard');
        } else {
          router.push('/profile/page');
        }
        // Optionally handle post-login logic (like saving token, redirecting, etc.)
      }
    } catch (err) {
      console.error('Error during submission:', err);
      setError('An error occurred. Please try again.'); // Set error message
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <AppShell withBorder className={classes.authShell} padding="md" title="Login or Register">
      <AppShell.Header>
        <HeaderComponent
          opened={false}
          toggle={function (): void {
            throw new Error('Function not implemented.');
          }}
        />
      </AppShell.Header>
      <AppShell.Main>
        <div className={classes.wrapper}>
          <Paper className={classes.form} radius={0} p={30} mt={50}>
            <Title order={2} className={classes.title} ta="center" mt="md" mb={50} pl={40} pr={40}>
              {isRegistering ? 'Create an Account' : 'Charles J Construction Services'}
            </Title>
            {error && (
              <Text color="red" ta="center">
                {error}
              </Text>
            )}{' '}
            {/* Display error message */}
            <form onSubmit={handleSubmit}>
              {isRegistering && (
                <>
                  <TextInput
                    label="First Name"
                    placeholder="John"
                    size="md"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                  />
                  <TextInput
                    label="Last Name"
                    placeholder="Doe"
                    size="md"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required
                  />
                  <TextInput
                    label="Email address"
                    placeholder="hello@gmail.com"
                    size="md"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                  <TextInput
                    label="Delivery Address"
                    name="delivery_address"
                    value={formData.delivery_address}
                    onChange={handleInputChange}
                    mb="md"
                    readOnly
                  />
                  <Select
                    label="Region"
                    placeholder="Select Region"
                    data={regions}
                    value={selectedRegion}
                    onChange={handleRegionChange}
                    searchable
                    disabled={loadingAddress.region}
                  />

                  <Select
                    label="Province"
                    placeholder="Select Province"
                    data={provinces}
                    value={selectedProvince}
                    onChange={handleProvinceChange}
                    searchable
                    disabled={!selectedRegion || loadingAddress.province}
                  />

                  <Select
                    label="City/Municipality"
                    placeholder="Select City/Municipality"
                    data={citiesMunicipalities}
                    value={selectedCityMunicipality}
                    onChange={handleCityMunicipalityChange}
                    searchable
                    disabled={!selectedProvince || loadingAddress.cityMunicipality}
                  />

                  <Select
                    label="Barangay"
                    placeholder="Select Barangay"
                    data={barangays}
                    value={selectedBarangay}
                    onChange={handleBarangayChange}
                    searchable
                    disabled={!selectedCityMunicipality || loadingAddress.barangay}
                  />
                </>
              )}

              <TextInput
                label="Username"
                placeholder="johndoe"
                size="md"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
              <PasswordInput
                label="Password"
                placeholder="Your password"
                mt="md"
                size="md"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <Button fullWidth mt="xl" size="md" type="submit" loading={loading}>
                {isRegistering ? 'Register' : 'Login'}
              </Button>
            </form>
            <Text ta="center" mt="md">
              {isRegistering ? (
                <>
                  Already have an account?{' '}
                  <Anchor<'a'> href="#" fw={700} onClick={handleRegisterClick}>
                    Login
                  </Anchor>
                </>
              ) : (
                <>
                  Don&apos;t have an account?{' '}
                  <Anchor<'a'> href="#" fw={700} onClick={handleRegisterClick}>
                    Register
                  </Anchor>
                </>
              )}
            </Text>
          </Paper>
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
