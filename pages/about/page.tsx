import { AppShell, Burger, Button, Group, Image, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { FeaturesCards } from '../../components/aboutPage/MissionVision/MissionVision';
import HeaderComponent from '../../components/headerPAGE/headerComponent';
import { CardsCarousel } from '../../components/landingPage/carousel/carousel';
import { FooterLinks } from '../../components/landingPage/footer/footer';
import { HeroContentLeft } from '../../components/landingPage/hero/hero';
import classes from '../../components/module.css/MobileNavbar.module.css';
import { AuthenticationImage } from '../../components/RegisterLogin/AuthenticationImage';

export default function AboutPage() {
  const [opened, { toggle }] = useDisclosure();
  return (
    <>
      <AppShell
        header={{ height: 60 }}
        navbar={{ width: 300, breakpoint: 'sm', collapsed: { desktop: true, mobile: !opened } }}
        padding="md"
      >
        <AppShell.Header>
          {/* <Group h="100%" px="md">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Group justify="space-between" style={{ flex: 1 }}>
              <Image src="/charleslogo.png" alt="logo" width={100} height={'60'} />
              <Group ml="xl" gap={0} visibleFrom="sm">
                <UnstyledButton component="a" href="/projects/page" className={classes.control}>
                  Projects
                </UnstyledButton>
                <UnstyledButton component="a" href="/products/page" className={classes.control}>
                  Products
                </UnstyledButton>
                <UnstyledButton className={classes.control}>Services</UnstyledButton>
                <UnstyledButton component="a" href="#" className={classes.control}>
                  About Us
                </UnstyledButton>
              </Group>
            </Group>
            <Button component="a" href="/loginPage/" variant="default">
              Log in
            </Button>
            <Button>Sign up</Button>
          </Group> */}
          <HeaderComponent opened={opened} toggle={toggle} />
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
        </AppShell.Navbar>

        <AppShell.Main p={0}>
          <HeroContentLeft
            imageUrl={'/buridingu.jpg'}
            heroTitle="About Us"
            heroText1="Our Purpose:"
            heroText2="Building with integrity"
          />
          <FeaturesCards />
          <FooterLinks />
        </AppShell.Main>
      </AppShell>
    </>
  );
}
