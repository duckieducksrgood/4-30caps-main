import { useEffect, useState } from 'react';
import { Title, Text, ActionIcon, Transition } from '@mantine/core';
import { useWindowScroll } from '@mantine/hooks';
import { IconArrowUp } from '@tabler/icons-react';
import styles from '../../pages/products/ProductPage.module.css';

export function AnimatedProductHeader() {
  const [scroll, scrollTo] = useWindowScroll();
  const [isCompact, setIsCompact] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  // Handle scroll effects - detect when we've scrolled about 7 ticks
  useEffect(() => {
    // Initialize with a fixed position value of approximately 7 scroll wheel ticks
    const scrollThreshold = 650; // About 7 scroll wheel ticks (50px per tick)
    
    const handleScroll = () => {
      // When scroll position crosses this threshold, activate compact mode
      if (window.scrollY > scrollThreshold) {
        setIsCompact(true);
        setShowScrollButton(true);
      } else {
        setIsCompact(false);
        setShowScrollButton(false);
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
      <Title order={1} className={`${styles.pageTitle} ${isCompact ? styles.compactTitle : ''}`}>
        Our Products
      </Title>
      
      {!isCompact && (
        <Text className={styles.pageDescription}>
          Explore our premium products crafted with excellence, designed to meet your specific needs and expectations
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
