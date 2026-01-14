from fastapi import FastAPI, File, UploadFile

app  = FastAPI()

@app.get("/")
def root():
    return {"message": "Welcome to the API Service!"}

@app.post("/upload-csv")
def upload_csv(file: UploadFile = File(...)):

    return {"filename": file.filename, "status": "uploaded"}