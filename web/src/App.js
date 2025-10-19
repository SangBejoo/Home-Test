import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Container,
  Flex,
  Grid,
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
  useToast,
  Button,
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
          title: 'Ringkasan berhasil dimuat',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } else {
        throw new Error('Failed to fetch summary');
      }
    } catch (error) {
      toast({
        title: 'Error memuat ringkasan',
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
            Dashboard Pemesanan
          </Heading>
          <Button
            leftIcon={<RepeatIcon />}
            colorScheme="blue"
            variant="outline"
            onClick={() => fetchSummary(selectedYear, selectedMonth)}
            isLoading={loading}
            loadingText="Wait a moment..."
          >
            Refresh
          </Button>
        </Flex>

        {/* Filter */}
        <Card>
          <CardBody>
            <HStack spacing={4} align="end">
              <FormControl>
                <FormLabel>Tahun</FormLabel>
                <Select
                  placeholder="Pilih tahun"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Bulan</FormLabel>
                <Select
                  placeholder="Pilih bulan"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  <option value="1">Januari</option>
                  <option value="2">Februari</option>
                  <option value="3">Maret</option>
                  <option value="4">April</option>
                  <option value="5">Mei</option>
                  <option value="6">Juni</option>
                  <option value="7">Juli</option>
                  <option value="8">Agustus</option>
                  <option value="9">September</option>
                  <option value="10">Oktober</option>
                  <option value="11">November</option>
                  <option value="12">Desember</option>
                </Select>
              </FormControl>
              <Button colorScheme="blue" onClick={handleFilter} isLoading={loading}>
                Filter
              </Button>
              <Button variant="outline" onClick={() => { setSelectedYear(''); setSelectedMonth(''); fetchSummary('', ''); }}>
                Hapus Filter
              </Button>
            </HStack>
          </CardBody>
        </Card>

        {/* Period Display */}
        {summary && summary.startDate && summary.endDate && (
          <Text fontSize="lg" color="blue.600" fontWeight="bold">
            Periode: {formatPeriod(summary.startDate, summary.endDate)}
          </Text>
        )}

        {/* Loading */}
        {loading && (
          <Center py={10}>
            <VStack spacing={4}>
              <Spinner size="xl" color="blue.500" />
              <Text>Memuat ringkasan...</Text>
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
                    <StatLabel fontSize="sm" color="gray.600">Total Pemesanan</StatLabel>
                    <StatNumber fontSize="3xl" color="blue.600">{summary.totalBookings}</StatNumber>
                    <StatHelpText>
                      <CalendarIcon mr={2} />
                      Pemesanan
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel fontSize="sm" color="gray.600">Total Peserta</StatLabel>
                    <StatNumber fontSize="3xl" color="green.600">{summary.totalParticipants}</StatNumber>
                    <StatHelpText>
                      👥 Peserta
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </Grid>

            {/* Offices and Rooms - Multi Column Layout */}
            <Grid templateColumns="repeat(auto-fit, minmax(350px, 1fr))" gap={6}>
              {summary.offices.map((office, officeIndex) => (
                <VStack key={officeIndex} align="stretch" spacing={3}>
                  {/* Office Header */}
                  <Card bg="blue.50">
                    <CardBody py={3}>
                      <Heading size="sm" color="blue.700">{office.officeName}</Heading>
                      <Text fontSize="xs" color="gray.600" mt={1}>
                        {office.rooms.length} room{office.rooms.length !== 1 ? 's' : ''}
                      </Text>
                    </CardBody>
                  </Card>

                  {/* Rooms Stack */}
                  <VStack spacing={3} align="stretch">
                    {office.rooms.map((room, roomIndex) => (
                      <Card key={roomIndex} borderLeft="4px solid" borderColor="blue.500" size="sm">
                        <CardHeader pb={2}>
                          <Heading size="xs" color="blue.600">{room.roomName}</Heading>
                          <VStack align="start" spacing={1} mt={2}>
                            <Text fontSize="xs" color="gray.500">
                              📅 {room.bookingStartDate} - {room.bookingEndDate}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              🕐 {new Date(room.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(room.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                          </VStack>
                        </CardHeader>
                        <CardBody pt={1}>
                          {/* Quick Stats */}
                          <Grid templateColumns="repeat(3, 1fr)" gap={2} mb={3}>
                            <Box bg="blue.50" p={2} borderRadius="md">
                              <Text fontSize="xs" color="gray.600">Pemesanan</Text>
                              <Text fontSize="sm" fontWeight="bold" color="blue.600">{room.bookingCount}</Text>
                            </Box>
                            <Box bg="green.50" p={2} borderRadius="md">
                              <Text fontSize="xs" color="gray.600">Peserta</Text>
                              <Text fontSize="sm" fontWeight="bold" color="green.600">{room.totalParticipants}</Text>
                            </Box>
                            <Box bg="orange.50" p={2} borderRadius="md">
                              <Text fontSize="xs" color="gray.600">Total Biaya</Text>
                              <Text fontSize="xs" fontWeight="bold" color="orange.600">
                                Rp {room.consumptions.reduce((sum, cons) => sum + cons.totalCost, 0).toLocaleString('id-ID')}
                              </Text>
                            </Box>
                          </Grid>

                          {/* Consumptions Table */}
                          {room.consumptions.length > 0 && (
                            <Box fontSize="xs">
                              <Text fontSize="xs" fontWeight="bold" mb={2} color="gray.700">Konsumsi:</Text>
                              <Table size="sm" variant="simple">
                                <Thead>
                                  <Tr bg="gray.50">
                                    <Th fontSize="xs" p={1}>Barang</Th>
                                    <Th isNumeric fontSize="xs" p={1}>Jml</Th>
                                    <Th isNumeric fontSize="xs" p={1}>Biaya</Th>
                                  </Tr>
                                </Thead>
                                <Tbody>
                                  {room.consumptions.map((cons, consIndex) => (
                                    <Tr key={consIndex}>
                                      <Td fontSize="xs" p={1}>{cons.consumptionName}</Td>
                                      <Td isNumeric fontSize="xs" p={1}>{cons.count}</Td>
                                      <Td isNumeric fontSize="xs" p={1}>Rp {cons.totalCost.toLocaleString('id-ID')}</Td>
                                    </Tr>
                                  ))}
                                </Tbody>
                              </Table>
                            </Box>
                          )}
                          
                          {room.consumptions.length === 0 && (
                            <Text fontSize="xs" color="gray.500" textAlign="center" py={2}>
                              Tidak ada konsumsi
                            </Text>
                          )}
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                </VStack>
              ))}
            </Grid>
          </>
        )}
      </VStack>
    </Container>
  );
}