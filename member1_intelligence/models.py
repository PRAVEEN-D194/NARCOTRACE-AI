from pydantic import BaseModel, Field
from typing import List, Optional

class LanguageProcessingModel(BaseModel):
    detected_languages: List[str] = Field(..., description="List of detected languages/scripts (e.g., Tanglish, English, Hindi)")
    is_code_mixed: bool = Field(..., description="True if text features multiple languages/scripts mixed together")
    transliterated_text: str = Field(..., description="Standardized native scripts or phonetic equivalents")
    normalized_text: str = Field(..., description="Text with typos, leetspeak, slang, emojis, and obfuscations cleaned")
    translated_english: str = Field(..., description="Clean standard English translation retaining domain semantics")

class ContextualAnalysisModel(BaseModel):
    indic_context_score: float = Field(..., description="Score 0.00 to 1.00 indicating Indic language/cultural context score")
    darkweb_intent_detected: bool = Field(..., description="True if dark-web drug trade/procurement intent is detected")
    intent_summary: str = Field(..., description="Summary of underlying user intent")

class DrugClassificationModel(BaseModel):
    is_drug_related: bool = Field(..., description="Binary flag indicating if text is drug-related")
    confidence_score: float = Field(..., description="Confidence score from 0.00 to 1.00")
    primary_drug_category: Optional[str] = Field(None, description="Primary drug category: Synthetic Stimulants, Opioids, Cannabis Derivatives, Prescription Narcotics, etc.")
    risk_level: str = Field(..., description="Risk level: CRITICAL | HIGH | MEDIUM | LOW | NONE")

class ExtractedEntitiesModel(BaseModel):
    usernames: List[str] = Field(default_factory=list, description="Handles, darknet vendor names")
    drug_names: List[str] = Field(default_factory=list, description="Chemical/generic drug names")
    drug_aliases: List[str] = Field(default_factory=list, description="Street slang, emojis, or obfuscated terms")
    platform_identifiers: List[str] = Field(default_factory=list, description="Telegram channels, Session IDs, Signal, Onion URLs, Wickr")
    financial_identifiers: List[str] = Field(default_factory=list, description="Crypto wallet addresses, UPI IDs, payment handles")
    quantities_and_pricing: List[str] = Field(default_factory=list, description="Quantities, weights, prices, currencies")
    locations: List[str] = Field(default_factory=list, description="Drop zones, cities, states, landmarks")

class Member1PipelineOutput(BaseModel):
    pipeline_status: str = Field("SUCCESS", description="Status of pipeline execution")
    raw_input: str = Field(..., description="Original raw unstructured dark-web text input")
    language_processing: LanguageProcessingModel
    contextual_analysis: ContextualAnalysisModel
    drug_classification: DrugClassificationModel
    extracted_entities: ExtractedEntitiesModel

