import { useEffect } from 'react';
import { Avatar, Burger, Button, Group, LoadingOverlay, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import classes from '../../components/module.css/MobileNavbar.module.css';
import { handleLogout, useUserStore } from '../../utils/authAPI/userApi';
import CartButton from '../cartButton';

interface HeaderComponentProps {
  opened: boolean;
  toggle: () => void;
}

export default function HeaderComponent({ opened, toggle }: HeaderComponentProps) {
  const { role, profilePicture, fetchUserData, isLoading } = useUserStore();

  console.log(
    'Role, Profile Picture, Fetch User Data, Is Loading: ',
    role,
    profilePicture,
    fetchUserData,
    isLoading
  );

  // Fetch user data only when the component mounts
  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <>
      <Group h="100%" px="md">
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        <Group justify="space-between" style={{ flex: 1 }}>
          <Avatar src="/charleslogo.png" alt="logo" w={60} h={60} component="a" href="/" />
          <Group ml="xl" gap={0} visibleFrom="sm">
            <UnstyledButton component="a" href="/projects/page" className={classes.control}>
              Projects
            </UnstyledButton>
            <UnstyledButton component="a" href="/products/page" className={classes.control}>
              Products
            </UnstyledButton>
            <UnstyledButton component="a" href="/about/page" className={classes.control}>
              About Us
            </UnstyledButton>
            {role === 'admin' && (
              <UnstyledButton
                component="a"
                href="/admin/adminDashboard"
                className={classes.control}
              >
                Admin Dashboard
              </UnstyledButton>
            )}
          </Group>
        </Group>
        {isLoading ? (
          // <LoadingOverlay visible />
          <></>
        ) : role ? (
          <>
            {profilePicture && (
              <Avatar
                src={`${profilePicture}`}
                alt="Profile Picture"
                radius="xl"
                component="a"
                href="/profile/page"
              />
            )}
            <Button onClick={handleLogout} variant="default">
              Log out
            </Button>

            <CartButton />
          </>
        ) : (
          <>
            <Button component="a" href="/loginPage/" variant="default">
              Log in
            </Button>
            <Button component="a" href="/loginPage/">
              Sign up
            </Button>
          </>
        )}
      </Group>
    </>
  );
}
