import os
import json
from google import genai
from google.genai import types
from typing import Optional

from pydantic import BaseModel

class DocxResponse(BaseModel):
    original_text: str
    translated_text: str
    python_code: str

class HtmlResponse(BaseModel):
    html: str
    transcription: str
    translation: str

class GeminiService:
    def __init__(self, api_key: str, model_id: str = 'gemini-2.5-flash'):
        # Using the state-of-the-art Gemini 2.5/3 models (March 2026)
        self.client = genai.Client(api_key=api_key)
        self.model_id = model_id
        
    def process_document(self, file_path: str, target_language: str, rules: Optional[str] = None) -> dict:
        # Load the prompt template
        with open('gemini_prompt.txt', 'r', encoding='utf-8') as f:
            prompt_template = f.read()
            
        if not rules:
            try:
                base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                rules_path = os.path.join(base_dir, 'translation_rules.md')
                with open(rules_path, 'r', encoding='utf-8') as f:
                    rules = f.read()
            except FileNotFoundError:
                rules = "Follow standard translation practices."
            
        from datetime import datetime
        today = datetime.now().strftime("%d/%m/%y")
        
        prompt = prompt_template.replace('[GREEK/ENGLISH]', target_language)
        prompt = prompt.replace('[RULES_PLACEHOLDER]', rules)
        prompt = prompt.replace('[CURRENT_DATE]', today)
        
        with open(file_path, "rb") as f:
            file_bytes = f.read()
            
        mime_type = "application/pdf" if file_path.lower().endswith(".pdf") else "image/png"
        
        response = self.client.models.generate_content(
            model=self.model_id,
            contents=[
                prompt,
                types.Part.from_bytes(data=file_bytes, mime_type=mime_type)
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=DocxResponse,
                max_output_tokens=64000
            )
        )
        
        try:
            if response.parsed:
                return response.parsed.model_dump()
            
            # Robust fallback: Try to extract JSON from markdown if present
            text = response.text.strip()
            if text.startswith("```json"):
                text = text.split("```json")[1].split("```")[0].strip()
            elif text.startswith("```"):
                text = text.split("```")[1].split("```")[0].strip()
                
            try:
                raw_json = json.loads(text)
                if isinstance(raw_json, dict):
                    return raw_json
                return {"python_code": "", "original_text": response.text, "translated_text": ""}
            except:
                return {"python_code": "", "original_text": response.text, "translated_text": ""}
                
        except Exception as e:
            print(f"CRITICAL: Failed to parse Gemini Docx response. Fallback initiated.")
            return {"python_code": "", "original_text": response.text, "translated_text": ""}

    def process_html(self, file_paths: list[str], target_language: str, rules: Optional[str] = None) -> dict:
        # Load the HTML prompt template
        with open('gemini_html_prompt.txt', 'r', encoding='utf-8') as f:
            prompt_template = f.read()
            
        if not rules:
            try:
                base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                rules_path = os.path.join(base_dir, 'translation_rules.md')
                with open(rules_path, 'r', encoding='utf-8') as f:
                    rules = f.read()
            except FileNotFoundError:
                rules = "Follow standard translation practices."
        
        from datetime import datetime
        today = datetime.now().strftime("%d/%m/%y")
        
        prompt = prompt_template.replace('[GREEK/ENGLISH]', target_language)
        prompt = prompt.replace('[RULES_PLACEHOLDER]', rules)
        prompt = prompt.replace('[CURRENT_DATE]', today)
        
        parts = [prompt]
        for file_path in file_paths:
            with open(file_path, "rb") as f:
                file_bytes = f.read()
            mime_type = "application/pdf" if file_path.lower().endswith(".pdf") else "image/png"
            parts.append(types.Part.from_bytes(data=file_bytes, mime_type=mime_type))
            
        response = self.client.models.generate_content(
            model=self.model_id,
            contents=parts,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=HtmlResponse,
                max_output_tokens=64000
            )
        )
        
        try:
            if response.parsed:
                return response.parsed.model_dump()
            
            # Robust fallback: Try to extract JSON from markdown if present
            text = response.text.strip()
            if text.startswith("```json"):
                text = text.split("```json")[1].split("```")[0].strip()
            elif text.startswith("```"):
                text = text.split("```")[1].split("```")[0].strip()
                
            try:
                raw_json = json.loads(text)
                if isinstance(raw_json, dict):
                    return raw_json
                return {"html": text, "transcription": "", "translation": ""}
            except:
                return {"html": response.text, "transcription": "", "translation": ""}
                
        except Exception as e:
            print(f"CRITICAL: Failed to parse Gemini HTML response. Fallback initiated.")
            return {"html": response.text, "transcription": "", "translation": ""}
