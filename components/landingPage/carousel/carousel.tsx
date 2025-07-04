import { Carousel } from '@mantine/carousel';
import { Button, Container, Divider, Paper, rem, Text, Title, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import classes from './EnhancedCarousel.module.css';

interface CardProps {
  image: string;
  title: string;
  category: string;
}

function Card({ image, title, category }: CardProps) {
  return (
    <Paper
      shadow="md"
      radius="md"
      style={{ backgroundImage: `url(${image})` }}
      className={classes.card}
    >
      <div className={classes.cardOverlay}></div>
      <div className={classes.cardContent}>
        <Text className={classes.category} size="xs">
          {category}
        </Text>
        <Title order={3} className={classes.title}>
          {title}
        </Title>
      </div>
    </Paper>
  );
}

const data = [
  {
    image:
      '/9.png',
    title: 'Modern Residential Complex Development',
    category: '',
  },
  {
    image:
      '/projasd.jpg',
    title: 'Modern Railings and Window Design for Stylish Living',
    category: '',
  },
  {
    image:
      '/projqwe.jpg',
    title: 'Where Moments Happen: A Stunning Event Hall Setting',
    category: '',
  },
  {
    image:
      '/12.png',
    title: 'Durability in Style: A Bold Silver Aluminum Gateway',
    category: '',
  },
  {
    image:
      '/bedto.jpg',
    title: 'Smart Space Design: Loft Bed with Built-In Stairs and Desk',
    category: '',
  },
  {
    image:
      '/railings.jpg',
    title: 'Precision in Motion: The Making of Modern Railings',
    category: '',
  },
];

export function CardsCarousel() {
  const theme = useMantineTheme();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const slides = data.map((item) => (
    <Carousel.Slide key={item.title}>
      <Card {...item} />
    </Carousel.Slide>
  ));

  return (
    <div className={classes.carouselContainer}>
      <Container size="xl">
        {/* Title Section */}
        <Title className={classes.sectionTitle}>
          Featured Projects
        </Title>
        <Divider
          my="sm"
          size="md"
          color="white"
          className={classes.sectionDivider}
        />

        {/* Carousel Section */}
        <Carousel
          slideSize={{ base: '100%', sm: '50%', md: '33.333%' }}
          slideGap={{ base: '8px', sm: 'xl' }}
          align="start"
          slidesToScroll={mobile ? 1 : 2}
          loop
          withControls
          controlsOffset="xl"
        >
          {slides}
        </Carousel>
      </Container>
    </div>
  );
}
