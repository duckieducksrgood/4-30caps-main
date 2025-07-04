import { useState, useEffect } from 'react';
import { 
  Paper, 
  Text, 
  Group, 
  ActionIcon, 
  Box, 
  Title, 
  Stack, 
  Transition,
  Divider
} from '@mantine/core';
import { 
  IconMapPin, 
  IconPhone, 
  IconClock, 
  IconBrandFacebook, 
  IconX, 
  IconMessageCircle 
} from '@tabler/icons-react';
import classes from './ContactWidget.module.css';

interface ContactWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactWidget({ isOpen, onClose }: ContactWidgetProps) {
  // Apply body lock to prevent scrolling when widget is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <Transition mounted={isOpen} transition="fade" duration={300}>
        {(styles) => (
          <div 
            className={classes.overlay} 
            style={styles} 
            onClick={onClose}
          />
        )}
      </Transition>
      
      {/* Contact Widget */}
      <Transition mounted={isOpen} transition="slide-up" duration={400} timingFunction="ease">
        {(styles) => (
          <Paper 
            className={classes.widget} 
            style={styles} 
            shadow="md"
            radius="md"
          >
            <Group justify="space-between" style={{ marginBottom: 15 }}>
              <Title order={4} className={classes.title}>CONTACT INFORMATION</Title>
              <ActionIcon variant="subtle" onClick={onClose}>
                <IconX size={20} />
              </ActionIcon>
            </Group>
            
            <Divider style={{ marginBottom: 20 }} />
            
            <Stack style={{ gap: 20 }}>
              <Group wrap="nowrap" style={{ gap: 15, alignItems: 'flex-start' }}>
                <Box className={classes.iconWrapper}>
                  <IconMapPin size={20} stroke={1.5} />
                </Box>
                <Box>
                  <Text fw={600} size="sm">Production Site</Text>
                  <Text size="sm">Burol I Dasmariñas, Cavite</Text>
                </Box>
              </Group>
              
              <Group wrap="nowrap" style={{ gap: 15, alignItems: 'flex-start' }}>
                <Box className={classes.iconWrapper}>
                  <IconPhone size={20} stroke={1.5} />
                </Box>
                <Box>
                  <Text fw={600} size="sm">Phone</Text>
                  <Text size="sm" component="a" href="tel:09271650832">09271650832</Text>
                </Box>
              </Group>
              
              <Group wrap="nowrap" style={{ gap: 15, alignItems: 'flex-start' }}>
                <Box className={classes.iconWrapper}>
                  <IconClock size={20} stroke={1.5} />
                </Box>
                <Box>
                  <Text fw={600} size="sm">Business Hours</Text>
                  <Text size="sm">Monday - Friday, 8:00 AM - 5:00 PM</Text>
                </Box>
              </Group>
              
              <Group wrap="nowrap" style={{ gap: 15, alignItems: 'flex-start' }}>
                <Box className={classes.iconWrapper}>
                  <IconBrandFacebook size={20} stroke={1.5} />
                </Box>
                <Box>
                  <Text fw={600} size="sm">Social Media</Text>
                  <Text 
                    size="sm" 
                    component="a" 
                    href="https://facebook.com/CharlesJConstructionServices" 
                    target="_blank"
                    className={classes.socialLink}
                  >
                    Charles J Construction Services Facebook
                  </Text>
                </Box>
              </Group>
            </Stack>
            
            <Group justify="center" style={{ marginTop: 30 }}>              <ActionIcon 
                size="lg" 
                radius="xl" 
                variant="filled" 
                color="#191B51" 
                className={classes.messageButton}
                component="a"
                href="/contact"
                onClick={(e) => {
                  // Close the widget when clicking the message button
                  onClose();
                }}
              >
                <IconMessageCircle size={24} />
              </ActionIcon>
            </Group>
          </Paper>
        )}
      </Transition>
    </>
  );
}
