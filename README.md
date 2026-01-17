# ETF Historical Analyzer Dashboard

A single-page web application that allows the user to upload ETF Files to view historical prices and analyze its top holdings. The application calculates ETF price history based on the weights configurations of the uploaded file.

## Features

* **CSV Upload:** Interface to upload ETF configuration files (`name, weight`).
* **Time Series Plot:** Visualizes the calculated historical price of the ETF using a weighted sum algorithm and shows in a zoomable line chart. Also allows filtering by time ranges (1 week, 1 month, 3 months, All).
* **Top Holdings:** Bar chart displaying the top 5 constituents by market value.
* **Data Table:** Detailed view of all constituents, weights, and most recent close prices. Shows in an interactive table.
* **Real-time Validation:** Toast notifications for upload status and error handling.

## Tech Stack

### Frontend

* **Framework:** React (Vite) + TypeScript
* **Styling:** Tailwind CSS (Layouts) + Material UI (Component wrappers/Paper)
* **Charting:** Chart.js + `react-chartjs-2` (Chosen for performance and simplicity)
* **State/Feedback:** React Toastify (Notifications), Axios (API requests)

### Backend

* **Framework:** FastAPI (Python) - Chosen for speed and simplicity.
* **Data Processing:** Pandas - Used for vectorized calculation of weighted sums and ease of data manipulation.
* **Unit Testing:** Pytest + `TestClient`

## Architecture & Design Choices

### 1. Python for Data Processing

The project required heavy data manipulation, especially for etf price calculation. Python (Pandas) was chosen over Node.js for the backend because of pandas' capability to handle large datasets efficiently. 

## Assumptions & Constraints


2. **Static Weights:** The ETF weights are treated as constant over the entire history.
3. **Market Data:** The backend expects a file named `prices.csv` to exist in the root directory containing historical data indexed by Date.
4. **Interactive Table:** The interactive table allows for modifying weights and recent prices, but it is assumed that "name" fields are not editable and are unique to maintain data integrity.
5. **Uploaded CSV Storage:** The uploaded CSV files are not stored in a database as there was no requirement for persistent storage. Each upload is stored in-memory for that session.

## Installation & Setup

### Prerequisites

### 1. Backend Setup

```bash
# Navigate to backend directory
cd apiService


python -m venv venv

# On Mac/Linux
source venv/bin/activate  

# On Windows
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload

```

The backend will start at `http://127.0.0.1:8000`

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd dashboard

# Install dependencies
npm install

# Start the development server
npm run dev

```

The app will be available at `http://localhost:5173`

## 🧪 Running Tests

Unit tests are included for the backend to verify file upload handling and mathematical accuracy.

```bash
cd apiService
pytest unitTests.py

```


## Future Improvements

* **Dynamic Rebalancing:** Support for ETFs where weights change over time.
* **Database Implementation:** Store the uploaded files and calculated results for faster retrieval.
* **Export:** Ability to download the calculated time series as a CSV.