import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  Spinner,
  Center,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useToast,
  Button,
  IconButton,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Input,
  FormControl,
  FormLabel,
  Select,
} from '@chakra-ui/react';
import { RepeatIcon, CalendarIcon } from '@chakra-ui/icons';

const API_BASE_URL = 'http://localhost:8000/v1/booking/summary';

const formatPeriod = (start, end) => {
  if (!start || !end) return '';
  const startDate = new Date(start);
  const endDate = new Date(end);
  const startMonth = startDate.toLocaleString('default', { month: 'long' });
  const startYear = startDate.getFullYear();
  const endMonth = endDate.toLocaleString('default', { month: 'long' });
  const endYear = endDate.getFullYear();
  if (startYear === endYear && startMonth === endMonth) {
    return `${startMonth} ${startYear}`;
  } else {
    return `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
  }
};

const getLastDayOfMonth = (year, month) => {
  return new Date(year, month, 0).getDate();
};

export default function BookingDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const toast = useToast();

  // Fetch summary
  const fetchSummary = async (year = '', month = '') => {
    setLoading(true);
    try {
      let url = API_BASE_URL;
      const params = new URLSearchParams();

      if (year && month) {
        const mon = month.padStart(2, '0');
        const selectedMonth = `${year}-${mon}`;
        const [y, m] = selectedMonth.split('-').map(Number);
        const startDate = `${selectedMonth}-01`;
        const endDate = `${selectedMonth}-${getLastDayOfMonth(y, m)}`;
        params.append('start_date', startDate);
        params.append('end_date', endDate);
      }

      if (params.toString()) url += '?' + params.toString();

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
        toast({
          title: 'Summary loaded successfully',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } else {
        throw new Error('Failed to fetch summary');
      }
    } catch (error) {
      toast({
        title: 'Error fetching summary',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Load summary on component mount
  useEffect(() => {
    fetchSummary(selectedYear, selectedMonth);
  }, []);

  // Handle filter
  const handleFilter = () => {
    fetchSummary(selectedYear, selectedMonth);
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Heading size="xl" color="blue.600">
            Booking Dashboard
          </Heading>
          <Button
            leftIcon={<RepeatIcon />}
            colorScheme="blue"
            variant="outline"
            onClick={() => fetchSummary(selectedYear, selectedMonth)}
            isLoading={loading}
            loadingText="Refreshing..."
          >
            Refresh
          </Button>
        </Flex>

        {/* Filter */}
        <Card>
          <CardBody>
            <HStack spacing={4} align="end">
              <FormControl>
                <FormLabel>Year</FormLabel>
                <Select
                  placeholder="Select year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Month</FormLabel>
                <Select
                  placeholder="Select month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  <option value="1">January</option>
                  <option value="2">February</option>
                  <option value="3">March</option>
                  <option value="4">April</option>
                  <option value="5">May</option>
                  <option value="6">June</option>
                  <option value="7">July</option>
                  <option value="8">August</option>
                  <option value="9">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </Select>
              </FormControl>
              <Button colorScheme="blue" onClick={handleFilter} isLoading={loading}>
                Filter
              </Button>
              <Button variant="outline" onClick={() => { setSelectedYear(''); setSelectedMonth(''); fetchSummary('', ''); }}>
                Clear Filter
              </Button>
            </HStack>
          </CardBody>
        </Card>

        {/* Period Display */}
        {summary && summary.startDate && summary.endDate && (
          <Text fontSize="lg" color="blue.600" fontWeight="bold">
            Period: {formatPeriod(summary.startDate, summary.endDate)}
          </Text>
        )}

        {/* Loading */}
        {loading && (
          <Center py={10}>
            <VStack spacing={4}>
              <Spinner size="xl" color="blue.500" />
              <Text>Loading summary...</Text>
            </VStack>
          </Center>
        )}

                {/* Summary Stats */}
        {summary && (
          <>
            <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={6} mb={6}>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel fontSize="sm" color="gray.600">Total Bookings</StatLabel>
                    <StatNumber fontSize="3xl" color="blue.600">{summary.totalBookings}</StatNumber>
                    <StatHelpText>
                      <CalendarIcon mr={2} />
                      Bookings
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel fontSize="sm" color="gray.600">Total Participants</StatLabel>
                    <StatNumber fontSize="3xl" color="green.600">{summary.totalParticipants}</StatNumber>
                    <StatHelpText>
                      👥 Participants
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </Grid>

            {/* Offices Accordion */}
            <Card>
              <CardHeader>
                <Heading size="md">Offices and Rooms Summary</Heading>
              </CardHeader>
              <CardBody>
                <Accordion allowToggle>
                  {summary.offices.map((office, officeIndex) => (
                    <AccordionItem key={officeIndex}>
                      <AccordionButton>
                        <Box flex="1" textAlign="left">
                          <Text fontWeight="bold">{office.officeName}</Text>
                          <Text fontSize="sm" color="gray.600">
                            {office.rooms.length} room{office.rooms.length !== 1 ? 's' : ''}
                          </Text>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel pb={4}>
                        <VStack spacing={4} align="stretch">
                          {office.rooms.map((room, roomIndex) => (
                            <Card key={roomIndex} size="sm">
                              <CardHeader>
                                <Heading size="sm">{room.roomName}</Heading>
                              <VStack align="start" spacing={1}>
                                <Text fontSize="xs" color="gray.500">
                                  Booking Dates: {room.bookingStartDate} - {room.bookingEndDate}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  Time Range: {new Date(room.startTime).toLocaleString()} - {new Date(room.endTime).toLocaleString()}
                                </Text>
                              </VStack>
                              <HStack spacing={4}>
                                <Stat size="sm">
                                  <StatLabel>Bookings</StatLabel>
                                  <StatNumber>{room.bookingCount}</StatNumber>
                                </Stat>
                                <Stat size="sm">
                                  <StatLabel>Participants</StatLabel>
                                  <StatNumber>{room.totalParticipants}</StatNumber>
                                </Stat>
                                <Stat size="sm">
                                  <StatLabel>Total Cost</StatLabel>
                                  <StatNumber>Rp {room.consumptions.reduce((sum, cons) => sum + cons.totalCost, 0).toLocaleString()}</StatNumber>
                                </Stat>
                              </HStack>
                            </CardHeader>
                            <CardBody>
                              <Table size="sm" variant="simple">
                                <Thead>
                                  <Tr>
                                    <Th>Consumption</Th>
                                    <Th isNumeric>Count</Th>
                                    <Th isNumeric>Total Cost</Th>
                                  </Tr>
                                </Thead>
                                <Tbody>
                                  {room.consumptions.map((cons, consIndex) => (
                                    <Tr key={consIndex}>
                                      <Td>{cons.consumptionName}</Td>
                                      <Td isNumeric>{cons.count}</Td>
                                      <Td isNumeric>Rp {cons.totalCost.toLocaleString()}</Td>
                                    </Tr>
                                  ))}
                                </Tbody>
                              </Table>
                            </CardBody>
                          </Card>
                        ))}
                      </VStack>
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardBody>
          </Card>
          </>
        )}
      </VStack>
    </Container>
  );
}