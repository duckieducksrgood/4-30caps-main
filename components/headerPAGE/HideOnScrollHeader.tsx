import { useEffect, useState } from 'react';
import { Box } from '@mantine/core';
import styles from './HideOnScrollHeader.module.css';
import HeaderComponent from './headerComponent';

interface HideOnScrollHeaderProps {
  opened: boolean;
  toggle: () => void;
}

export function HideOnScrollHeader({ opened, toggle }: HideOnScrollHeaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlHeader = () => {
      const currentScrollY = window.scrollY;
      
      // Show header when scrolling up or at the top
      if (currentScrollY <= 0) {
        setIsVisible(true);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show header
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 80) {
        // Scrolling down and not at the very top - hide header
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    // Add scroll event listener
    window.addEventListener('scroll', controlHeader);

    // Cleanup
    return () => {
      window.removeEventListener('scroll', controlHeader);
    };
  }, [lastScrollY]);

  return (
    <Box 
      className={`${styles.header} ${isVisible ? styles.visible : styles.hidden}`}
    >
      <HeaderComponent opened={opened} toggle={toggle} />
    </Box>
  );
}
