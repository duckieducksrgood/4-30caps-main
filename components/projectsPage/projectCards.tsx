import { useState, useEffect } from 'react';
import { 
  AspectRatio, 
  Card, 
  Container, 
  Image, 
  SimpleGrid, 
  Text,
  Group,
  Button,
  Paper,
  Title,
  Stack,
  ThemeIcon,
  Divider
} from '@mantine/core';
import { 
  IconTrophy,
  IconTools,
  IconCalendar,
  IconMap,
  IconUsers,
  IconQuote,
  IconAward,
  IconBulldozer
} from '@tabler/icons-react';
import classes from '../../pages/projects/Projects.module.css';

// Project data with categories and more details
const projectsData = [
  {
    id: 1,
    title: 'Modern Residential Complex Development in Metro Manila',
    description: 'A luxury residential complex featuring modern architecture, premium amenities, and sustainable design elements.',
    image: '/9.png',
    date: 'March 15, 2023',
    category: 'Residential',
    location: 'Metro Manila',
    client: 'Metro Living Developers',
  },
  {
    id: 2,
    title: 'Event Hall for Oceanview Resort',
    description: 'A multifunctional event space designed to host conferences, weddings, and corporate events with scenic views.',
    image: '/projqwe.jpg',
    date: 'August 4, 2024',
    category: 'Commercial',
    location: 'Batangas',
    client: 'Oceanview Resorts Inc.',
  },
  {
    id: 3,
    title: 'Modern Railings and Window Design',
    description: 'Custom designed security fixtures combining aesthetics and functionality for residential properties.',
    image: '/projasd.jpg',
    date: 'January 7, 2024',
    category: 'Residential',
    location: 'Quezon City',
    client: 'Private Residence',
  },
  {
    id: 4,
    title: 'Industrial-Grade Gateway Installation',
    description: 'A durable aluminum gateway for a commercial facility providing both security and visual appeal.',
    image: '/12.png',
    date: 'January 30, 2023',
    category: 'Industrial',
    location: 'Laguna',
    client: 'TechPark Facilities',
  },
  {
    id: 5,
    title: 'Security Window Grilles for Urban Development',
    description: 'Modern security fixtures with clean lines providing safety without compromising aesthetic design.',
    image: '/qweew.png',
    date: 'September 25, 2022',
    category: 'Residential',
    location: 'Makati City',
    client: 'Urban Living Spaces',
  },
  {
    id: 6,
    title: 'Corporate Office Renovation',
    description: 'Complete renovation of a corporate environment focused on productivity, comfort, and modern design.',
    image: '/rewwe.jpg',
    date: 'September 17, 2022',
    category: 'Commercial',
    location: 'Bonifacio Global City',
    client: 'Premier Business Solutions',
  },
  {
    id: 7,
    title: 'Elegant Security Solutions',
    description: 'Iron security fixtures with premium design elements for high-end residential properties.',
    image: '/nyeam.jpg',
    date: 'February 11, 2023',
    category: 'Residential',
    location: 'Alabang',
    client: 'Exclusive Homes Association',
  },
  {
    id: 8,
    title: 'Two-Story Apartment Complex',
    description: 'Modern apartment development with efficient space utilization and contemporary architectural elements.',
    image: '/wqewe.jpg',
    date: 'October 31, 2023',
    category: 'Residential',
    location: 'Pasig City',
    client: 'Urban Housing Development',
  },
];

// Animation helper function to observe elements and animate them when they become visible
function useIntersectionObserver() {
  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add(classes.fadeInVisible);
          }
        });
      }, { threshold: 0.1 });

      const elements = document.querySelectorAll(`.${classes.fadeIn}`);
      elements.forEach(el => observer.observe(el));

      return () => {
        elements.forEach(el => observer.unobserve(el));
      };
    }
  }, []);
}

// Testimonials component
function Testimonials() {
  useIntersectionObserver();
  
  const testimonials = [
    {
      text: "Charles J. Construction Services transformed our office space beyond our expectations. Their attention to detail and commitment to quality made all the difference.",
      author: "Maria Santos",
      role: "CEO, Premier Business Solutions"
    },
    {
      text: "The team's professionalism and craftsmanship are unmatched. Our residential complex was completed on time and exceeded quality standards.",
      author: "Antonio Reyes",
      role: "Director, Metro Living Developers"
    },
    {
      text: "From concept to completion, working with Charles J. Construction was seamless. Their expertise in commercial projects is evident in the finished result.",
      author: "Elena Cruz",
      role: "Manager, Oceanview Resorts"
    }
  ];

  return (
    <section className={classes.testimonialSection}>
      <Container>
        <Title ta="center" order={2} className={`${classes.sectionTitle} ${classes.fadeIn}`}>Client Testimonials</Title>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
          {testimonials.map((item, index) => (
            <Paper key={index} className={`${classes.testimonialCard} ${classes.fadeIn}`} withBorder>
              <IconQuote size={40} className={classes.quoteIcon} />
              <Text className={classes.testimonialText}>{item.text}</Text>
              <Text className={classes.testimonialAuthor}>{item.author}</Text>
              <Text className={classes.testimonialRole}>{item.role}</Text>
            </Paper>
          ))}
        </SimpleGrid>
      </Container>
    </section>
  );
}

// Stats section component
function ProjectStats() {
  useIntersectionObserver();
  
  return (
    <section className={classes.statsSection}>
      <Container>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl">
          <Stack align="center" className={classes.fadeIn} style={{gap: '8px'}}>
            <ThemeIcon size={40} radius="xl" variant="light" color="blue">
              <IconTrophy size={24} />
            </ThemeIcon>
            <Text className={classes.statValue}>25+</Text>
            <Text className={classes.statTitle}>Years of Experience</Text>
          </Stack>
          
          <Stack align="center" className={classes.fadeIn} style={{gap: '8px'}}>
            <ThemeIcon size={40} radius="xl" variant="light" color="blue">
              <IconAward size={24} />
            </ThemeIcon>
            <Text className={classes.statValue}>15+</Text>
            <Text className={classes.statTitle}>Industry Awards</Text>
          </Stack>
          
          <Stack align="center" className={classes.fadeIn} style={{gap: '8px'}}>
            <ThemeIcon size={40} radius="xl" variant="light" color="blue">
              <IconBulldozer size={24} />
            </ThemeIcon>
            <Text className={classes.statValue}>300+</Text>
            <Text className={classes.statTitle}>Completed Projects</Text>
          </Stack>
          
          <Stack align="center" className={classes.fadeIn} style={{gap: '8px'}}>
            <ThemeIcon size={40} radius="xl" variant="light" color="blue">
              <IconUsers size={24} />
            </ThemeIcon>
            <Text className={classes.statValue}>500+</Text>
            <Text className={classes.statTitle}>Satisfied Clients</Text>
          </Stack>
        </SimpleGrid>
      </Container>
    </section>
  );
}

// This component has been removed as per the user's request

export function ProjectCards() {
  useIntersectionObserver();
  
  const cards = projectsData.map((project) => (
    <Card 
      key={project.id} 
      padding={0}
      radius="md" 
      withBorder
      className={`${classes.projectCard} ${classes.fadeIn}`}
      style={{overflow: 'hidden'}}
    >
      <Card.Section className={classes.cardImage}>
        <AspectRatio ratio={16/9}>
          <Image 
            src={project.image}
            alt={project.title}
            height={220}
          />
        </AspectRatio>
      </Card.Section>
      
      <div className={classes.cardContent}>
        <Text className={classes.cardTitle}>{project.title}</Text>
        <Text className={classes.cardDescription}>{project.description}</Text>
        
        <div className={classes.cardMeta}>
          <Group gap={6}>
            <IconCalendar size={16} />
            <Text>{project.date}</Text>
          </Group>
          
          <Group gap={6}>
            <IconMap size={16} />
            <Text>{project.location}</Text>
          </Group>
        </div>
      </div>
    </Card>
  ));

  return (
    <>
      {/* Projects grid */}
      <section className={classes.projectsContainer}>
        <Container>
          <Title id="featured-projects-title" ta="center" order={2} className={`${classes.sectionTitle} ${classes.fadeIn}`}>
            Featured Projects
          </Title>
          <Divider 
            my="md" 
            size="md" 
            color="#191B51" 
            style={{width: '120px', margin: '0 auto 2rem'}} 
          />
          <SimpleGrid 
            cols={{ base: 1, sm: 2, md: 3 }} 
            spacing="lg"
          >
            {cards}
          </SimpleGrid>
        </Container>
      </section>
      
      {/* Stats section */}
      <ProjectStats />
      
      {/* Testimonials section */}
      <Testimonials />
    </>
  );
}
