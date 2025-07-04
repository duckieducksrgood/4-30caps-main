import {
  AppShell,
  Avatar,
  Burger,
  Button,
  Container,
  Divider,
  Grid,
  Group,
  Image,
  Menu,
  MenuItem,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Timeline,
  Title,
  UnstyledButton,
  rem,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useRef, useState } from 'react';
import { 
  IconAward, 
  IconBuildingSkyscraper, 
  IconBulldozer,
  IconCertificate, 
  IconClock, 
  IconHeartHandshake, 
  IconHelmet,
  IconHome,
  IconHorseToy,
  IconPaint, 
  IconRuler, 
  IconToolsKitchen2,
  IconTrendingUp, 
  IconTrophy,
  IconTrowel,
  IconUsers
} from '@tabler/icons-react';
import HeaderComponent from '../components/headerPAGE/headerComponent';
import { CardsCarousel } from '../components/landingPage/carousel/carousel';
import { FooterLinks } from '../components/landingPage/footer/footer';
import { HeroContentLeft } from '../components/landingPage/hero/hero';
import { AnimatedCompanyHeader } from '../components/landingPage/hero/AnimatedCompanyHeader';
import { ResponsiveTimeline } from '../components/landingPage/timeline/ResponsiveTimeline';
import navClasses from '../components/module.css/MobileNavbar.module.css';
import homeClasses from './Home.module.css';
import { AuthenticationImage } from '../components/RegisterLogin/AuthenticationImage';
import { decodeToken } from '../utils/authAPI/userApi';
import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import { Welcome } from '../components/Welcome/Welcome';

export default function HomePage() {
  const [opened, { toggle }] = useDisclosure();
  const philosophyRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);

  // Custom easing function for smooth scrolling with ease-in-out effect
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    if (!ref.current) return;
    
    const startPosition = window.pageYOffset;
    const yOffset = -60; // Adjust based on header height
    const targetPosition = ref.current.getBoundingClientRect().top + startPosition + yOffset;
    const distance = targetPosition - startPosition;
    const duration = 1000; // Duration in milliseconds
    let start: number | null = null;
    
    // Easing function - easeInOutCubic
    function easeInOutCubic(t: number): number {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function step(timestamp: number) {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = easeInOutCubic(progress);
      
      window.scrollTo(0, startPosition + distance * easeProgress);
      
      if (elapsed < duration) {
        window.requestAnimationFrame(step);
      }
    }
    
    window.requestAnimationFrame(step);
  };

  return (
    <>
      <AppShell
        header={{ height: 60 }}
        navbar={{ width: 300, breakpoint: 'sm', collapsed: { desktop: true, mobile: !opened } }}
        padding="0"
        styles={{
          main: {
            paddingTop: '60px', // Add padding to account for fixed header
          },
        }}
      >
        <AppShell.Header style={{ padding: 0 }}>
          <HeaderComponent opened={opened} toggle={toggle} />
        </AppShell.Header>

        <AppShell.Navbar p="md">
          <UnstyledButton component="a" href="projects/page" className={navClasses.control}>
            Projects
          </UnstyledButton>
          <UnstyledButton component="a" href="products/page" className={navClasses.control}>
            Products
          </UnstyledButton>
          <UnstyledButton className={navClasses.control}>Services</UnstyledButton>
          <UnstyledButton className={navClasses.control}>About Us</UnstyledButton>
          <Menu>
            <Menu.Target>
              <Avatar src="avatar.png" alt="it's me" />
            </Menu.Target>

            <Menu.Dropdown>
              <MenuItem>Profile</MenuItem>
              <MenuItem>Settings</MenuItem>
              <Menu.Divider />
              <MenuItem>Logout</MenuItem>
            </Menu.Dropdown>
          </Menu>
        </AppShell.Navbar>

        <AppShell.Main>
          {/* Company Name Header - Animated to hide/show on scroll */}
          <AnimatedCompanyHeader 
            scrollToPhilosophy={() => scrollToSection(philosophyRef)}
            scrollToProjects={() => scrollToSection(projectsRef)}
          />

          {/* Hero Section */}
          <HeroContentLeft
            imageUrl="/buridingu.jpg"
            heroTitle="Building Dreams Into Reality"
            heroText1="Transforming Visions Into Structures"
            heroText2="Excellence in Every Foundation"
          />
          
          {/* Philosophy Section */}
          <div ref={philosophyRef} className={`${homeClasses.philosophySection} ${homeClasses.philosophyWrapper}`}>
            <Container size="lg">
              <Title className={homeClasses.philosophyHeading}>Our Philosophy</Title>
              <Divider 
                my="md" 
                size="md" 
                color="#191B51" 
                style={{width: '120px', margin: '1rem auto 2rem'}} 
              />
              <Text className={homeClasses.philosophyText}>
                At Charles J. Construction Services, we believe that every project begins with a vision and ends with excellence. 
                Our commitment to quality craftsmanship and attention to detail drives everything we do, 
                from residential renovations to commercial developments.
              </Text>
              <Text className={homeClasses.philosophyQuote}>
                "We don't just build structures – we create spaces where life happens."
              </Text>
              <Text className={homeClasses.philosophyText}>
                With decades of industry experience, our team approaches each project with innovative solutions
                and unwavering dedication to client satisfaction. We transform concepts into concrete realities,
                always on time and within budget.
              </Text>
            </Container>
          </div>
          
          
          
          {/* Statistics Section */}
          <div className={homeClasses.statsContainer}>
            <Container size="lg">
              <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl">
                <Stack align="center" style={{gap: '8px'}}>
                  <ThemeIcon size={40} radius="xl" variant="light" color="blue">
                    <IconTrophy size={24} />
                  </ThemeIcon>
                  <Text className={homeClasses.statValue}>25+</Text>
                  <Text className={homeClasses.statTitle}>Years of Experience</Text>
                </Stack>
                
                <Stack align="center" style={{gap: '8px'}}>
                  <ThemeIcon size={40} radius="xl" variant="light" color="blue">
                    <IconUsers size={24} />
                  </ThemeIcon>
                  <Text className={homeClasses.statValue}>500+</Text>
                  <Text className={homeClasses.statTitle}>Satisfied Clients</Text>
                </Stack>
                
                <Stack align="center" style={{gap: '8px'}}>
                  <ThemeIcon size={40} radius="xl" variant="light" color="blue">
                    <IconAward size={24} />
                  </ThemeIcon>
                  <Text className={homeClasses.statValue}>15+</Text>
                  <Text className={homeClasses.statTitle}>Industry Awards</Text>
                </Stack>
                
                <Stack align="center" style={{gap: '8px'}}>
                  <ThemeIcon size={40} radius="xl" variant="light" color="blue">
                    <IconTrendingUp size={24} />
                  </ThemeIcon>
                  <Text className={homeClasses.statValue}>300+</Text>
                  <Text className={homeClasses.statTitle}>Completed Projects</Text>
                </Stack>
              </SimpleGrid>
            </Container>
          </div>
          
          {/* Construction Process Timeline */}
          <div className={homeClasses.timelineSection}>
            <Container size="lg">
              <Title style={{textAlign: 'center', marginBottom: '50px'}} order={2}>Our Construction Process</Title>
              
              <ResponsiveTimeline />
            </Container>
          </div>
          
          {/* Projects Carousel */}
          <div ref={projectsRef} className={homeClasses.carouselWrapper}>
            <CardsCarousel />
          </div>
          
          <FooterLinks />
        </AppShell.Main>
      </AppShell>
    </>
  );
}
