import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import jwtDecode from 'jwt-decode';
import useSWR from 'swr';
import { create } from 'zustand';
import { LoadingOverlay } from '@mantine/core'; // Import LoadingOverlay
import { notifications } from '@mantine/notifications';
import axiosInstance from '../axiosInstance';
import psgcAxios from '../psgcAxios';

const fetcher = (url) => axiosInstance.get(url).then((res) => res.data);

export const decodeToken = () => {
  const { data: token, error } = useSWR('fetchdecodedtoken/', fetcher);

  if (error) {
    console.error('Token decoding error:', error);
    return {
      role: null,
      username: null,
      isLoading: false,
      isError: true,
    };
  }

  if (!token) {
    return {
      role: null,
      username: null,
      isLoading: true,
      isError: false,
    };
  }

  return {
    role: token.role,
    username: token.username,
    isLoading: false,
    isError: false,
  };
};

const withRoleProtection = (Component, allowedRoles = []) => {
  return (props) => {
    const router = useRouter();
    const { role, isLoading, isError } = decodeToken();

    useEffect(() => {
      if (!isLoading && !isError) {
        // Ensure allowedRoles is an array
        if (!Array.isArray(allowedRoles)) {
          console.error('allowedRoles should be an array');
          return;
        }

        // If the role is not in the allowedRoles array, redirect or show a modal
        if (!allowedRoles.includes(role)) {
          // You can redirect to a 403 page, home page, or show a modal
          notifications.show({ title: 'Error', message: 'You are not authorized', color: 'red' });
          router.push('/loginPage'); // Redirect to login page
        }
      }
    }, [role, isLoading, isError]);

    useEffect(() => {
      if (isError) {
        router.push('/loginPage'); // Redirect to login page on error
      }
    }, [isError]);

    if (isLoading) {
      return (
        <LoadingOverlay visible={true} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
      ); // Show a loading overlay while waiting
    }

    if (isError) {
      return <div>Error occurred</div>; // Handle error state
    }

    // If the role is allowed, render the protected component
    return <Component {...props} />;
  };
};

export default withRoleProtection;

// Example API calls for registration and profile retrieval
export const registerUser = async (userData) => {
  try {
    const response = await axiosInstance.post('register/', userData);
    console.log('response Status', response.status);
    if (response.status === 201) {
      return response.data;
    } else if (response.status === 400) {
      notifications.show({ title: 'Error', message: 'Error', color: 'red' });
      // return response.data.message;
      return response.data;
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.detail || 'An error occured, please try again later.';
    notifications.show({
      message: errorMessage,
      color: 'red',
    });
    return { error: errorMessage };
  }
};

export const getUserProfile = async () => {
  const response = await axiosInstance.get('profile/');
  return response.data;
};

export const obtainToken = async (credentials) => {
  try {
    const response = await axiosInstance.post('token/', credentials);
    const { data: token } = await axiosInstance.get('fetchdecodedtoken/');
    const role = token.role;
    return { ...response.data, role };
  } catch (error) {
    const errorMessage =
      error.response?.data?.detail || 'An error occured, please try again later.';
    notifications.show({
      message: errorMessage,
      color: 'red',
    });
  }
};

export const refreshToken = async () => {
  const response = await axiosInstance.post('token/refresh/', {
    jwt_refresh_token: Cookies.get('jwt_refresh_token'),
  });
  return response.data;
};

export const handleLogout = async (router) => {
  try {
    await axiosInstance.post('logout/');
    useUserStore.getState().clearUserData();
    notifications.show({ title: 'Success', message: 'Logged out successfully', color: 'green' });

    // Optionally, redirect to the login page
    window.location.href = '/loginPage';
  } catch (error) {
    console.error('Logout error:', error);
    notifications.show({ title: 'Error', message: 'Logout failed', color: 'red' });
  }
};

export const useUserStore = create((set) => ({
  role: null,
  profilePicture: null,
  isLoading: true,
  isError: false,
  fetchUserData: async () => {
    try {
      const { data: token } = await axiosInstance.get('fetchdecodedtoken/');
      const profile = await axiosInstance.get('profile/'); // Assuming a user profile API exists
      set({
        role: token.role,
        profilePicture: profile.data.profile_picture,
        isLoading: false,
        isError: false,
      });
    } catch (error) {
      console.error('User data fetching error:', error);
      set({ isError: true, isLoading: false });
    }
  },
  clearUserData: () => set({ role: null, profilePicture: null }),
}));

export const fetchRegions = async () => {
  try {
    const response = await psgcAxios.get('/regions.json');
    return response.data;
  } catch (error) {
    console.error('Error fetching regions:', error);
    return [];
  }
};

export const fetchProvinces = async (regionCode) => {
  try {
    const response = await psgcAxios.get(`/provinces.json`);
    return response.data.filter((province) => province.regionCode === regionCode);
  } catch (error) {
    console.error('Error fetching provinces:', error);
    return [];
  }
};

export const fetchCitiesMunicipalities = async (provinceCode) => {
  try {
    const response = await psgcAxios.get(`/cities-municipalities.json`);
    return response.data.filter((city) => city.provinceCode === provinceCode);
  } catch (error) {
    console.error('Error fetching cities/municipalities:', error);
    return [];
  }
};
export const fetchBarangays = async (cityMunicipalityCode) => {
  try {
    const response = await psgcAxios.get(
      `/cities-municipalities/${cityMunicipalityCode}/barangays/`
    );
    console.log(
      'City/Municipality Code:',
      response.data.filter(
        (barangay) =>
          barangay.cityCode === cityMunicipalityCode ||
          barangay.municipalityCode === cityMunicipalityCode
      )
    );
    return response.data.filter(
      (barangay) =>
        barangay.cityCode === cityMunicipalityCode ||
        barangay.municipalityCode === cityMunicipalityCode
    );
  } catch (error) {
    console.error('Error fetching barangays:', error);
    return [];
  }
};
