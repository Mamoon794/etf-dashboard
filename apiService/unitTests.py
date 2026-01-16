from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_upload_csv():
    csv_content = b"name,weight\nA,0.5\nB,12.5\nC,8.0\nD,4.6\nE,0.11\nF,0.129"
    
    files = {'file': ('test_etf.csv', csv_content, 'text/csv')}
    
    response = client.post("/process-csv", files=files)
    

    assert response.status_code == 200
    data = response.json()
    
    assert data["filename"] == "test_etf.csv"
    assert "table_info" in data
    assert "etf_price" in data
    assert "top_holdings" in data
    assert data["top_holdings"] == [{"name": "C", "holdings": 159.5}, {"name": "B", "holdings": 71.66}, {"name": "D", "holdings": 14.17}, {"name": "A", "holdings": 13.51}, {"name": "F", "holdings": 6.33}]
    print(data["etf_price"])
    assert data["etf_price"] == {"2017-01-01": 343.72, "2017-01-02": 356.97, "2017-04-09": 272.19, "2017-04-10": 270.88}