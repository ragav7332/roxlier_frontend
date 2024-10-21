import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Select,
  MenuItem,
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  CircularProgress,

  Box,
  Pagination,
  Grid
} from '@mui/material';
import { BarChart, Bar,Cell, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

function TransactionTable() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1); 
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statistics, setStatistics] = useState({});
  const [barChartData, setBarChartData] = useState([]);
  const [pieChartData, setPieChartData] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  const ROXLIER_BACKEND_URL='https://roxlier-backend.onrender.com';

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${ROXLIER_BACKEND_URL}/transactions`);
        const data = await response.json();
        setTransactions(data);
        setFilteredTransactions(data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const filteredData = transactions.filter(
      (transaction) => new Date(transaction.dateOfSale).getMonth() + 1 === month || month === 0
    );
    setFilteredTransactions(filteredData);
  }, [transactions, month]);

  useEffect(() => {
    const filteredBySearch = transactions.filter((transaction) => {
      const searchText = search.toLowerCase();
      return (
        transaction.title.toLowerCase().includes(searchText) ||
        transaction.description.toLowerCase().includes(searchText) ||
        transaction.price.toString().includes(searchText)
      );
    });


    setFilteredTransactions(filteredBySearch.length > 0 ? filteredBySearch : transactions);
  }, [search, transactions]);

  useEffect(() => {
    const calculateStatistics = () => {
      const totalSaleAmount = filteredTransactions.reduce(
        (total, transaction) => total + transaction.price,
        0
      );
      const totalSoldItems = filteredTransactions.filter((transaction) => transaction.sold).length;
      const totalNotSoldItems = filteredTransactions.filter((transaction) => !transaction.sold).length;
  
   
      const chartData = [
        { label: 'Total Sale Amount', value: totalSaleAmount },
        { label: 'Total Sold Items', value: totalSoldItems },
        { label: 'Total Not Sold Items', value: totalNotSoldItems },
      ];
  
      setBarChartData(chartData);
  
      setStatistics({
        totalSaleAmount: totalSaleAmount || 0, // Ensure it's at least 0
        totalSoldItems,
        totalNotSoldItems,
      });
    };
  
    calculateStatistics();
  }, [filteredTransactions]);

  // useEffect(() => {
  //   const calculateBarChartData = () => {
  //     const priceRanges = [
  //       { label: '0-100', range: [0, 100] },
  //       { label: '101-200', range: [101, 200] },
  //       { label: '201-300', range: [201, 300] },
  //       { label: '301-400', range: [301, 400] },
  //       { label: '401-500', range: [401, 500] },
  //       { label: '501-600', range: [501, 600] },
  //       { label: '601-700', range: [601, 700] },
  //       { label: '701-800', range: [701, 800] },
  //       { label: '801-900', range: [801, 900] },
  //       { label: '901-above', range: [901, 2000] },
  //     ];

  //     const data = priceRanges.map((range) => {
  //       const count = filteredTransactions.filter(
  //         (transaction) =>
  //           transaction.price >= range.range[0] && transaction.price <= range.range[1]
  //       ).length;
  //       return { label: range.label, value: count };
  //     });

  //     setBarChartData(data);
  //   };

  //   calculateBarChartData();
  // }, [filteredTransactions]);

  useEffect(() => {
    const calculateBarChartData = () => {
      const priceCategories = [
        { label: '0-100', range: [0, 100] },
        { label: '101-200', range: [101, 200] },
        { label: '201-300', range: [201, 300] },
        { label: '301-400', range: [301, 400] },
        { label: '401-500', range: [401, 500] },
        { label: '501-600', range: [501, 600] },
        { label: '601-700', range: [601, 700] },
        { label: '701-800', range: [701, 800] },
        { label: '801-900', range: [801, 900] },
        { label: '901-above', range: [901, Infinity] },
      ];
  
      const data = priceCategories.map((category) => {
        const transactionsInCategory = filteredTransactions.filter(
          (transaction) =>
            transaction.price >= category.range[0] && transaction.price <= category.range[1]
        );
  
        const totalSaleAmount = transactionsInCategory.reduce(
          (total, transaction) => total + transaction.price,
          0
        );
  
        const totalSoldItems = transactionsInCategory.filter((transaction) => transaction.sold).length;
        const totalNotSoldItems = transactionsInCategory.filter((transaction) => !transaction.sold).length;
  
        return {
          label: category.label,
          totalSaleAmount,
          totalSoldItems,
          totalNotSoldItems,
        };
      });
  
      setBarChartData(data);
    };
  
    calculateBarChartData();
  }, [filteredTransactions]);
  

  useEffect(() => {
    const calculatePieChartData = () => {
      const categoryCounts = filteredTransactions.reduce((counts, transaction) => {
        counts[transaction.category] = (counts[transaction.category] || 0) + 1;
        return counts;
      }, {});

      const data = Object.entries(categoryCounts).map(([category, count]) => ({
        label: category,
        value: count,
      }));

      setPieChartData(data);
    };

    calculatePieChartData();
  }, [filteredTransactions]);

  const handleMonthChange = (event) => {
    setMonth(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

//   const handleDownload = async () => {
//     // Implement download functionality here (e.g., using a library like FileSaver.js)
//     console.log('Download button clicked');
//   };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" sx={{ mb: 2 }}>
        Transactions
      </Typography>
      <div style={{ display: "flex", marginBottom: 20 }}>
        <TextField
          label="Search Transactions"
          variant="outlined"
          value={search}
          onChange={handleSearchChange}
          sx={{ flexGrow: 1, mr: 2 }}
        />
        <Select value={month} onChange={handleMonthChange} sx={{ width: 150 }}>
          <MenuItem value={0}>All</MenuItem>
          {MONTHS.map((month) => (
            <MenuItem key={month.value} value={month.value}>
              {month.label}
            </MenuItem>
          ))}
        </Select>
      </div>
      {isLoading ? (
        <CircularProgress sx={{ mx: "auto", my: 4 }} />
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Image</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Sold</TableCell>
                  <TableCell>Date of Sale</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions
                    .slice((page - 1) * perPage, page * perPage)
                    .map((transaction) => {
                      const transactionDate = new Date(transaction.dateOfSale); 
                      return (
                        <TableRow key={transaction.id}>
                          <TableCell>{transaction.id}</TableCell>
                          <TableCell>{transaction.title}</TableCell>
                          <TableCell>
                            <img
                              src={transaction.image}
                              alt={transaction.title}
                              style={{ width: "100px", height: "100px" }}
                            />
                          </TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>{transaction.price.toFixed(2)}</TableCell>
                          <TableCell>{transaction.category}</TableCell>
                          <TableCell>
                            {transaction.sold ? "Yes" : "No"}
                          </TableCell>
                          <TableCell>
                            {transactionDate.toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      );
                    })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Pagination
            count={Math.ceil(filteredTransactions.length / perPage)}
            page={page}
            onChange={handlePageChange}
            sx={{ mt: 2 }}
          />
          <Grid container spacing={2} sx={{ mt: 4 }}>
            <Grid item xs={12} md={6}>
              {/* <ResponsiveContainer width="100%" height={300}>
              <h3 style={{ justifyContent: "center" }}>Bar-Chart</h3>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                  <Bar dataKey="value" fill="#82ca9d" />
                  <Bar dataKey="value" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer> */}

              <ResponsiveContainer width="100%" height={400}>
                <h3 style={{ textAlign: "center" }}>
                  Bar-Chart (Price Category)
                </h3>
                <BarChart data={barChartData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis yAxisId="left" domain={[0, "dataMax + 10"]} />{" "}
                  
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, "dataMax + 10"]}
                  />
                  <Tooltip />
                  <Legend />
                
                  <Bar
                    dataKey="totalSaleAmount"
                    yAxisId="left"
                    fill="#8884d8"
                    name="Total Sale Amount"
                  />
           
                  <Bar
                    dataKey="totalSoldItems"
                    yAxisId="right"
                    fill="#82ca9d"
                    name="Total Sold Items"
                  />
                  <Bar
                    dataKey="totalNotSoldItems"
                    yAxisId="right"
                    fill="#ffc658"
                    name="Total Not Sold Items"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Grid>
            <Grid item xs={12} md={6}>
              <ResponsiveContainer width="100%" height={300}>
                <h3 style={{ justifyContent: "center" }}>Pie-Chart</h3>
                <PieChart style={{ innerWidth: "150px" }}>
                  <Pie
                    data={pieChartData}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"][
                            index % 4
                          ]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Grid>
          </Grid>
          <Box sx={{ mt: 2, margin: "80px" }}>
            <Typography variant="h6">Statistics</Typography>
            <Typography style={{ textAlign: "left" }}>
              Total Sale Amount: $
              {statistics.totalSaleAmount
                ? statistics.totalSaleAmount.toFixed(2)
                : "0.00"}
            </Typography>
            <Typography style={{ textAlign: "left" }}>
              Total Sold Items: {statistics.totalSoldItems}
            </Typography>
            <Typography style={{ textAlign: "left" }}>
              Total Not Sold Items: {statistics.totalNotSoldItems}
            </Typography>
          </Box>
        </Box>
      )}
    </Container>
  );
}

export default TransactionTable;










// --------------------x----------------

// import React, { useState, useEffect } from 'react';
// import {
//   Container,
//   Typography,
//   Select,
//   MenuItem,
//   TextField,
//   Grid,
//   Button,
//   CircularProgress,
//   Pagination,
//   Paper,
// } from '@mui/material';
// import {
//   BarChart,
//   PieChart,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   Bar,
//   Pie,
//   Cell,
// } from 'recharts';

// const MONTHS = [
//   { value: 1, label: 'January' },
//   { value: 2, label: 'February' },
//   { value: 3, label: 'March' },
//   { value: 4, label: 'April' },
//   { value: 5, label: 'May' },
//   { value: 6, label: 'June' },
//   { value: 7, label: 'July' },
//   { value: 8, label: 'August' },
//   { value: 9, label: 'September' },
//   { value: 10, label: 'October' },
//   { value: 11, label: 'November' },
//   { value: 12, label: 'December' },
// ];

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

// function TransactionTable() {
//   const [transactions, setTransactions] = useState([]);
//   const [filteredTransactions, setFilteredTransactions] = useState([]);
//   const [month, setMonth] = useState(new Date().getMonth() + 1); // Default to current month
//   const [isLoading, setIsLoading] = useState(false);
//   const [search, setSearch] = useState('');
//   const [statistics, setStatistics] = useState({});
//   const [barChartData, setBarChartData] = useState([]);
//   const [pieChartData, setPieChartData] = useState([]);
//   const [page, setPage] = useState(1);
//   const [perPage] = useState(10);

//   useEffect(() => {
//     const fetchData = async () => {
//       setIsLoading(true);

//       try {
//         const response = await fetch('http://localhost:3001/transactions');
//         const data = await response.json();

//         setTransactions(data);
//         setFilteredTransactions(data);
//       } catch (error) {
//         console.error('Failed to fetch data:', error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   useEffect(() => {
//     const filteredData = transactions.filter(
//       (transaction) => new Date(transaction.dateOfSale).getMonth() + 1 === month || month === 0
//     );
//     setFilteredTransactions(filteredData);
//   }, [transactions, month]);

//   useEffect(() => {
//     const filteredBySearch = filteredTransactions.filter((transaction) => {
//       const searchText = search.toLowerCase();
//       return (
//         transaction.title.toLowerCase().includes(searchText) ||
//         transaction.description.toLowerCase().includes(searchText) ||
//         transaction.price.toString().includes(searchText)
//       );
//     });
//     setFilteredTransactions(filteredBySearch);
//   }, [search, filteredTransactions]);

//   useEffect(() => {
//     const calculateStatistics = () => {
//       const totalSaleAmount = filteredTransactions.reduce(
//         (total, transaction) => total + transaction.price,
//         0
//       );
//       const totalSoldItems = filteredTransactions.filter((transaction) => transaction.sold).length;
//       const totalNotSoldItems = filteredTransactions.filter((transaction) => !transaction.sold).length;

//       setStatistics({
//         totalSaleAmount,
//         totalSoldItems,
//         totalNotSoldItems,
//       });
//     };

//     calculateStatistics();
//   }, [filteredTransactions]);

//   useEffect(() => {
//     const calculateBarChartData = () => {
//       const priceRanges = [
//         { label: '0-100', range: [0, 100] },
//         { label: '101-200', range: [101, 200] },
//         { label: '201-300', range: [201, 300] },
//         { label: '301-400', range: [301, 400] },
//         { label: '401-500', range: [401, 500] },
//         { label: '501-600', range: [501, 600] },
//         { label: '601-700', range: [601, 700] },
//         { label: '701-800', range: [701, 800] },
//         { label: '801-900', range: [801, 900] },
//         { label: '901-above', range: [901, 2000] },
//       ];

//       const data = priceRanges.map((range) => {
//         const count = filteredTransactions.filter(
//           (transaction) => transaction.price >= range.range[0] && transaction.price <= range.range[1]
//         ).length;
//         return { label: range.label, value: count };
//       });

//       setBarChartData(data);
//     };

//     calculateBarChartData();
//   }, [filteredTransactions]);

//   useEffect(() => {
//     const calculatePieChartData = () => {
//       const categoryCounts = filteredTransactions.reduce((counts, transaction) => {
//         counts[transaction.category] = (counts[transaction.category] || 0) + 1;
//         return counts;
//       }, {});

//       const data = Object.entries(categoryCounts).map(([category, count]) => ({
//         label: category,
//         value: count,
//       }));

//       setPieChartData(data);
//     };

//     calculatePieChartData();
//   }, [filteredTransactions]);

//   const handleMonthChange = (event) => {
//     setMonth(event.target.value);
//   };

//   const handleSearchChange = (event) => {
//     setSearch(event.target.value);
//   };

//   const handleDownload = async () => {
//     console.log('Download button clicked');
//   };

//   const handlePageChange = (event, newPage) => {
//     setPage(newPage);
//   };

//   return (
//     <Container maxWidth="lg">
//       <Typography variant="h4" sx={{ mb: 2 }}>
//         Transactions
//       </Typography>

//       {/* Search & Filter */}
//       <Grid container spacing={2} sx={{ mb: 3 }}>
//         <Grid item xs={12} sm={4} md={3}>
//           <Select
//             fullWidth
//             value={month}
//             onChange={handleMonthChange}
//             variant="outlined"
//           >
//             <MenuItem value={0}>All</MenuItem>
//             {MONTHS.map((month) => (
//               <MenuItem key={month.value} value={month.value}>
//                 {month.label}
//               </MenuItem>
//             ))}
//           </Select>
//         </Grid>

//         <Grid item xs={12} sm={8} md={6}>
//           <TextField
//             fullWidth
//             label="Search Transactions"
//             variant="outlined"
//             value={search}
//             onChange={handleSearchChange}
//           />
//         </Grid>

//         <Grid item xs={12} md={3}>
//           <Button
//             fullWidth
//             variant="contained"
//             onClick={handleDownload}
//             disabled={isLoading}
//           >
//             Download
//           </Button>
//         </Grid>
//       </Grid>

//       {/* Loading */}
//       {isLoading ? (
//         <CircularProgress sx={{ mx: 'auto', my: 4 }} />
//       ) : (
//         <>
//           {/* Table */}
//           <Paper>
//             <Grid container spacing={2} sx={{ mt: 2 }}>
//               <Grid item xs={12} >
//                 <Grid container  spacing={1} >
//                   {/* Table Header */}
//                   <Grid item xs={12} md={1}><Typography variant="h6">ID</Typography></Grid>
//                   <Grid item xs={12} md={2}><Typography variant="h6">Title</Typography></Grid>
//                   <Grid item xs={12} md={2}><Typography variant="h6">Image</Typography></Grid>

//                   <Grid item xs={12} md={3}><Typography variant="h6">Description</Typography></Grid>
//                   <Grid item xs={12} md={1}><Typography variant="h6">Price</Typography></Grid>
//                   <Grid item xs={12} md={2}><Typography variant="h6">Category</Typography></Grid>
//                   <Grid item xs={12} md={1}><Typography variant="h6">Sold</Typography></Grid>
//                     </Grid>
//               </Grid>

//               {/* Table Body */}
//               {filteredTransactions.length > 0 ? (
//                 filteredTransactions
//                   .slice((page - 1) * perPage, page * perPage)
//                   .map((transaction) => {
//                     const transactionDate = new Date(transaction.dateOfSale);
//                     return (
//                       <Grid item xs={12} key={transaction.id}>
//                         <Grid container spacing={1} alignItems="center">
//                           <Grid item xs={12} md={1}>{transaction.id}</Grid>
//                           <Grid item xs={12} md={2}>{transaction.title}</Grid>
//                           <Grid item xs={12} md={2}>
//                             <img src={transaction.image} alt={transaction.title} style={{ width: '100px', height: '100px' }} />
//                           </Grid>
//                           <Grid item xs={12} md={3} style={{overflow:'-moz-hidden-unscrollable'}}>{transaction.description}</Grid>
//                           <Grid item xs={12} md={1}>{transaction.price}</Grid>
//                           <Grid item xs={12} md={2}>{transaction.category}</Grid>
//                           <Grid item xs={12} md={1}>{transaction.sold ? 'Yes' : 'No'}</Grid>
                        
//                         </Grid>
//                       </Grid>
//                     );
//                   })
//               ) : (
//                 <Grid item xs={12}>
//                   <Typography align="center" variant="body1">
//                     No transactions found for the selected month and search criteria.
//                   </Typography>
//                 </Grid>
//               )}
//             </Grid>
//           </Paper>

//           {/* Pagination */}
//           <Pagination
//             count={Math.ceil(filteredTransactions.length / perPage)}
//             page={page}
//             onChange={handlePageChange}
//             sx={{ mt: 3 }}
//           />

//           {/* Charts and Stats */}
//           <Grid container spacing={2} sx={{ mt: 4 }}>
//             {/* Bar Chart */}
//             <Grid item xs={12} md={6}>
//               <Typography variant="h6" gutterBottom>
//                 Bar Chart
//               </Typography>
//               <ResponsiveContainer width="100%" height={400}>
//                 <BarChart data={barChartData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="label" />
//                   <YAxis />
//                   <Tooltip />
//                   <Legend />
//                   <Bar dataKey="value" fill="#3f51b5" />
//                 </BarChart>
//               </ResponsiveContainer>
//             </Grid>

//             {/* Pie Chart */}
//             <Grid item xs={12} md={6}>
//               <Typography variant="h6" gutterBottom>
//                 Pie Chart
//               </Typography>
//               <ResponsiveContainer width="100%" height={400}>
//                 <PieChart>
//                   <Pie
//                     data={pieChartData}
//                     dataKey="value"
//                     nameKey="label"
//                     outerRadius={150}
//                     label
//                   >
//                     {pieChartData.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                     ))}
//                   </Pie>
//                   <Tooltip />
//                   <Legend />
//                 </PieChart>
//               </ResponsiveContainer>
//             </Grid>
//           </Grid>

//           {/* Statistics */}
//           <Grid container spacing={2} sx={{ mt: 4 }}>
//             <Grid item xs={12}>
//               <Typography variant="h6">Statistics:</Typography>
//               <Typography>Total Sale Amount: {statistics.totalSaleAmount}</Typography>
//               <Typography>Total Sold Items: {statistics.totalSoldItems}</Typography>
//               <Typography>Total Not Sold Items: {statistics.totalNotSoldItems}</Typography>
//             </Grid>
//           </Grid>
//         </>
//       )}
//     </Container>
//   );
// }

// export default TransactionTable;

