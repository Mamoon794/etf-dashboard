import { useState } from 'react'
import './App.css'
import Paper from '@mui/material/Paper'
import { Box } from '@mui/material'
import { Upload, InsertDriveFile } from '@mui/icons-material'
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);



function App() {
  const [etfData, setEtfData] = useState<Record<string, number> | null>(null);
  const [holdingsData, setHoldingsData] = useState<Array<{ name: string; holdings: number }> | null>(null);
  const [tableData, setTableData] = useState<Array<{ name: string; weight: number; recent_price: number }> | null>(null);

  async function handleFileUpload(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post('http://127.0.0.1:8000/process-csv', formData);
    console.log(response.data);
    setEtfData(response.data.etf_price);
    setHoldingsData(response.data.top_holdings);
    setTableData(response.data.table_info);
    console.log("ETF Data:", response.data.top_holdings);
  }

  return (
    <div>
      <h1 className='text-6xl flex items-center justify-center p-5'>ETF Dashboard</h1>
      <CsvUpload onFileUpload={handleFileUpload} />
      {(etfData || holdingsData) && (
        <div className='mt-10 mx-10 grid grid-cols-2 gap-6'>
          {etfData && <EtfTimeSeriesPlot data={etfData} />}
          {holdingsData && <TopHoldings data={holdingsData} />}
        </div>
      )}
      {tableData && <TableInfo data={tableData} />}
    </div>
      
  )
}


function CsvUpload({ onFileUpload}: { onFileUpload?: (file: File) => void }) {
  const [fileName, setFileName] = useState<String | null>(null)


  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>){
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      if (onFileUpload) onFileUpload(file);
    }
  }

  return(
    <Paper 
      elevation={3} 
      sx={{ 
        p: 4, 
        maxWidth: 500, 
        mx: 'auto', 
        textAlign: 'center', 
        borderRadius: 2,
        fontFamily: 'sans-serif' 
      }}
    >

      <h2 className='text-2xl font-bold text-gray-800 mb-2'>
        Upload ETF File
      </h2>
      <Box
        component="label"
        sx={{
          border: '2px dashed',
          transition: 'background-color 0.2s'
        }}
        className="w-full h-48 rounded-lg flex flex-col items-center justify-center cursor-pointer bg-blue-50 hover:bg-blue-100"
        >
          <Upload className="text-blue-500 text-5xl mb-2" sx={{ fontSize: 60 }} />
          <span className="text-lg font-semibold text-blue-600">
            Click to Upload
          </span>
          
          <small className="text-gray-400 mt-1">
            Supported files: .CSV
          </small>

          <input
            type="file"
            accept=".csv"
            hidden
            onChange={handleFileChange}
          />
        </Box>

        {/* On Success */}
        {fileName && (
          <div className='mt-4 p-3 bg-green-50 rounded-md flex items-center justify-center'>
            <InsertDriveFile className="text-green-600 mr-2" />
          <span className="text-green-700 font-medium">
            {fileName}
          </span>
          </div>
        )}

    </Paper>
  )
}

// Data is {str(date): double(price)}
function EtfTimeSeriesPlot({ data}: { data: Record<string, number> }) {

  const getETFGraphOptions = () => ({
      responsive: true,
      plugins: {
        legend: { position: 'bottom' as const },
        title: { display: true, text: 'ETF Price' },
      },
    });

    const getETFData = ({ data }: { data: Record<string, number> }) => ({
      labels: Object.keys(data),
      datasets: [
        {
          label: 'ETF Price',
          data: Object.values(data),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          tension: 0.3, 
        },
      ],
    });

  return (
    <Paper elevation={3} sx={{borderRadius: 2,  p:3, height:'400px'}}
      className='w-full'
    >
      < h3 className='text-lg font-bold text-grey-700 mb-4'>ETF Time Series Plot</h3>
      <div className="relative h-[300px] w-full">
        <Line options={getETFGraphOptions()} data={getETFData({ data })} />
      </div>
    </Paper>
  )

}

function TopHoldings({ data }: { data: Array<{name: string, holdings: number}> }) {
  const getHoldingsOptions = () => ({
    responsive: true,
    plugins: {
      legend: { position: 'top' as const},
      title: { display: true, text: 'Monthly Sales' },
    },
  });

  const getHoldingsData = ({ data }: { data: Array<{name: string, holdings: number}> }) => ({
    labels: data.map(item => item.name),
    datasets: [
      {
        label: 'Sales ($)',
        data: data.map(item => item.holdings),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  });

  return (
    <Paper elevation={3} sx={{borderRadius: 2,  p:3, height:'400px'}}
      className='w-full'
    >
      < h3 className='text-lg font-bold text-grey-700 mb-4'>Top Holdings</h3>
      <div className="relative h-[300px] w-full">
        <Bar options={getHoldingsOptions()} data={getHoldingsData({ data })} />
      </div>
    </Paper>
  )

}


function TableInfo({ data }: { data: Array<{ name: string; weight: number, recent_price: number }> }) {
  return (
    <Paper elevation={3} sx={{borderRadius: 2, p:3}} className='w-full mt-6 '>
      <h3 className='text-lg font-bold text-grey-700 mb-4'>Portfolio Details</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blue-100">
              <th className="border px-4 py-2 text-left font-semibold">Name</th>
              <th className="border px-4 py-2 text-left font-semibold">Weight</th>
              <th className="border px-4 py-2 text-left font-semibold">Recent Price</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{item.name}</td>
                <td className="border px-4 py-2">{item.weight}</td>
                <td className="border px-4 py-2">${item.recent_price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Paper>
  )
}

export default App
