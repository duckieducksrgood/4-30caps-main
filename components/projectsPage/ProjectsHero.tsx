import { useEffect, useState } from 'react';
import { Title, Text, Button, Container } from '@mantine/core';
import { IconChevronDown, IconSearch } from '@tabler/icons-react';
import classes from './ProjectsAnimation.module.css';

interface ProjectsHeroProps {
  imageUrl: string;
  title: string;
  subtitle: string;
  description: string;
}

export function ProjectsHero({ imageUrl, title, subtitle, description }: ProjectsHeroProps) {
  const [scrollY, setScrollY] = useState(0);

  // Handle scroll for parallax effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);  // Handle custom easeInOut scroll animation to the Featured Projects heading
  const scrollToProjects = () => {
    // Target the Featured Projects heading by its ID
    const featuredProjectsHeading = document.getElementById('featured-projects-title');
    
    if (featuredProjectsHeading) {
      const startPosition = window.pageYOffset;
      const targetPosition = featuredProjectsHeading.getBoundingClientRect().top + startPosition - 80; // 80px offset for better visibility
      const distance = targetPosition - startPosition;
      const duration = 800; // Duration in ms
      let start: number | null = null;
      
      // EaseInOut cubic function for smooth acceleration and deceleration
      const easeInOutCubic = (t: number): number => {
        return t < 0.5
          ? 4 * t * t * t
          : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
      };
      
      // Animation step function
      const step = (timestamp: number) => {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);
        
        window.scrollTo(0, startPosition + distance * easeInOutCubic(progress));
        
        if (elapsed < duration) {
          window.requestAnimationFrame(step);
        }
      };
      
      // Start the animation
      window.requestAnimationFrame(step);
    }
  };

  // Calculate parallax transform based on scroll position
  const parallaxStyle = {
    transform: `scale(${1 + scrollY * 0.0005}) translateY(${scrollY * 0.5}px)`,
    filter: `brightness(${100 - scrollY * 0.1}%)`,
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.7)), url(${imageUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <div className={classes.heroSection}>
      <div className={classes.parallaxBg} style={parallaxStyle} />
      
      <Container size="lg" className={classes.heroContent}>
        <div className={classes.heroText}>
          <Title order={1} style={{ color: 'white', fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem' }}>
            {title}
          </Title>
        </div>
        
        <div className={classes.heroText}>
          <Text style={{ color: 'white', fontSize: '1.5rem', marginBottom: '2rem', fontWeight: 500 }}>
            {subtitle}
          </Text>
        </div>
        
        <div className={classes.heroText}>
          <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1.1rem', maxWidth: '800px', margin: '0 auto 3rem' }}>
            {description}
          </Text>
          
          <Button
            size="lg"
            leftSection={<IconSearch size={20} />}            style={{
              backgroundColor: 'white',
              color: '#191B51',
              borderRadius: '4px',
              padding: '0.8rem 2rem',
              fontWeight: 600,
              transition: 'all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            }}
            classNames={{
              root: classes.exploreButton
            }}
            onClick={scrollToProjects}
          >
            Explore Our Projects
          </Button>
        </div>
      </Container>      <div 
        className={classes.scrollIndicator} 
        onClick={scrollToProjects}
        style={{ transition: 'all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)' }}
      >
        <IconChevronDown size={24} className={classes.scrollIcon} />
        <Text className={classes.scrollText}>View Featured Projects</Text>
      </div>
    </div>
  );
}
