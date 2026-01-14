import { useState } from 'react'
import './App.css'
import Paper from '@mui/material/Paper'
import { Box } from '@mui/material'
import { Upload, InsertDriveFile } from '@mui/icons-material'
import axios from 'axios';

function App() {

  function handleFileUpload(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    axios.post('http://127.0.0.1:8000/upload-csv', formData);
  }

  return (
    <div>
      <h1 className='text-6xl flex items-center justify-center p-5'>ETF Dashboard</h1>
      <CsvUpload onFileUpload={handleFileUpload} />
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

export default App
