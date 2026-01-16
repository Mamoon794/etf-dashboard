from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from helper import process_data

app  = FastAPI()

# Since it wasn't specified to use a database, I'm using a global variable to store the uploaded file data for updates.
global_uploaded_file = {}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Welcome to the API Service!"}

@app.post("/process-csv")
def process_csv(file: UploadFile = File(...)):

    # First read the uploaded CSV file and the prices CSV file
    try:
        uploaded_file = pd.read_csv(file.file)
    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="Uploaded file is empty or invalid CSV.")
    
    uploaded_file = uploaded_file.dropna()


    # Error handling for missing columns
    required_columns = ['name', 'weight']
    missing_columns = [col for col in required_columns if col not in uploaded_file.columns]
    if missing_columns:
        raise HTTPException(status_code=400, detail=f"Missing columns in uploaded file: {', '.join(missing_columns)}")


    result = process_data(uploaded_file)
    if 'error' in result:
        raise HTTPException(status_code=400, detail=result['error'])
    
    global_uploaded_file['file'] = uploaded_file
    table_info = result['table_info']
    holdings = result['top_holdings']
    etf_price = result['etf_price']

    return {"filename": file.filename, "table_info": table_info, "top_holdings": holdings, "etf_price": etf_price}



@app.put("/update_data")
def update_data(request: dict):
    key, field, value = request['key'], request['field'], request['value']
    prices = pd.read_csv("prices.csv", index_col=0, parse_dates=True)
    prices = prices.sort_index(ascending=True)
    uploaded_file = global_uploaded_file.get('file')

    if uploaded_file is None:
        raise HTTPException(status_code=400, detail="No uploaded file found. Please upload a CSV file first.")

    if field == "recent_price":
        prices.at[prices.index[-1], key] = value
        prices.to_csv("prices.csv")
    else:
        row_index = uploaded_file.index[uploaded_file['name'] == key].tolist()[0]
        uploaded_file.at[row_index, field] = value


    result = process_data(uploaded_file)
    if 'error' in result:
        raise HTTPException(status_code=400, detail=result['error'])
    
    global_uploaded_file['file'] = uploaded_file

    table_info = result['table_info']
    holdings = result['top_holdings']
    etf_price = result['etf_price']

    return {"table_info": table_info, "top_holdings": holdings, "etf_price": etf_price}


