import {
  IconPhone,
  IconMapPin,
  IconBrandFacebook,
  IconClock,
} from '@tabler/icons-react';
import { Container, Group, Text, rem } from '@mantine/core';
import Image from 'next/image';
import classes from './FooterLinks.module.css';

export function FooterLinks() {
  return (
    <footer className={classes.footer}>
      <div className={classes.background}>
        <div className={classes.innerFull}>
          {/* Contact Info */}
          <div className={classes.contact}>
            <Text fw={700} size="lg">CONTACT INFORMATION</Text>
            <Group mt="sm" align="flex-start">
              <IconMapPin size={18} />
              <Text size="sm">Production Site<br />Burol I Dasmariñas, Cavite</Text>
            </Group>
            <Group mt="sm">
              <IconPhone size={18} />
              <Text size="sm">09271650832</Text>
            </Group>
            <Group mt="sm">
              <IconClock size={18} />
              <Text size="sm">Monday - Friday, 8:00 AM - 5:00 PM</Text>
            </Group>
            <Group mt="sm">
              <IconBrandFacebook size={18} />
              <Text size="sm" component="a" href="https://www.facebook.com/profile.php?id=100078399693441&__tn__=%3C">Charles J Construction Services</Text>
            </Group>
          </div>


          {/* Logo and Slogan */}
          <div className={classes.logoSection}>
            <Image src="/charleslogo.png" alt="Charles J Logo" width={200} height={200} />
            <div className={classes.logoText}>
              <span style={{ fontWeight: 700 }}>Charles J Construction Services</span>
              <p className={classes.slogan}>From Groundwork to Skyline: Where Vision Meets Precision</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
