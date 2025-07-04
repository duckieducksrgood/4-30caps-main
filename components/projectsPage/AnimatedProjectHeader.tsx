import { useEffect, useState } from 'react';
import { Title, Text, Box, ActionIcon, Transition } from '@mantine/core';
import { useMediaQuery, useWindowScroll } from '@mantine/hooks';
import { IconArrowUp } from '@tabler/icons-react';
import styles from '../../pages/projects/Projects.module.css';

export function AnimatedProjectHeader() {
  const [scroll, scrollTo] = useWindowScroll();
  const [isCompact, setIsCompact] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
    // Handle scroll effects - only shrink when at the top of the page (first section)
  useEffect(() => {
    const handleScroll = () => {
      // Get the projects section element
      const projectsSection = document.getElementById('projects-section');
      
      if (projectsSection) {
        // Get the position of the projects section relative to the viewport
        const projectsSectionRect = projectsSection.getBoundingClientRect();
        
        // If the top of the projects section is at or near the top of the viewport
        if (projectsSectionRect.top <= 80) { // 80px buffer for better UX
          setIsCompact(true);
          setShowScrollButton(true);
        } else {
          setIsCompact(false);
          setShowScrollButton(false);
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
    // Custom easeInOut scroll function for better animation
  const scrollToTop = () => {
    const start = window.pageYOffset;
    const duration = 800; // Duration in milliseconds
    let startTime: number | null = null;
    
    // EaseInOut cubic function for smooth acceleration and deceleration
    const easeInOutCubic = (t: number): number => {
      return t < 0.5
        ? 4 * t * t * t
        : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    };
    
    // Animation step function
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      window.scrollTo(0, start * (1 - easeInOutCubic(progress)));
      
      if (elapsed < duration) {
        window.requestAnimationFrame(step);
      }
    };
    
    // Start the animation
    window.requestAnimationFrame(step);
  };
  
  return (
    <div className={`${styles.pageHeader} ${isCompact ? styles.compactHeader : ''}`}>
      <Title className={`${styles.pageTitle} ${isCompact ? styles.compactTitle : ''}`}>
        Our Construction Projects
      </Title>
      
      {!isCompact && (
        <Text className={styles.pageDescription}>
          Transforming visions into reality through expertise, quality craftsmanship, and attention to detail
        </Text>
      )}
        <Transition 
        mounted={showScrollButton}
        transition="pop"
        duration={300}
        timingFunction="ease"
      >
        {(transitionStyles) => (
          <ActionIcon
            className={styles.scrollTopButton}
            style={{
              ...transitionStyles,
              position: 'absolute',
              right: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              animation: showScrollButton ? 'spin 0.5s ease-out' : 'none',
            }}
            onClick={scrollToTop}
            radius="xl"
            size="lg"
            variant="light"
          >
            <IconArrowUp size={20} />
          </ActionIcon>
        )}
      </Transition>
    </div>
  );
}
