from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

# Test updating data without prior upload. I mean it can't happen in the frontend but just in case.
def test_update_without_upload():
    response = client.put("/update_data", json={
        "key": "C",
        "field": "weight",
        "value": 200.0
    })

    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "No uploaded file found. Please upload a CSV file first."


# Test uploading a CSV with missing columns
def test_missing_columns_csv():
    csv_content = open("dummyData/missing_columns.csv", "r")
    csv_content = csv_content.read()

    files = {'file': ('test_etf.csv', csv_content, 'text/csv')}
    response = client.post("/process-csv", files=files)
    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "Missing columns in uploaded file: weight"


# Test uploading an empty CSV file
def test_empty_csv():
    csv_content = open("dummyData/empty.csv", "r")
    csv_content = csv_content.read()

    files = {'file': ('test_etf.csv', csv_content, 'text/csv')}
    response = client.post("/process-csv", files=files)
    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "Uploaded file is empty or invalid CSV."


# Test uploading a good CSV file and then updating data
def test_good_csv():
    csv_content = open("dummyData/goodcsv.csv", "r")
    csv_content = csv_content.read()

    files = {'file': ('test_etf.csv', csv_content, 'text/csv')}
    
    response = client.post("/process-csv", files=files)
    

    assert response.status_code == 200
    data = response.json()
    
    assert data["filename"] == "test_etf.csv"
    assert "table_info" in data
    assert "etf_price" in data
    assert "top_holdings" in data
    assert data["top_holdings"] == [{"name": "C", "holdings": 159.5}, {"name": "B", "holdings": 71.66}, {"name": "D", "holdings": 14.17}, {"name": "A", "holdings": 13.51}, {"name": "F", "holdings": 6.33}]

    # Check if specific keys and values exist in etf_price
    assert data["etf_price"]["2017-01-01"] == 343.72
    assert data["etf_price"]["2017-01-02"] == 356.97
    assert data["etf_price"]["2017-04-09"] == 272.19
    assert data["etf_price"]["2017-04-10"] == 270.88

    assert data["table_info"] == [{'name': 'A', 'weight': 0.5, 'recent_price': 27.03}, {'name': 'B', 'weight': 12.5, 'recent_price': 5.73}, {'name': 'C', 'weight': 8.0, 'recent_price': 19.94}, {'name': 'D', 'weight': 4.6, 'recent_price': 3.08}, {'name': 'E', 'weight': 0.11, 'recent_price': 51.85}, {'name': 'F', 'weight': 0.129, 'recent_price': 49.1}]


    # Now test updating weight
    update_response = client.put("/update_data", json={
        "key": "C",
        "field": "weight",
        "value": 200.0
    })

    assert update_response.status_code == 200
    update_data = update_response.json()

    assert "table_info" in update_data
    assert "etf_price" in update_data
    assert "top_holdings" in update_data
    assert update_data["top_holdings"] == [{"name": "C", "holdings": 3987.4}, {"name": "B", "holdings": 71.66}, {"name": "D", "holdings": 14.17}, {"name": "A", "holdings": 13.51}, {"name": "F", "holdings": 6.33}]
    
    assert update_data["etf_price"]["2017-01-01"] == 6289.96
    assert update_data["etf_price"]["2017-01-02"] == 6665.32
    assert update_data["etf_price"]["2017-04-09"] == 4035.39
    assert update_data["etf_price"]["2017-04-10"] == 4098.78

    assert update_data["table_info"]== [{'name': 'A', 'weight': 0.5, 'recent_price': 27.03}, {'name': 'B', 'weight': 12.5, 'recent_price': 5.73}, {'name': 'C', 'weight': 200.0, 'recent_price': 19.94}, {'name': 'D', 'weight': 4.6, 'recent_price': 3.08}, {'name': 'E', 'weight': 0.11, 'recent_price': 51.85}, {'name': 'F', 'weight': 0.129, 'recent_price': 49.1}]


    # Now test updating recent_price. 
    update_response_price = client.put("/update_data", json={
        "key": "C",
        "field": "recent_price",
        "value": 25.0
    })
    assert update_response_price.status_code == 200
    update_data_price = update_response_price.json()

    assert "table_info" in update_data_price
    assert "etf_price" in update_data_price
    assert "top_holdings" in update_data_price


    assert update_data_price["top_holdings"] == [{'name': 'C', 'holdings': 5000.0}, {'name': 'B', 'holdings': 71.66}, {'name': 'D', 'holdings': 14.17}, {'name': 'A', 'holdings': 13.51}, {'name': 'F', 'holdings': 6.33}]
    assert update_data_price["etf_price"]["2017-01-01"] == 6289.96
    assert update_data_price["etf_price"]["2017-01-02"] == 6665.32
    assert update_data_price["etf_price"]["2017-04-09"] == 4035.39
    assert update_data_price["etf_price"]["2017-04-10"] == 5111.38

    assert update_data_price["table_info"] == [{'name': 'A', 'weight': 0.5, 'recent_price': 27.03}, {'name': 'B', 'weight': 12.5, 'recent_price': 5.73}, {'name': 'C', 'weight': 200.0, 'recent_price': 25.0}, {'name': 'D', 'weight': 4.6, 'recent_price': 3.08}, {'name': 'E', 'weight': 0.11, 'recent_price': 51.85}, {'name': 'F', 'weight': 0.129, 'recent_price': 49.1}]

    # The update previously affected the prices.csv thus changes need to be reverted
    update_response_price = client.put("/update_data", json={
        "key": "C",
        "field": "recent_price",
        "value": 19.937
    })