import {
  Key,
  useState,
  useEffect,
} from 'react';
import {
  IconAlertCircle,
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react';
import useSWR, { mutate } from 'swr';
import {
  Alert,
  Badge,
  Button,
  Card,
  Center,
  Flex,
  Group,
  Image,
  Loader,
  NumberInput,
  Pagination,
  Popover,
  SimpleGrid,
  Text,
  Box,
  Skeleton,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import axios from '../../utils/axiosInstance';
import classes from './FeaturesCard.module.css';
import pageClasses from '../../pages/products/ProductPage.module.css';

// Define the interface for the product
interface Product {
  productID: Key | null | undefined;
  productImage?: string; // Optional, as fallback image will be used
  name: string | null | undefined;
  description: string | null | undefined;
  discount?: string; // Optional
  product_type: string; // Assuming product_type is a string
  stock: number; // Assuming stock is a number
  price: number;
}

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

interface ProductCardProps {
  categorySelected: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  searchQuery?: string;
}

export function ProductCard({
  categorySelected,
  minPrice,
  maxPrice,
  inStock,
  searchQuery,
}: ProductCardProps) {
  // Construct the query string based on the filter parameters
  const [quantity, setQuantity] = useState(1);
  const [popoverOpened, setPopoverOpened] = useState<{ [key: string]: boolean }>({});
  const [addToCartLoading, setAddToCartLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(9); // Number of products per page
  
  const query = new URLSearchParams();
  if (categorySelected !== 'all') query.append('category', categorySelected);
  if (minPrice !== undefined) query.append('min_price', minPrice.toString());
  if (maxPrice !== undefined) query.append('max_price', maxPrice.toString());
  if (inStock) query.append('in_stock', 'true');
  if (searchQuery && searchQuery.trim() !== '') {
    query.append('search', searchQuery.trim());
  }
  query.append('page', page.toString());
  query.append('page_size', itemsPerPage.toString());

  // Use SWR to fetch data from the products API
  const { data, error } = useSWR<Product[]>(`products/?${query.toString()}`, fetcher, {
    refreshInterval: 100000,
  });

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
  }, [categorySelected, minPrice, maxPrice, inStock, searchQuery]);
  // State for tracking loading animations
  const [isFiltering, setIsFiltering] = useState(false);
  
  // Set filtering state when filters change
  useEffect(() => {
    setIsFiltering(true);
    const timer = setTimeout(() => {
      setIsFiltering(false);
    }, 600); // Match this with the animation duration
    
    return () => clearTimeout(timer);
  }, [categorySelected, minPrice, maxPrice, inStock, searchQuery]);

  // Handle loading and error states
  if (error) {
    return (
      <Center
        style={{
          height: '50vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Alert
          icon={<IconAlertCircle size="1rem" />}
          title="Error"
          color="red"
          radius="md"
          variant="light"
          w="auto"
          maw={500}
          mx="auto"
        >
          Failed to load products. Please try again later.
        </Alert>
      </Center>
    );
  }  if (!data || isFiltering) {
    // Create an array of placeholder cards
    const skeletonCards = Array(6).fill(0).map((_, index) => (
      <Card key={index} shadow="sm" padding="lg" radius="md" withBorder>
        <Card.Section>
          <Skeleton height={160} animate={true} className={pageClasses.skeletonPulse} />
        </Card.Section>
        
        <Skeleton height={20} mt="md" width="70%" animate={true} className={pageClasses.skeletonPulse} />
        <Skeleton height={15} mt="xs" width="40%" animate={true} className={pageClasses.skeletonPulse} />
        <Skeleton height={15} mt="xs" width="90%" animate={true} className={pageClasses.skeletonPulse} />
        
        <Group mt="md" justify="space-between">
          <Skeleton height={24} width={80} animate={true} className={pageClasses.skeletonPulse} />
          <Skeleton height={36} width={100} radius="md" animate={true} className={pageClasses.skeletonPulse} />
        </Group>
      </Card>
    ));
    
    return (
      <Box style={{ 
        width: '100%', 
        opacity: isFiltering ? 0.7 : 1,
        transition: 'opacity 0.3s ease'
      }}>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {skeletonCards}
        </SimpleGrid>
        
        <Center mt="xl">
          <Text c="dimmed" size="sm" ta="center">
            {!isFiltering && "Loading products, please wait..."}
          </Text>
        </Center>
      </Box>
    );
  }
  
  // Display message when no products match the filters
  if (data.length === 0) {
    return (
      <Center
        style={{
          height: '30vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
        }}
      >
        <Alert
          icon={<IconAlertCircle size="1rem" />}
          title="No products found"
          color="blue"
          radius="md"
          variant="light"
          w="auto"
          maw={500}
          mx="auto"
        >
          No products match your current filters. Try adjusting your search criteria or removing some filters.
        </Alert>
      </Center>
    );
  }

  const handleAddToCart = async (productID: Key, quantity: number, productName: string) => {
    try {
      setAddToCartLoading(true);
      const response = await axios.post('carts/', {
        product: productID,
        quantity: quantity,
      });
      console.log('Added to cart:', response.data);
      notifications.show({
        title: 'Added to cart',
        message: `Added ${quantity} of ${productName} to cart.`,
      });
      setPopoverOpened((prev) => ({ ...prev, [productID as string]: false })); // Close the popover
      mutate('carts/');
    } catch (error) {
      console.error('Error adding to cart:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to add product to cart.',
        color: 'red',
      });
    }
    setAddToCartLoading(false);
  };

  // Calculate total pages based on the data length
  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // Scroll to top when changing page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <div>
      <SimpleGrid cols={{ xs: 1, sm: 2, md: 3 }} spacing="lg" style={{ gap: '1rem' }}>
        {data.map((product) => (
          <Card key={product.productID} withBorder radius="md" className={classes.card}>
            <Card.Section className={classes.imageSection}>
              <Image
                src={`${product.productImage}` || 'https://i.imgur.com/ZL52Q2D.png'} // Fallback image
                w={250}
                h={250}
                alt={product.name?.toString() || "Product image"}
              />
            </Card.Section>

            <Group justify="space-between" mt="md">
              <div>
                <Text fw={500}>{product.name}</Text>
                <Text fz="xs" c="dimmed">
                  {product.description}
                </Text>
              </div>
              <Badge variant="outline">{product.discount || 'No Discount'}</Badge>
            </Group>

            <Card.Section className={classes.section} mt="md">
              <Text fz="sm" c="dimmed" className={classes.label}>
                Basic configuration
              </Text>

              <Group gap={8} mb={-8}>
                <Text size="xs" c="dimmed">
                  Type: {product.product_type}
                </Text>
                <Text size="xs" c="dimmed">
                  Stock: {product.stock}
                </Text>
              </Group>
            </Card.Section>

            <Card.Section className={classes.section}>
              <Group gap={30}>
                <div>
                  <Text fz="xl" fw={700} style={{ lineHeight: 1 }}>
                    ₱{product.price}
                  </Text>
                  <Text fz="xs" c="dimmed">
                    Price
                  </Text>
                </div>

                <Popover
                  width={200}
                  position="bottom"
                  withArrow
                  shadow="md"
                  opened={popoverOpened[product.productID as string] || false}
                  onChange={(open) =>
                    setPopoverOpened((prev) => ({ ...prev, [product.productID as string]: open }))
                  }
                >
                  <Popover.Target>
                    <Button
                      radius="xl"
                      style={{ flex: 1 }}
                      disabled={product.stock === 0}
                      onClick={() =>
                        setPopoverOpened((prev) => ({
                          ...prev,
                          [product.productID as string]: !prev[product.productID as string],
                        }))
                      }
                    >
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
                  </Popover.Target>
                  <Popover.Dropdown>
                    <NumberInput
                      label="Quantity"
                      defaultValue={1}
                      min={1}
                      max={product.stock}
                      onChange={(value) => {
                        if (typeof value === 'number') {
                          setQuantity(value);
                        }
                      }}
                    />
                    <Button
                      mt="md"
                      fullWidth
                      onClick={() => {
                        if (product.productID) {
                          handleAddToCart(product.productID, quantity, product.name || 'Product');
                        } else {
                          console.error('Product ID is invalid');
                        }
                      }}
                      disabled={product.stock === 0}
                      loading={addToCartLoading}
                    >
                      Add to cart
                    </Button>
                  </Popover.Dropdown>
                </Popover>
              </Group>
            </Card.Section>
          </Card>
        ))}
      </SimpleGrid>
      
      {/* Pagination component */}
      {totalPages > 1 && (
        <Center mt="xl">
          <Pagination 
            total={totalPages} 
            value={page} 
            onChange={handlePageChange}
            size="md"
            radius="md"
            withEdges
            nextIcon={IconChevronRight}
            previousIcon={IconChevronLeft}
          />
        </Center>
      )}
    </div>
  );
}
