import { useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import Paper from '@mui/material/Paper'
import { MenuItem, Select, FormControl, InputLabel } from '@mui/material';
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
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    zoomPlugin
);

const getETFGraphOptions = () => ({
    responsive: true,
    plugins: {
        legend: { position: 'bottom' as const },
        title: { display: true, text: 'ETF Price' },
        zoom: {
            zoom: {
                wheel: {
                    enabled: true,
                },
                pinch: {
                    enabled: true
                },
                mode: 'x' as const,
            },
            pan: {
                enabled: true,
                mode: 'x' as const,
            },
        }
    },
});

const getHoldingsOptions = () => ({
    responsive: true,
    plugins: {
        legend: { position: 'top' as const },
        title: { display: true, text: 'Top 5 Holdings by Value' },
    },
});


// Data is {str(date): double(price)}
function EtfTimeSeriesPlot({ data }: { data: Record<string, number> }) {
    const [timeRange, setTimeRange] = useState<string>('all');

    function filterDataByTimeRange(data: Record<string, number>, range: string): Record<string, number> {
        const dates = Object.keys(data).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
        let filteredDates: string[];
        let endDate = new Date('2017-04-10');

        switch (range) {
            case '1week':
                const oneWeekAgo = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
                filteredDates = dates.filter(date => new Date(date) >= oneWeekAgo);
                break;
            case '1month':
                const oneMonthAgo = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
                filteredDates = dates.filter(date => new Date(date) >= oneMonthAgo);
                break;
            case '3months':
                const threeMonthsAgo = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
                filteredDates = dates.filter(date => new Date(date) >= threeMonthsAgo);
                break;
            default:
                filteredDates = dates;
        }

        const filtered: Record<string, number> = {};
        filteredDates.forEach(date => {
            filtered[date] = data[date];
        });
        return filtered;

    }

    const filteredData = filterDataByTimeRange(data, timeRange);

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
        <Paper elevation={3} sx={{ borderRadius: 2, p: 3, height: '400px' }}
            className='w-full'
        >
            < h3 className='text-lg font-bold text-grey-700 mb-4'>ETF Time Series Plot</h3>
            <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Time Range</InputLabel>
                <Select
                    value={timeRange}
                    label="Time Range"
                    onChange={(e) => setTimeRange(e.target.value)}
                >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="1week">1 Week</MenuItem>
                    <MenuItem value="1month">1 Month</MenuItem>
                    <MenuItem value="3months">3 Months</MenuItem>
                </Select>
            </FormControl>
            <div className="relative h-[300px] w-full overflow-x-auto">
                <Line options={getETFGraphOptions()} data={getETFData({ data: filteredData })} />
            </div>
        </Paper>
    )

}

function TopHoldings({ data }: { data: Array<{ name: string, holdings: number }> }) {

    const getHoldingsData = ({ data }: { data: Array<{ name: string, holdings: number }> }) => ({
        labels: data.map(item => item.name),
        datasets: [
            {
                label: 'Value ($)',
                data: data.map(item => item.holdings),
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
        ],
    });

    return (
        <Paper elevation={3} sx={{ borderRadius: 2, p: 3, height: '400px' }}
            className='w-full'
        >
            < h3 className='text-lg font-bold text-grey-700 mb-4'>Top Holdings</h3>
            <div className="relative h-[300px] w-full">
                <Bar options={getHoldingsOptions()} data={getHoldingsData({ data })} />
            </div>
        </Paper>
    )

}


type Row = { name: string; weight: number; recent_price: number };

function TableInfo({ data, updateData }: { data: Array<Row>, updateData: (rowIndex: string, field: keyof Row, value: string | number) => Promise<void> }) {
    const [tableData, setTableData] = useState<Row[]>(data);
    const [originalData, setOriginalData] = useState<Row[]>(JSON.parse(JSON.stringify(data)));
    const [whichSort, setWhichSort] = useState<{ key: keyof Row | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });


    // Function to handle editing of a cell. It allows string input because user may type non-numeric values. Like (.)
    function handleEditing(rowIndex: number, field: keyof Row, value: string) {
        const updatedData = [...tableData];

        (updatedData[rowIndex] as any)[field] = value
       
        setTableData(updatedData);
    }

    // Function to handle when user leaves the input field (onBlur). It converts to number, handles wrong number inputs and updates the charts data
    async function handleBlur(rowIndex: number, field: keyof Row) {
        const newValue = tableData[rowIndex][field];
        const oldValue = originalData[rowIndex][field];

        let numericValue = parseFloat(newValue.toString());

        // If the input is not a valid number, revert to old value
        if (isNaN(numericValue)) {
            numericValue = parseFloat(oldValue.toString());
        }
        const updatedData = [...tableData];
        (updatedData[rowIndex] as any)[field] = numericValue;
        setTableData(updatedData); 


        // Update the data for all charts
        if (updateData){
            if (numericValue === oldValue) return;

            let key = tableData[rowIndex].name;
            await updateData(key, field, tableData[rowIndex][field]);

            const updatedOriginal = [...originalData];
            (updatedOriginal[rowIndex] as any)[field] = numericValue;
            setOriginalData(updatedOriginal);
        }
    }

    // Function to handle sorting
    function handleSort (key: keyof Row) {
        let direction: 'asc' | 'desc' = 'asc';
        if (whichSort.key === key && whichSort.direction === 'asc') {
            direction = 'desc';
        }
        setWhichSort({ key, direction });

        const sortedData = [...tableData].sort((a, b) => {
            if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
            if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
            return 0;
        });
        setTableData(sortedData);
    };

    function getSortIcon (key: keyof Row) {
        if (whichSort.key !== key) return '⇅';
        return whichSort.direction === 'asc' ? '↑' : '↓';
    };

    return (
        <Paper elevation={3} sx={{ borderRadius: 2, p: 3 }} className='w-full mt-6 '>
            <h3 className='text-lg font-bold text-grey-700 mb-4'>Table Information</h3>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-blue-100">
                            <th className="cursor-pointer hover:bg-blue-200" onClick={() => handleSort('name')}>
                                Name {getSortIcon('name')}
                            </th>
                            <th className="cursor-pointer hover:bg-blue-200" onClick={() => handleSort('weight')}>
                                Weight {getSortIcon('weight')}
                            </th>
                            <th className="cursor-pointer hover:bg-blue-200" onClick={() => handleSort('recent_price')}>
                                Recent Price {getSortIcon('recent_price')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td>
                                    {item.name}
                                </td>
                                <td>
                                    <input type="text" value={item.weight}
                                    onChange={(e) => handleEditing(index, "weight", e.target.value)} 
                                    onBlur={()=> handleBlur(index, "weight")}
                                    className="tableEdit" />
                                </td>
                                <td>
                                    <div className="flex items-center">
                                        $
                                        <input 
                                            type="text" 
                                            value={item.recent_price} 
                                            onChange={(e) => handleEditing(index, "recent_price", e.target.value)} 
                                            onBlur={() => handleBlur(index, "recent_price")}
                                            className="tableEdit" 
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Paper>
    )
}


export { EtfTimeSeriesPlot, TopHoldings, TableInfo };