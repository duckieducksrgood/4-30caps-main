import { useEffect, useState } from 'react';
import { 
  Badge, 
  Button, 
  Container, 
  Overlay, 
  Text, 
  Title, 
  Transition, 
  Group, 
  ThemeIcon,
  Box
} from '@mantine/core';
import { IconBuilding, IconRuler, IconTools } from '@tabler/icons-react';
import classes from './HeroContentLeft.module.css';

interface HeroContentLeftProps {
  imageUrl: string;
  heroTitle: string;
  heroText1: string;
  heroText2: string;
}

export function HeroContentLeft({
  imageUrl,
  heroText1,
  heroText2,
  heroTitle,
}: HeroContentLeftProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={classes.hero} style={{ backgroundImage: `url(${imageUrl})` }}>
      <Overlay
        gradient="linear-gradient(180deg, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, .65) 40%)"
        opacity={1}
        zIndex={0}
      />
      <Container className={classes.container} size="md">
        <Transition mounted={mounted} transition="fade-up" duration={1000}>
          {(styles) => (
            <Title style={styles} className={classes.title}>{heroTitle}</Title>
          )}
        </Transition>
        
        <Transition mounted={mounted} transition="fade-up" duration={1000} enterDelay={300}>
          {(styles) => (
            <Text style={styles} className={classes.description} size="xl" mt="xl">
              {heroText1}
            </Text>
          )}
        </Transition>
        
        <Transition mounted={mounted} transition="fade-up" duration={1000} enterDelay={600}>
          {(styles) => (
            <Text style={styles} className={classes.description} size="xl">
              {heroText2}
            </Text>
          )}
        </Transition>
        
        <Transition mounted={mounted} transition="fade-up" duration={1000} enterDelay={900}>
          {(styles) => (
            <Group style={{...styles, justifyContent: 'center', gap: '15px', marginTop: '30px'}}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <ThemeIcon variant="light" radius="xl" size="md" color="blue" style={{marginRight: '10px'}}>
                  <IconBuilding size={16} stroke={1.5} />
                </ThemeIcon>
                <Badge size="xl" variant="filled" color="blue">Residential</Badge>
              </div>
              
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <ThemeIcon variant="light" radius="xl" size="md" color="teal" style={{marginRight: '10px'}}>
                  <IconRuler size={16} stroke={1.5} />
                </ThemeIcon>
                <Badge size="xl" variant="filled" color="teal">Commercial</Badge>
              </div>
              
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <ThemeIcon variant="light" radius="xl" size="md" color="indigo" style={{marginRight: '10px'}}>
                  <IconTools size={16} stroke={1.5} />
                </ThemeIcon>
                <Badge size="xl" variant="filled" color="indigo">Industrial</Badge>
              </div>
            </Group>
          )}
        </Transition>
      </Container>
    </div>
  );
}
