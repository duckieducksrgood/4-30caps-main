// import { useState } from 'react';
// import { IconDownload, IconSearch } from '@tabler/icons-react';
// import useSWR from 'swr';
// import {
//   AppShell,
//   Autocomplete,
//   Button,
//   Divider,
//   Group,
//   Modal,
//   rem,
//   Select,
//   Stack,
//   Text,
//   Textarea,
//   Title,
//   UnstyledButton,
// } from '@mantine/core';
// import { useDisclosure } from '@mantine/hooks';
// import { notifications } from '@mantine/notifications';
// import CartButton from '@/components/cartButton';
// import HeaderComponent from '@/components/headerPAGE/headerComponent';
// import { HeroContentLeft } from '@/components/landingPage/hero/hero';
// import classes from '@/components/module.css/MobileNavbar.module.css';
// import { CategoryTableofContent } from '@/components/productsPage/categories';
// import { ProductCard } from '@/components/productsPage/productCards';
// import withRoleProtection from '@/utils/authAPI/userApi';
// import axiosInstance from '@/utils/axiosInstance';

// interface Category {
//   name: string;
//   categoryID: string;
// }

// const fetcher = (url: string) => fetch(url).then((res) => res.json());

// function ProductPage() {
//   const [opened, { toggle }] = useDisclosure();
//   const [categorySelected, setCategorySelected] = useState('all');
//   const [modalOpened, setModalOpened] = useState(false);
//   const [customOrder, setCustomOrder] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
//   const [searchQuery, setSearchQuery] = useState('');


//   const { data: categoriesData, isLoading } = useSWR<Category[]>('category/', fetcher);

//   const handleCustomOrderSubmit = async () => {
//     try {
//       const response = await axiosInstance.post('customOrder/', {
//         category_id: selectedCategory,
//         custom_order_description: customOrder,
//       });
//     } catch (error) {
//       console.error(error);
//       notifications.show({
//         title: 'Error',
//         message: 'An error occurred. Please try again later.',
//         color: 'red',
//       });
//       return;
//     } finally {
//       setModalOpened(false);
//       notifications.show({
//         title: 'Order Received',
//         message:
//           'Your custom order has been received. A confirmation email will be sent with the final pricing.',
//       });
//     }
//   };

//   const handleModalClose = () => {
//     setModalOpened(false);
//     setCustomOrder('');
//     setSelectedCategory(null);
//   };

//   return (
//     <>
//       <AppShell
//         header={{ height: 60 }}
//         navbar={{
//           width: 300,
//           breakpoint: 'sm',
//           collapsed: { desktop: true, mobile: !opened },
//         }}
//         padding="md"
//       >
//         <AppShell.Header pos={'sticky'}>
//           <HeaderComponent opened={opened} toggle={toggle} />
//         </AppShell.Header>

//         <AppShell.Navbar py="md" px={4}>
//           <UnstyledButton component="a" href="/projects/page" className={classes.control}>
//             Projects
//           </UnstyledButton>
//           <UnstyledButton component="a" href="/products/page" className={classes.control}>
//             Products
//           </UnstyledButton>
//           <UnstyledButton className={classes.control}>Services</UnstyledButton>
//           <UnstyledButton className={classes.control}>About Us</UnstyledButton>
//         </AppShell.Navbar>

//         <AppShell.Main p={0}>
//           <HeroContentLeft
//             imageUrl="/buru.jpg" 
//             heroTitle="Our Products"
//             heroText1="Browse through Charles J built products and see what we have in store for you"
//             heroText2=""
//           />

//           <Title order={1} ta={'center'} pt={50}>
//             Categories
//           </Title>
//           <Group p={50} justify="flex-end">
//           <Autocomplete
//               className={classes.search}
//               placeholder="Search"
//               value={searchQuery}
//               onChange={setSearchQuery}
//               leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
//               data={[]} // optional suggestions
//               visibleFrom="xs"
//             />

//             <Button rightSection={<IconDownload size={14} />} onClick={() => setModalOpened(true)}>
//               Custom Order
//             </Button>
//           </Group>
//           <Divider />
//           <Group justify="space-between" p={50}>
//             <CategoryTableofContent setCategorySelected={setCategorySelected} />
//             <ProductCard categorySelected={categorySelected} searchQuery={searchQuery} />

//           </Group>
//         </AppShell.Main>
//       </AppShell>

//       <Modal opened={modalOpened} onClose={handleModalClose} title="Place a Custom Order">
//         <Stack>
//           <Select
//             label="Select Category"
//             placeholder={isLoading ? 'Loading categories...' : 'Choose a category'}
//             data={
//               categoriesData
//                 ? categoriesData.map((category) => ({
//                     value: category.categoryID,
//                     label: category.name,
//                   }))
//                 : []
//             }
//             value={selectedCategory}
//             onChange={setSelectedCategory}
//             disabled={isLoading}
//           />
//           <Textarea
//             placeholder="Describe your custom order"
//             label="Custom Order Description"
//             autosize
//             minRows={2}
//             value={customOrder}
//             onChange={(event) => setCustomOrder(event.currentTarget.value)}
//           />
//           <Text color="dimmed" size="sm">
//             Note: The price is not final. A confirmation email will be sent with the final pricing.
//           </Text>
//           <Button onClick={handleCustomOrderSubmit}>Submit Order</Button>
//         </Stack>
//       </Modal>
//     </>
//   );
// }

// export default withRoleProtection(ProductPage, ['customer', 'admin']);


import { useState, useEffect } from 'react';
import { IconAdjustments, IconDownload, IconFilter, IconSearch, IconX, IconShoppingCart } from '@tabler/icons-react';
import useSWR from 'swr';
import {
  AppShell,
  Autocomplete,
  Button,
  Divider,
  Group,
  Modal,
  NumberInput,
  Paper,
  RangeSlider,
  rem,
  ScrollArea,
  Select,
  Skeleton,
  Stack,
  Switch,
  Text,
  Textarea,
  Title,
  UnstyledButton,
  Drawer,
  ActionIcon,
  Badge,
  Tooltip,
  Container,
  Transition,
} from '@mantine/core';
import { useDisclosure, useDebouncedValue, useMediaQuery, useViewportSize } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import CartButton from '../../components/cartButton';
import HeaderComponent from '../../components/headerPAGE/headerComponent';
import { HeroContentLeft } from '../../components/landingPage/hero/hero';
import navbarClasses from '../../components/module.css/MobileNavbar.module.css';
import { CategoryTableofContent } from '../../components/productsPage/categories';
import { ProductCard } from '../../components/productsPage/productCards';
import { AnimatedProductHeader } from '../../components/productsPage/AnimatedProductHeader';
import withRoleProtection from '../../utils/authAPI/userApi';
import axiosInstance from '../../utils/axiosInstance';
import pageClasses from './ProductPage.module.css';

interface Category {
  name: string;
  categoryID: string;
}

interface Product {
  productID: string;
  name: string;
  price: number;
}

const fetcher = (url: string) => 
  axiosInstance.get(url)
    .then((res) => res.data)
    .catch(error => {
      console.error("Error fetching data:", error);
      return null;
    });

function ProductPage() {
  // Sidebar and mobile responsiveness
  const [opened, { toggle }] = useDisclosure();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [filterDrawerOpened, setFilterDrawerOpened] = useState(false);

  // Category management
  const [categorySelected, setCategorySelected] = useState('all');
  
  // Custom order modal
  const [modalOpened, setModalOpened] = useState(false);
  const [customOrder, setCustomOrder] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 500);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  
  // Advanced filtering
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Fetch categories data for the sidebar and custom order
  const { data: categoriesData, isLoading } = useSWR<Category[]>('category/', fetcher);

  // Fetch products data for search suggestions
  const { data: productsData } = useSWR<Product[]>('products/', fetcher);

  // Generate search suggestions based on product names
  useEffect(() => {
    if (productsData && searchQuery.trim() !== '') {
      const filteredSuggestions = productsData
        .filter(product => 
          product.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map(product => product.name)
        .slice(0, 5);
      setSearchSuggestions(filteredSuggestions);
    } else {
      setSearchSuggestions([]);
    }
  }, [searchQuery, productsData]);

  // Update active filters for UI display
  useEffect(() => {
    const filters = [];
    if (minPrice !== undefined && maxPrice !== undefined) {
      filters.push(`Price: ₱${minPrice} - ₱${maxPrice}`);
    }
    if (inStockOnly) {
      filters.push('In-Stock Only');
    }
    if (categorySelected !== 'all') {
      filters.push(`Category: ${categorySelected}`);
    }
    if (debouncedSearchQuery) {
      filters.push(`Search: ${debouncedSearchQuery}`);
    }
    setActiveFilters(filters);
  }, [minPrice, maxPrice, inStockOnly, categorySelected, debouncedSearchQuery]);

  // Handle price range changes
  const handlePriceRangeChange = (values: [number, number]) => {
    setPriceRange(values);
    setMinPrice(values[0]);
    setMaxPrice(values[1]);
  };

  // Apply filters
  const applyFilters = () => {
    setFilterDrawerOpened(false);
  };

  // Clear all filters
  const clearFilters = () => {
    setCategorySelected('all');
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setInStockOnly(false);
    setPriceRange([0, 10000]);
    setSearchQuery('');
    setFilterDrawerOpened(false);
  };

  // Handle custom order submission
  const handleCustomOrderSubmit = async () => {
    // Form validation
    if (!selectedCategory) {
      notifications.show({
        title: 'Missing Category',
        message: 'Please select a category for your custom order.',
        color: 'yellow',
      });
      return;
    }
    
    if (!customOrder.trim()) {
      notifications.show({
        title: 'Missing Description',
        message: 'Please provide a description for your custom order.',
        color: 'yellow',
      });
      return;
    }
    
    try {
      const response = await axiosInstance.post('customOrder/', {
        category_id: selectedCategory,
        custom_order_description: customOrder,
      });
      
      setModalOpened(false);
      notifications.show({
        title: 'Order Received',
        message: 'Your custom order has been received. A confirmation email will be sent with the final pricing.',
        color: 'green',
      });
    } catch (error) {
      console.error('Custom order error:', error);
      notifications.show({
        title: 'Error',
        message: 'An error occurred. Please try again later.',
        color: 'red',
      });
    }
  };

  // Close custom order modal and reset form
  const handleModalClose = () => {
    setModalOpened(false);
    setCustomOrder('');
    setSelectedCategory(null);
  };

  // Animation state for filter transitions
  const [filtersVisible, setFiltersVisible] = useState(false);
  
  // Watch activeFilters for changes and animate accordingly
  useEffect(() => {
    if (activeFilters.length > 0) {
      setFiltersVisible(true);
    } else {
      setFiltersVisible(false);
    }
  }, [activeFilters]);

  // Rendering the filter badges UI component with animations and improved UI
  const renderFilterBadges = () => {
    if (activeFilters.length === 0) return null;
    
    // Helper function to get icon for each filter type
    const getFilterIcon = (filter: string) => {
      if (filter.startsWith('Price:')) return <IconAdjustments size={14} stroke={1.5} />;
      if (filter === 'In-Stock Only') return <IconShoppingCart size={14} stroke={1.5} />;
      if (filter.startsWith('Category:')) return <IconFilter size={14} stroke={1.5} />;
      if (filter.startsWith('Search:')) return <IconSearch size={14} stroke={1.5} />;
      return null;
    };
    
    return (
      <Container size="xl" px="md" py="xs">
        <Paper 
          shadow="sm" 
          p="md" 
          radius="md" 
          withBorder
          className={pageClasses.activeFiltersContainer}
        >
          <Group justify="space-between" mb={activeFilters.length > 0 ? "xs" : 0}>
            <Group gap="xs">
              <IconFilter size={18} stroke={1.5} color="var(--mantine-color-blue-6)" />
              <Text fw={500} size="sm" c="dimmed">Active Filters:</Text>
            </Group>
            
            {activeFilters.length > 0 && (
              <Tooltip label="Clear all filters">
                <Button 
                  variant="subtle" 
                  size="xs"
                  onClick={clearFilters}
                  leftSection={<IconX size={14} />}
                  color="gray"
                  className={pageClasses.clearButton}
                >
                  Clear all
                </Button>
              </Tooltip>
            )}
          </Group>
          
          {activeFilters.length > 0 ? (
            <ScrollArea w="100%" type="auto" offsetScrollbars scrollbarSize={4} py="xs">
              <Group gap="xs" style={{ flexWrap: 'nowrap' }}>
                {activeFilters.map((filter, index) => (
                  <Badge 
                    key={index} 
                    color="blue" 
                    variant="outline"
                    size="md"
                    radius="sm"
                    className={pageClasses.filterBadge}
                    leftSection={getFilterIcon(filter)}
                    rightSection={
                      <ActionIcon 
                        size="xs" 
                        color="gray" 
                        radius="xl" 
                        variant="subtle"
                        className={pageClasses.filterRemoveButton}
                        onClick={() => {
                          if (filter.startsWith('Price:')) {
                            setMinPrice(undefined);
                            setMaxPrice(undefined);
                            setPriceRange([0, 10000]);
                          } else if (filter === 'In-Stock Only') {
                            setInStockOnly(false);
                          } else if (filter.startsWith('Category:')) {
                            setCategorySelected('all');
                          } else if (filter.startsWith('Search:')) {
                            setSearchQuery('');
                          }
                        }}
                      >
                        <IconX size={10} />
                      </ActionIcon>
                    }
                  >
                    {filter}
                  </Badge>
                ))}
              </Group>
            </ScrollArea>
          ) : (
            <Text c="dimmed" size="sm" fs="italic">No active filters. Use the filter options above to refine your product search.</Text>
          )}
        </Paper>
      </Container>
    );
  };

  return (
    <>
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 300,
          breakpoint: 'sm',
          collapsed: { desktop: true, mobile: !opened },
        }}
        padding="md"
      >
        <AppShell.Header pos={'sticky'}>
          <HeaderComponent opened={opened} toggle={toggle} />
        </AppShell.Header>

        <AppShell.Navbar py="md" px={4}>
          <UnstyledButton component="a" href="/projects/page" className={navbarClasses.control}>
            Projects
          </UnstyledButton>
          <UnstyledButton component="a" href="/products/page" className={navbarClasses.control}>
            Products
          </UnstyledButton>
          <UnstyledButton className={navbarClasses.control}>Services</UnstyledButton>
          <UnstyledButton className={navbarClasses.control}>About Us</UnstyledButton>
        </AppShell.Navbar>

        <AppShell.Main p={0}>
          <HeroContentLeft
            imageUrl="/buru.jpg" 
            heroTitle="Our Products"
            heroText1="Browse through our high-quality products and find exactly what you need"
            heroText2="Use the filters and search to narrow down your selection"
          />
          
          {/* Animated header similar to Projects page */}
          <AnimatedProductHeader />
          
          {/* Search and Action Bar - Enhanced UI */}
          <Container size="xl" px="md" py="md">
            <Paper shadow="sm" radius="lg" p="md" withBorder>
              <Group justify="space-between" wrap={isMobile ? "wrap" : "nowrap"} gap="md">
                <Autocomplete
                  className={pageClasses.search}
                  placeholder="Search for products by name or description..."
                  value={searchQuery}
                  onChange={setSearchQuery}
                  data={searchSuggestions}
                  leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                  rightSection={
                    searchQuery ? (
                      <Tooltip label="Clear search">
                        <ActionIcon variant="subtle" color="gray" onClick={() => setSearchQuery('')}>
                          <IconX size={16} />
                        </ActionIcon>
                      </Tooltip>
                    ) : null
                  }
                  style={{ 
                    flexGrow: 1, 
                    maxWidth: isMobile ? '100%' : '500px',
                    order: isMobile ? 3 : 1,
                    width: isMobile ? '100%' : 'auto'
                  }}
                />
                
                <Group gap="sm" style={{ order: isMobile ? 1 : 2, width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'center' : 'flex-end' }}>
                  <Tooltip label="Filter products">
                    <Button 
                      leftSection={<IconFilter size={16} />} 
                      onClick={() => setFilterDrawerOpened(true)}
                      variant="light"
                      className={pageClasses.filterButton}
                      color="blue"
                    >
                      {isMobile ? 'Filters' : 'Filter Products'}
                    </Button>
                  </Tooltip>
                  
                  <Tooltip label="Request a custom order">
                    <Button 
                      rightSection={<IconDownload size={16} />} 
                      onClick={() => setModalOpened(true)}
                      className={pageClasses.customOrderButton}
                      variant="gradient"
                      gradient={{ from: 'blue', to: 'cyan' }}
                    >
                      Custom Order
                    </Button>
                  </Tooltip>
                </Group>
              </Group>
            </Paper>
          </Container>
          
          {/* Active Filters Display */}
          {renderFilterBadges()}
          
          <Divider my="sm" />
          
          {/* Main Content Area - Improved Layout */}
          <Container size="xl" px="md" pb="xl" id="products-section">
            <Group align="flex-start" style={{ flexWrap: isMobile ? 'wrap' : 'nowrap' }} gap="lg">
              {/* Category Sidebar - Hide on Mobile */}
              {!isMobile && (
                <div style={{ width: '250px', flexShrink: 0 }}>
                  <Paper withBorder p="md" radius="md" className={pageClasses.categorySidebar} shadow="sm">
                    <Group justify="space-between" mb="md">
                      <Title order={4}>Categories</Title>
                      {categorySelected !== 'all' && (
                        <Tooltip label="Show all categories">
                          <ActionIcon 
                            variant="light" 
                            color="blue" 
                            onClick={() => setCategorySelected('all')}
                            radius="xl"
                          >
                            <IconX size={16} />
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </Group>
                    <CategoryTableofContent 
                      setCategorySelected={setCategorySelected}
                      categorySelected={categorySelected}  
                    />
                  </Paper>
                </div>
              )}
              
              {/* Product Cards Section */}
              <div style={{ flexGrow: 1 }} className={pageClasses.productContainer}>
                {/* Currently selected category info */}
                {categorySelected !== 'all' && (
                  <Group mb="md" justify="space-between" className={pageClasses.categoryHeading}>
                    <Title order={4}>
                      {categorySelected}
                    </Title>
                    {isMobile && (
                      <Button 
                        variant="subtle" 
                        size="xs" 
                        onClick={() => setFilterDrawerOpened(true)}
                        leftSection={<IconFilter size={14} />}
                        className={pageClasses.mobileFilterButton}
                      >
                        Categories
                      </Button>
                    )}
                  </Group>
                )}
                
                <ProductCard 
                  categorySelected={categorySelected}
                  searchQuery={debouncedSearchQuery}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  inStock={inStockOnly}
                />
              </div>
            </Group>
          </Container>
        </AppShell.Main>
      </AppShell>

      {/* Filter Drawer for Mobile */}
      <Drawer 
        opened={filterDrawerOpened} 
        onClose={() => setFilterDrawerOpened(false)}
        title={
          <Group justify="space-between" align="center">
            <Text size="xl" fw={700}>
              <IconFilter size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Filter Products
            </Text>
            {(minPrice !== undefined || maxPrice !== undefined || inStockOnly || categorySelected !== 'all') && (
              <Badge color="blue" variant="filled" radius="sm">Filters Active</Badge>
            )}
          </Group>
        }
        position="right"
        size="md"
        padding="xl"
        overlayProps={{ opacity: 0.5, blur: 4 }}
        className={pageClasses.filterDrawer}
        transitionProps={{ duration: 400, timingFunction: 'ease' }}
      >
        <Stack gap="xl">
          <Paper withBorder p="md" radius="md">
            <Title order={4} mb="md">Categories</Title>              <ScrollArea h={200} scrollbarSize={6} offsetScrollbars>
              <CategoryTableofContent 
                setCategorySelected={(category) => {
                  // First set the selected category
                  setCategorySelected(category);
                  
                  // Close drawer with a small delay for better UX on mobile
                  if (category !== 'all') {
                    setTimeout(() => {
                      setFilterDrawerOpened(false);
                    }, 300);
                    
                    // Show notification for category selection
                    notifications.show({
                      title: 'Category Selected',
                      message: `Showing products in ${category}`,
                      color: 'blue',
                      autoClose: 2000,
                    });
                  }
                }} 
                categorySelected={categorySelected}
              />
            </ScrollArea>
          </Paper>
          
          <Paper withBorder p="md" radius="md">
            <Title order={4} mb="md">Price Range</Title>
            <RangeSlider
              min={0}
              max={10000}
              step={100}
              value={priceRange}
              onChange={handlePriceRangeChange}
              color="blue"
              size="lg"
              marks={[
                { value: 0, label: '₱0' },
                { value: 2500, label: '₱2,500' },
                { value: 5000, label: '₱5,000' },
                { value: 7500, label: '₱7,500' },
                { value: 10000, label: '₱10,000+' }
              ]}
              label={(value) => `₱${value.toLocaleString()}`}
              labelAlwaysOn
            />
            
            <Group justify="space-between" mt="lg">
              <Paper p="xs" radius="md" withBorder style={{ width: '48%' }}>
                <NumberInput
                  label="Minimum Price"
                  description="Lowest price filter"
                  value={priceRange[0]}
                  onChange={(val) => {
                    const numVal = typeof val === 'number' ? val : 0;
                    handlePriceRangeChange([numVal, priceRange[1]]);
                  }}
                  min={0}
                  max={priceRange[1] - 100}
                  prefix="₱"
                  size="md"
                  stepHoldDelay={500}
                  stepHoldInterval={100}
                />
              </Paper>
              <Paper p="xs" radius="md" withBorder style={{ width: '48%' }}>
                <NumberInput
                  label="Maximum Price"
                  description="Highest price filter"
                  value={priceRange[1]}
                  onChange={(val) => {
                    const numVal = typeof val === 'number' ? val : 10000;
                    handlePriceRangeChange([priceRange[0], numVal]);
                  }}
                  min={priceRange[0] + 100}
                  max={10000}
                  prefix="₱"
                  size="md"
                  stepHoldDelay={500}
                  stepHoldInterval={100}
                />
              </Paper>
            </Group>
          </Paper>
          
          <Paper withBorder p="md" radius="md">
            <Group justify="space-between">
              <div>
                <Title order={4}>Stock Status</Title>
                <Text size="sm" c="dimmed">Show only available products</Text>
              </div>
              <Switch
                size="lg"
                color="green"
                checked={inStockOnly}
                onChange={(event) => setInStockOnly(event.currentTarget.checked)}
              />
            </Group>
          </Paper>
          
          <Group mt="xl" justify="space-between">
            <Button 
              variant="outline" 
              onClick={clearFilters} 
              color="gray"
              leftSection={<IconX size={16} />}
              size="lg"
            >
              Clear All
            </Button>
            <Button 
              onClick={applyFilters}
              size="lg"
              color="blue"
              leftSection={<IconFilter size={16} />}
              variant="filled"
            >
              Apply Filters
            </Button>
          </Group>
        </Stack>
      </Drawer>

      {/* Custom Order Modal */}
      <Modal 
        opened={modalOpened} 
        onClose={handleModalClose} 
        title="Create Custom Order"
        size="md"
      >
        <Stack>
          <Select
            label="Select Category"
            placeholder={isLoading ? 'Loading categories...' : 'Choose a category'}
            data={
              categoriesData
                ? categoriesData.map((category) => ({
                    value: category.categoryID,
                    label: category.name,
                  }))
                : []
            }
            value={selectedCategory}
            onChange={setSelectedCategory}
            disabled={isLoading}
            required
            error={!selectedCategory && modalOpened ? 'Please select a category' : null}
            searchable
          />
          
          <Textarea
            placeholder="Describe your custom order in detail"
            label="Custom Order Description"
            description="Please provide specific details about your requirements"
            autosize
            minRows={4}
            maxRows={10}
            value={customOrder}
            onChange={(event) => setCustomOrder(event.currentTarget.value)}
            required
            error={!customOrder && modalOpened ? 'Please provide a description' : null}
          />
          
          <Paper withBorder p="sm" radius="md" bg="var(--mantine-color-blue-0)">
            <Text size="sm">
              <strong>Note:</strong> The price for custom orders is not final. Our team will review your request and send a confirmation email with the final pricing within 24-48 hours.
            </Text>
          </Paper>
          
          <Group justify="space-between" mt="md">
            <Button variant="subtle" onClick={handleModalClose}>Cancel</Button>
            <Button onClick={handleCustomOrderSubmit} color="blue">Submit Order</Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}

export default withRoleProtection(ProductPage, ['customer', 'admin']);