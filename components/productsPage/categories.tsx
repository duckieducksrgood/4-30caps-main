import { useState, useEffect } from 'react';
import { IconListSearch, IconAlertCircle } from '@tabler/icons-react';
import cx from 'clsx';
import useSWR from 'swr';
import { Box, Group, rem, Center, Alert, Loader, Text } from '@mantine/core';
import axios from '../../utils/axiosInstance';
import classes from './TableOfContentsFloating.module.css';

interface Category {
  categoryID: string;
  name: string;
  created_at: string;
  updated_at: string;
}

// Fetcher function for SWR
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

interface CategoryTableOfContentProps {
  setCategorySelected: (category: string) => void;
  categorySelected?: string;
}

export function CategoryTableofContent({ setCategorySelected, categorySelected = 'all' }: CategoryTableOfContentProps) {
  const [active, setActive] = useState(-1); // -1 means no active category (all)
  const { data, error } = useSWR<Category[]>('category/', fetcher); // Fetch categories

  // Update active state when parent category changes
  useEffect(() => {
    if (categorySelected === 'all') {
      setActive(-1);
    } else if (data) {
      const selectedIndex = data.findIndex(cat => cat.name === categorySelected);
      setActive(selectedIndex !== -1 ? selectedIndex : -1);
    }
  }, [categorySelected, data]);

  if (error) {
    return (
      <Center mih={200}>
        <Alert
          icon={<IconAlertCircle size="1.2rem" />}
          title="Error"
          color="red"
          radius="md"
          variant="light"
        >
          Error loading categories. Please try again later.
        </Alert>
      </Center>
    );
  }
  
  if (!data) {
    return (
      <Center mih={200} style={{ flexDirection: 'column' }}>
        <Loader size="lg" color="blue" />
        <Text mt="md" c="dimmed">
          Loading categories...
        </Text>
      </Center>
    );
  }

  // All Categories item
  const allCategoriesItem = (
    <Box<'a'>
      component="a"
      href="#all"
      onClick={(event) => {
        event.preventDefault();
        setActive(-1);
        setCategorySelected('all');
      }}
      key="all"
      className={cx(classes.link, { [classes.linkActive]: active === -1 })}
    >
      All Categories
    </Box>
  );
  
  // Map category items
  const items = data.map((item, index) => (
    <Box<'a'>
      component="a"
      href={`#${item.categoryID}`}
      onClick={(event) => {
        event.preventDefault();
        setActive(index);
        setCategorySelected(item.name);
      }}
      key={item.categoryID}
      className={cx(classes.link, { [classes.linkActive]: active === index })}
    >
      {item.name}
    </Box>
  ));

  return (
    <div className={classes.root}>
      <div className={classes.links}>
        <div
          className={classes.indicator}
          style={{
            transform: active === -1 
              ? 'translateY(var(--indicator-offset))' 
              : `translateY(calc((${active} + 1) * var(--link-height) + var(--indicator-offset)))`,
            opacity: 1,
            transition: 'transform 300ms ease'
          }}
        />
        {allCategoriesItem}
        {items}
      </div>
    </div>
  );
}
