import pandas as pd

def process_data(uploaded_file: pd.DataFrame):

    try:
        prices = pd.read_csv("prices.csv", index_col=0, parse_dates=True)
    except pd.errors.EmptyDataError:
        return {"error": "Prices CSV file is empty or invalid."}
    prices = prices.sort_index(ascending=True)

    # Then filter the prices to only have the names that are also in the uploaded file
    names = uploaded_file['name'].tolist()
    filtered_prices = prices[names]

    # Get the most recent prices
    recent_prices = filtered_prices.tail(1).to_dict(orient='records')

    # Convert uploaded weights to a list of dictionaries
    uploaded_weights = uploaded_file.to_dict(orient='records')
    uploaded_weights = {item['name']: item['weight'] for item in uploaded_weights} # For consistency.


    # Calculate holdings and prepare information needed for the table
    table_info = []
    holdings = []
    for name, weight in uploaded_weights.items():
        holdings.append({
            "name": name,
            "holdings": round(weight * recent_prices[0][name], 2)
        })
        
        table_info.append({
            "name": name,
            "weight": weight,
            "recent_price": round(recent_prices[0][name], 2)
        })


    holdings = sorted(holdings, key=lambda x: x["holdings"], reverse=True)[:5]
    table_info = sorted(table_info, key=lambda x: x["name"])

    # Calculate price of etf.
    for column in filtered_prices.columns:
        filtered_prices.loc[:, column] = filtered_prices[column] * uploaded_weights[column]

    etf_price = filtered_prices.sum(axis=1) 
    etf_price = round(etf_price, 2).to_dict()
    etf_price = {str(date.date()): price for date, price in etf_price.items()}
   
    return {"table_info": table_info, "top_holdings": holdings, "etf_price": etf_price}