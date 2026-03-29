import os
import uuid
import subprocess
import shutil
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from gemini_service import GeminiService
import aiofiles
from pypdf import PdfReader, PdfWriter
from docxcompose.composer import Composer
from docx import Document as DocxDocument
import anyio
import io
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

app = FastAPI()

# Enable CORS for React frontend (multi-port support)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store for generated files (simplified)
# Use a temp directory for production
UPLOAD_DIR = "temp_uploads"
OUTPUT_DIR = "temp_outputs"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

BATCH_SIZE = 5

@app.get("/api/rules")
async def get_rules():
    try:
        # Use absolute path relative to the backend's parent directory
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        rules_path = os.path.join(base_dir, 'translation_rules.md')
        with open(rules_path, 'r', encoding='utf-8') as f:
            return {"rules": f.read()}
    except FileNotFoundError:
        return {"rules": "# Translation Rules\nAdd your rules here."}

@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    file_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename)[1].lower()
    input_path = os.path.join(UPLOAD_DIR, f"{file_id}{ext}")
    async with aiofiles.open(input_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    return {"file_id": file_id}

@app.post("/api/process")
async def process_document(
    target_language: str = Form(...),
    api_key: str = Form(""),
    file_id: str = Form(...),
    translation_rules: Optional[str] = Form(None),
    model: str = Form("gemini-2.5-flash")
):
    try:
        # Use hardcoded key if provided key is empty/dummy
        print(f"Initializing DOCX/OCR process with model: {model}")
        active_key = api_key if (api_key and "DUMMY" not in api_key.upper()) else GEMINI_API_KEY
        if not active_key:
            raise HTTPException(status_code=400, detail="Gemini API Key is missing.")
        # Find the uploaded file
        input_path = None
        for f in os.listdir(UPLOAD_DIR):
            if f.startswith(file_id) and not "_batch_" in f:
                input_path = os.path.join(UPLOAD_DIR, f)
                break
        
        if not input_path:
            raise HTTPException(status_code=404, detail="File not found. Please upload first.")

        ext = os.path.splitext(input_path)[1].lower()

        # Batch Processing Logic for PDFs
        batches = []
        if ext == '.pdf':
            reader = PdfReader(input_path)
            total_pages = len(reader.pages)
            if total_pages > BATCH_SIZE:
                for i in range(0, total_pages, BATCH_SIZE):
                    writer = PdfWriter()
                    end_page = min(i + BATCH_SIZE, total_pages)
                    # Extract pages for this batch
                    for page_num in range(i, end_page):
                        writer.add_page(reader.pages[page_num])
                    
                    batch_filename = f"{file_id}_batch_{i//BATCH_SIZE}{ext}"
                    batch_path = os.path.join(UPLOAD_DIR, batch_filename)
                    with open(batch_path, "wb") as f_out:
                        writer.write(f_out)
                    batches.append(batch_path)
            else:
                batches.append(input_path)
        else:
            batches.append(input_path)

        # Process batches sequentially
        aggregated_original = []
        aggregated_translated = []
        partial_docs = []
        
        service = GeminiService(active_key, model_id=model)
        python_exe = os.path.join(os.getcwd(), "venv", "Scripts", "python.exe")
        
        for idx, batch_path in enumerate(batches):
            print(f"Processing batch {idx+1}/{len(batches)}...")
            result = service.process_document(batch_path, target_language, translation_rules)
            
            aggregated_original.append(result.get("original_text", ""))
            aggregated_translated.append(result.get("translated_text", ""))
            
            python_code = result.get("python_code", "")
            if not python_code:
                raise HTTPException(status_code=500, detail=f"Gemini failed at batch {idx+1}")

            # Execute and save partial docx
            exec_dir = os.path.join(OUTPUT_DIR, f"{file_id}_batch_{idx}")
            os.makedirs(exec_dir, exist_ok=True)
            script_path = os.path.join(exec_dir, "gen_docx.py")
            with open(script_path, "w", encoding="utf-8") as f:
                f.write(python_code)
            
            # Execute and save partial docx in a separate thread
            def run_docx_script():
                return subprocess.run(
                    [python_exe, "gen_docx.py"],
                    cwd=exec_dir,
                    capture_output=True,
                    text=True
                )
            
            process = await anyio.to_thread.run_sync(run_docx_script)
            
            if process.returncode != 0:
                raise HTTPException(status_code=500, detail=f"Docx error at batch {idx+1}: {process.stderr}")
                
            gen_file = os.path.join(exec_dir, "output.docx")
            if os.path.exists(gen_file):
                partial_docs.append(gen_file)
            
            # Clean up batch file if it was a temp split
            if batch_path != input_path:
                try: os.remove(batch_path)
                except: pass

        # Merge partial documents
        if not partial_docs:
            raise HTTPException(status_code=500, detail="No documents were generated.")

        final_output_path = os.path.join(OUTPUT_DIR, f"{file_id}.docx")
        
        # Start master document with the first partial doc
        master = DocxDocument(partial_docs[0])
        composer = Composer(master)
        
        # Append subsequent partial docs
        for i in range(1, len(partial_docs)):
            doc_to_add = DocxDocument(partial_docs[i])
            composer.append(doc_to_add)
            
        composer.save(final_output_path)

        # Cleanup exec dirs
        for idx in range(len(partial_docs)):
            try: shutil.rmtree(os.path.join(OUTPUT_DIR, f"{file_id}_batch_{idx}"), ignore_errors=True)
            except: pass

        return {
            "original_text": "\n\n".join(aggregated_original),
            "translated_text": "\n\n".join(aggregated_translated),
            "file_id": file_id,
            "batches": len(batches)
        }
        
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/download/{file_id}")
async def download_file(file_id: str):
    path = os.path.join(OUTPUT_DIR, f"{file_id}.docx")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found.")
    return FileResponse(path, filename="translated_document.docx")

@app.post("/api/process-html")
async def process_html_document(
    target_language: str = Form(...),
    api_key: str = Form(""),
    file_id: str = Form(...),
    translation_rules: Optional[str] = Form(None),
    model: str = Form("gemini-2.5-flash")
):
    # High-Fidelity PDF processing is temporarily disabled by user request.
    raise HTTPException(status_code=403, detail="High-Fidelity PDF rendering is currently disabled.")
    
    # Original logic preserved below for future reactivation:
    """
    try:
        # ... logic ...
    except Exception as e:
        # ...
    """

@app.get("/api/download-pdf/{file_id}")
async def download_pdf(file_id: str):
    path = os.path.join(OUTPUT_DIR, f"{file_id}.pdf")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="PDF not found. Please wait for processing.")
    return FileResponse(path, filename="translated_document.pdf", media_type="application/pdf")

# Mount the production build (dist) at the root
# Note: This is done LAST so the API routes take precedence
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
dist_path = os.path.join(base_dir, "frontend", "dist")

# Ensure the directory exists before mounting to avoid crash
if os.path.exists(dist_path):
    app.mount("/", StaticFiles(directory=dist_path, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 3001))
    host = os.getenv("HOST", "0.0.0.0")
    env = os.getenv("ENV", "production")
    # Enable reload ONLY if ENV is 'development'
    is_dev = env.lower() == "development"
    uvicorn.run("main:app", host=host, port=port, reload=is_dev)
