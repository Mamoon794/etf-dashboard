import {useState } from 'react'
import './App.css'
import Paper from '@mui/material/Paper'
import { Box } from '@mui/material'
import { Upload, InsertDriveFile } from '@mui/icons-material'
import axios from 'axios';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { EtfTimeSeriesPlot, TopHoldings, TableInfo } from './Graphs';



function App() {
    const [etfData, setEtfData] = useState<Record<string, number> | null>(null);
    const [holdingsData, setHoldingsData] = useState<Array<{ name: string; holdings: number }> | null>(null);
    const [tableData, setTableData] = useState<Array<{ name: string; weight: number; recent_price: number }> | null>(null);

    async function updateData(key: string, field: string, value: string | number) {

        const response = await axios.put('http://127.0.0.1:8000/update_data', {
            key: key,
            field: field,
            value: value
        });
        setEtfData(response.data.etf_price);
        setHoldingsData(response.data.top_holdings);
        setTableData(response.data.table_info);
    }

    async function handleFileUpload(file: File) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await axios.post('http://127.0.0.1:8000/process-csv', formData);
            console.log(response.data);
            setEtfData(response.data.etf_price);
            setHoldingsData(response.data.top_holdings);
            setTableData(response.data.table_info);
            return true;
        } catch (error: any) {
            if (error.response?.data?.detail) {
                toast.error(error.response.data.detail);
            }
            else {
                toast.error("An error occurred while processing the file.");
            }
            return false;
        }
    }

    return (
        <div>
            <ToastContainer position="top-right" autoClose={3000} />
            <h1 className='text-4xl font-bold text-center text-gray-800 p-8'>ETF Dashboard</h1>
            <CsvUpload onFileUpload={handleFileUpload} />
            {(etfData || holdingsData) && (
                <div className='mt-10 mx-10 grid grid-cols-2 gap-6'>
                    {etfData && <EtfTimeSeriesPlot data={etfData} />}
                    {holdingsData && <TopHoldings data={holdingsData} />}
                </div>
            )}
            {tableData && <TableInfo data={tableData} updateData={updateData} />}
        </div>

    )
}


function CsvUpload({ onFileUpload }: { onFileUpload?: (file: File) => Promise<boolean> }) {
    const [fileName, setFileName] = useState<String | null>(null)
    const [color, setColor] = useState<String | null>("blue")


    async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (file && onFileUpload) {
            const result = await onFileUpload(file);
            setFileName(file.name);
            console.log("Result:", result);
            setColor(result ? "green" : "red");
        }
        else if (file) {
            setFileName(file.name);
            setColor("green");
        }
    }

    return (
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
                <div className={`mt-4 p-3 rounded-md flex items-center justify-center ${color === "green" ? "bg-green-50" : "bg-red-50"}`}>
                    <InsertDriveFile className={color === "green" ? "text-green-600 mr-2" : "text-red-600 mr-2"} />
                    <span className={color === "green" ? "font-medium text-green-700" : "font-medium text-red-700"}>
                        {fileName}
                    </span>
                </div>
            )}

        </Paper>
    )
}

export default App
