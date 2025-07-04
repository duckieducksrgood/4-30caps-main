import { useEffect } from 'react';
import { AppShell, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import HeaderComponent from '../../components/headerPAGE/headerComponent';
import { FooterLinks } from '../../components/landingPage/footer/footer';
import { ProjectsHero } from '../../components/projectsPage/ProjectsHero';
import { AnimatedProjectHeader } from '../../components/projectsPage/AnimatedProjectHeader';
import { ProjectCards } from '../../components/projectsPage/projectCards';
import navClasses from '../../components/module.css/MobileNavbar.module.css';
import styles from './Projects.module.css';

export default function ProjectsPage() {
  const [opened, { toggle }] = useDisclosure();

  // Add custom smooth scrolling with easeInOut effect
  useEffect(() => {
    // Custom easeInOut function for smooth scrolling
    const easeInOutCubic = (t: number): number => {
      return t < 0.5
        ? 4 * t * t * t
        : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    };

    // Override the default scroll behavior for anchor links and buttons
    const handleLinkClick = (e: MouseEvent) => {
      // Check if the clicked element is a link or button with href
      const target = e.target as HTMLElement;
      const link = target.closest('a[href^="#"], button[data-target]');
      
      if (link) {
        const href = link.getAttribute('href') || link.getAttribute('data-target');
        const targetId = href?.substring(1); // Remove the # from the href
        
        if (targetId) {
          const targetElement = document.getElementById(targetId);
          
          if (targetElement) {
            e.preventDefault();
            
            const startPosition = window.pageYOffset;
            const targetPosition = targetElement.getBoundingClientRect().top + startPosition;
            const distance = targetPosition - startPosition;
            const duration = 800; // Duration in ms
            let start: number | null = null;
            
            const step = (timestamp: number) => {
              if (!start) start = timestamp;
              const elapsed = timestamp - start;
              const progress = Math.min(elapsed / duration, 1);
              
              window.scrollTo(0, startPosition + distance * easeInOutCubic(progress));
              
              if (elapsed < duration) {
                window.requestAnimationFrame(step);
              }
            };
            
            window.requestAnimationFrame(step);
          }
        }
      }
    };
    
    // Add event listener for clicks
    document.addEventListener('click', handleLinkClick);
    
    return () => {
      // Remove the event listener on cleanup
      document.removeEventListener('click', handleLinkClick);
    };
  }, []);

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

        <AppShell.Navbar py="md" px={4}>
          <UnstyledButton component="a" href="/projects/page" className={navClasses.control}>
            Projects
          </UnstyledButton>
          <UnstyledButton component="a" href="/products/page" className={navClasses.control}>
            Products
          </UnstyledButton>
          <UnstyledButton className={navClasses.control}>Services</UnstyledButton>
          <UnstyledButton component="a" href="/about/page" className={navClasses.control}>
            About Us
          </UnstyledButton>
        </AppShell.Navbar>

        <AppShell.Main p={0}>
          {/* Hero Section with Parallax Effect */}
          <ProjectsHero
            imageUrl="/imga.jpeg"
            title="Our Construction Projects"
            subtitle="Building Excellence Through Quality Craftsmanship"
            description="Discover our portfolio of residential, commercial, and industrial construction projects that showcase our commitment to excellence, innovation, and client satisfaction."
          />
          
          {/* Animated Header */}
          <AnimatedProjectHeader />
          
          {/* Projects Section with all components */}
          <div id="projects-section">
            <ProjectCards />
          </div>

          <FooterLinks />
        </AppShell.Main>
      </AppShell>
    </>
  );
}
