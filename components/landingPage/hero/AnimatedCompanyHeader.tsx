import { useEffect, useState } from 'react';
import { Title, Button, Group, Box } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import homeClasses from '../../../pages/Home.module.css';
import { useMediaQuery } from '@mantine/hooks';

interface AnimatedCompanyHeaderProps {
  scrollToPhilosophy: () => void;
  scrollToProjects: () => void;
}

export function AnimatedCompanyHeader({ scrollToPhilosophy, scrollToProjects }: AnimatedCompanyHeaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

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

  // Toggle expanded state
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div 
      className={`${homeClasses.header} ${isVisible ? homeClasses.headerVisible : homeClasses.headerHidden} ${isMobile && !isExpanded ? homeClasses.collapsedHeader : ''}`}
    >
      {/* Clickable header area for mobile */}
      {isMobile ? (
        <>
          <Box onClick={toggleExpanded} className={homeClasses.headerDropdown}>
            <Title className={homeClasses.companyName}>
              Charles J. Construction Services
            </Title>
            <IconChevronDown 
              className={`${homeClasses.headerArrow} ${isExpanded ? homeClasses.headerArrowOpen : ''}`} 
              size={24} 
              stroke={2}
            />
          </Box>
          
          {/* Dropdown navigation buttons */}
          {isExpanded && (
            <div className={homeClasses.navButtons}>
              <Button 
                className={homeClasses.navButton} 
                size="md"
                onClick={() => {
                  scrollToPhilosophy();
                  setIsExpanded(false);
                }}
              >
                Our Philosophy
              </Button>
              <Button 
                className={homeClasses.navButton} 
                size="md"
                onClick={() => {
                  scrollToProjects();
                  setIsExpanded(false);
                }}
              >
                Featured Projects
              </Button>
            </div>
          )}
        </>
      ) : (
        // Desktop layout - always expanded
        <>
          <Title className={homeClasses.companyName}>Charles J. Construction Services</Title>
          <div className={homeClasses.navButtons}>
            <Button 
              className={homeClasses.navButton} 
              size="md"
              onClick={scrollToPhilosophy}
            >
              Our Philosophy
            </Button>
            <Button 
              className={homeClasses.navButton} 
              size="md"
              onClick={scrollToProjects}
            >
              Featured Projects
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
