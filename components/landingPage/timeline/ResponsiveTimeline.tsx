import { useMediaQuery } from '@mantine/hooks';
import { IconHelmet, IconClipboardCheck, IconBulldozer, IconPaint, IconHome, IconCircleCheck } from '@tabler/icons-react';
import { Text, Paper, ThemeIcon, Group } from '@mantine/core';
import styles from './TimelineStyles.module.css';
import { useState } from 'react';

// Timeline step data
const timelineSteps = [
  {
    icon: <IconHelmet size={20} />,
    title: "Planning & Design",
    description: "Our team works closely with clients to understand requirements and develop detailed plans.",
    color: "#4dabf7"
  },
  {
    icon: <IconClipboardCheck size={20} />,
    title: "Pre-Construction",
    description: "We prepare all necessary documentation, secure permits, and develop a comprehensive project timeline.",
    color: "#38d9a9"
  },
  {
    icon: <IconBulldozer size={20} />,
    title: "Construction",
    description: "Our skilled craftsmen execute the project with precision, quality materials, and attention to detail.",
    color: "#ffa94d"
  },
  {
    icon: <IconPaint size={20} />,
    title: "Finishing",
    description: "We complete all finishing touches, ensuring everything meets our high standards of excellence.",
    color: "#ff6b6b"
  },
  {
    icon: <IconHome size={20} />,
    title: "Project Delivery",
    description: "We conduct a final inspection and walkthrough before delivering your completed project.",
    color: "#845ef7"
  }
];

export function ResponsiveTimeline() {
  // Use media query to check if screen is at least tablet size
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [activeStep, setActiveStep] = useState(-1);

  if (isDesktop) {
    // Horizontal timeline for desktop
    return (
      <div className={styles.timelineContainer}>
        <div className={styles.horizontalTimeline}>
          {timelineSteps.map((step, index) => (
            <div 
              key={index} 
              className={styles.horizontalItem}
              onMouseEnter={() => setActiveStep(index)}
              onMouseLeave={() => setActiveStep(-1)}
            >
              <div 
                className={styles.horizontalBullet}
                style={{
                  borderColor: activeStep === index ? step.color : '#191B51',
                  backgroundColor: activeStep === index ? step.color : 'white',
                  color: activeStep === index ? 'white' : '#191B51'
                }}
              >
                {step.icon}
              </div>
              <div className={styles.horizontalContent}>
                <Text className={styles.horizontalTitle}>{step.title}</Text>
                <Text className={styles.horizontalText}>
                  {step.description}
                </Text>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  } else {
    // Vertical timeline for mobile
    return (
      <div className={styles.timelineContainer}>
        <div className={styles.verticalTimeline}>
          {timelineSteps.map((step, index) => (
            <div 
              key={index} 
              className={styles.timelineItem}
              onMouseEnter={() => setActiveStep(index)}
              onMouseLeave={() => setActiveStep(-1)}
            >
              <div 
                className={styles.timelineBullet}
                style={{
                  borderColor: activeStep === index ? step.color : '#191B51',
                  backgroundColor: activeStep === index ? step.color : 'white',
                  color: activeStep === index ? 'white' : '#191B51'
                }}
              >
                {step.icon}
              </div>              <Paper className={styles.timelineContent} withBorder>
                <Group justify="apart">
                  <Text className={styles.timelineTitle}>{step.title}</Text>
                  {activeStep === index && (
                    <ThemeIcon color="green" variant="light" size="sm">
                      <IconCircleCheck size={16} />
                    </ThemeIcon>
                  )}
                </Group>
                <Text className={styles.timelineText}>
                  {step.description}
                </Text>
              </Paper>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
