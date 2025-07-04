import {
  IconCookie, 
  IconEye, 
  IconGauge, 
  IconUser,
  IconUsers, 
  IconClipboardCheck,
  IconLayout, 
  IconCalculator,
  IconFileDescription, 
  IconTools, 
  IconChecklist,
  IconBuildingSkyscraper } from '@tabler/icons-react';
import {
  Badge,
  Card,
  Container,
  Group,
  rem,
  SimpleGrid,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core';
import classes from './FeaturesCards.module.css';

const mockdata = [
  {
    
    title: 'Our Mission',
    description:
      "Our mission at Charles J Construction Services is to provide exceptional construction services that exceed our clients' expectations.",
    icon: IconGauge,
  },
  {
    title: 'Our Vision',
    description:
      'At Charles J Construction Services, our vision is to become a leader in the construction industry, renowned for our unwavering commitment to quality, integrity, and innovation.',
    icon: IconEye,
  },
  {
    title: 'Our Team',
    description:
      'Experienced professionals delivering innovative, quality construction solutions with integrity, ensuring excellence and customer satisfaction in every project.',
    icon: IconUsers,
  },
];

const workProcessData = [
  {
    title: 'Site Inspection',
    description: 'This phase is essential in pre-construction, ensuring the site meets the requirements for fit-out and furniture installations. In addition to conducting a SWOT analysis, we assess fit-out guidelines and precisely measure the office space to guarantee optimal suitability.',
    icon: IconClipboardCheck,
  },
  {
    title: 'Space Planning and Design',
    description: 'Once all construction requirements are gathered, we proceed with space planning, followed by developing a 3D visualization to enhance the interior design process.',
    icon: IconLayout,
  },
  {
    title: 'Cost Estimate',
    description: 'After finalizing the layout, we prepare a detailed cost estimate for materials, equipment, and manpower. Additionally, we carefully review contracts and establish schedules to ensure a well-organized process.',
    icon: IconCalculator,
  },
  {
    title: 'Processing of Necessary Permits',
    description: 'General building permits and essential authorizations for fit-out contractors are secured to ensure a smooth and uninterrupted construction process.',
    icon: IconFileDescription,
  },
  {
    title: 'Project Implementation',
    description: 'We oversee architectural, mechanical, electrical, plumbing, and fire safety works, as well as furniture installations and comprehensive project management.',
    icon: IconTools,
  },
  {
    title: 'Project Turnover',
    description: 'Following construction, we conduct thorough site cleaning, system testing, and document verification to ensure a seamless handover for occupant use.',
    icon: IconChecklist,
  },
  {
    title: 'Occupancy Permits',
    description: 'Final documents and permits are processed, followed by thorough testing and commissioning to ensure a smooth transition to ownership.',
    icon: IconBuildingSkyscraper,
  },
];

export function FeaturesCards() {
  const theme = useMantineTheme();
  
  // Original features mapping (keep this)
  const features = mockdata.map((feature) => (
    <Card key={feature.title} shadow="md" radius="md" className={classes.card} padding="xl">
      <feature.icon
        style={{ width: rem(50), height: rem(50) }}
        stroke={2}
        color={theme.colors.blue[6]}
      />
      <Text fz="lg" fw={500} className={classes.cardTitle} mt="md">
        {feature.title}
      </Text>
      <Text fz="sm" c="dimmed" mt="sm">
        {feature.description}
      </Text>
    </Card>
  ));

  // New work process features
  const workProcessFeatures = workProcessData.map((feature) => (
    <Card key={feature.title} shadow="md" radius="md" className={classes.card} padding="xl">
      <feature.icon
        style={{ width: rem(50), height: rem(50) }}
        stroke={2}
        color={theme.colors.blue[6]} // Different color for distinction
      />
      <Text fz="lg" fw={500} className={classes.cardTitle} mt="md">
        {feature.title}
      </Text>
      <Text fz="sm" c="dimmed" mt="sm">
        {feature.description}
      </Text>
    </Card>
  ));

  return (
    <>
      <Container size="lg" py="xl">
        <Group justify="center">
          <Badge variant="filled" size="lg">
            Best company ever
          </Badge>
        </Group>
  
        <Title order={2} className={classes.title} ta="center" mt="sm">
          Our Mission, Vision, and Team
        </Title>
  
        <Text c="dimmed" className={classes.description} ta="center" mt="md">
          At Charles J Construction Services, we are dedicated to providing exceptional construction
          services, becoming a leader in the industry, and ensuring excellence and customer
          satisfaction through our experienced professionals.
        </Text>
  
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl" mt={50}>
          {features}
        </SimpleGrid>
      </Container>
  
      <Container size="lg" py="xl">
        <Title order={2} ta="center" mb="md">
          How We Work
        </Title>
        <Text ta="center" className={classes.description} c="dimmed">
          All-in-One Fit-Out Construction Team. A simple rundown of what a general contractor in the Philippines does, step by step.
        </Text>

        {/* Add the new feature cards here */}
        <SimpleGrid cols={{ base: 1, md: 2, lg: 4 }} spacing="xl" mt={50}>
          {workProcessFeatures}
        </SimpleGrid>
      </Container>
    </>
  );  
}