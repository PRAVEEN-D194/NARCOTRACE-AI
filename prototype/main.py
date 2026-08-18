from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from pathlib import Path
from typing import List
from difflib import SequenceMatcher
import json
import re


# ============================================================
# NARCO-TRACE AI
# MEMBER 2 MODULE
# Entity Resolution + Behavioral + Financial Correlation
# ============================================================


app = FastAPI(
    title="NARCO-TRACE AI - Member 2",
    description="Cross-platform Entity and Financial Correlation Module",
    version="1.0.0"
)


# ============================================================
# STATIC FILES
# ============================================================

app.mount(
    "/static",
    StaticFiles(directory=str(Path(__file__).resolve().parent / "static")),
    name="static"
)


# ============================================================
# PATH CONFIGURATION
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

SAMPLE_FILE = BASE_DIR / "data" / "sample_case.json"

STATIC_DIR = BASE_DIR / "static"


# ============================================================
# DATA MODELS
# ============================================================

class Entity(BaseModel):

    id: str = ""

    platform: str = ""

    username: str = ""

    text: str = ""

    activity_hours: List[int] = Field(default_factory=list)

    activity_days: List[str] = Field(default_factory=list)

    post_count: int = 0

    wallets: List[str] = Field(default_factory=list)


class Transaction(BaseModel):

    from_wallet: str

    to_wallet: str

    amount: float

    timestamp: str


class AnalysisRequest(BaseModel):

    entity_a: Entity

    entity_b: Entity

    transactions: List[Transaction] = Field(
        default_factory=list
    )


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def normalize_name(name: str) -> str:
    """
    Normalize usernames for comparison.
    Example:
    DarkWolf23
    dark_wolf_23
    dark-wolf23

    All become similar normalized forms.
    """

    if not name:
        return ""

    return re.sub(
        r"[^a-z0-9]",
        "",
        name.lower()
    )


def username_similarity(
    a: str,
    b: str
) -> float:
    """
    Compare usernames using Python's built-in
    SequenceMatcher.
    """

    normalized_a = normalize_name(a)

    normalized_b = normalize_name(b)

    if not normalized_a or not normalized_b:
        return 0.0

    similarity = SequenceMatcher(
        None,
        normalized_a,
        normalized_b
    ).ratio()

    return round(
        similarity * 100,
        1
    )


def tokenize_text(text: str) -> set:
    """
    Convert text into normalized word tokens.
    """

    if not text:
        return set()

    words = re.findall(
        r"[a-zA-Z0-9]+",
        text.lower()
    )

    return set(words)


def semantic_similarity(
    text_a: str,
    text_b: str
) -> float:
    """
    Simple prototype semantic/text similarity
    using common word overlap.
    """

    tokens_a = tokenize_text(text_a)

    tokens_b = tokenize_text(text_b)

    if not tokens_a or not tokens_b:
        return 0.0

    intersection = tokens_a.intersection(
        tokens_b
    )

    union = tokens_a.union(
        tokens_b
    )

    if not union:
        return 0.0

    score = (
        len(intersection)
        / len(union)
    ) * 100

    return round(score, 1)


def list_overlap_score(
    list_a: list,
    list_b: list
) -> float:
    """
    Calculate overlap between two lists.
    """

    set_a = set(list_a)

    set_b = set(list_b)

    if not set_a or not set_b:
        return 0.0

    intersection = set_a.intersection(
        set_b
    )

    union = set_a.union(
        set_b
    )

    return round(
        (len(intersection) / len(union)) * 100,
        1
    )


def behavior_similarity(
    entity_a: Entity,
    entity_b: Entity
) -> float:
    """
    Compare activity patterns and post counts.
    """

    hours_score = list_overlap_score(
        entity_a.activity_hours,
        entity_b.activity_hours
    )

    days_score = list_overlap_score(
        entity_a.activity_days,
        entity_b.activity_days
    )

    max_posts = max(
        entity_a.post_count,
        entity_b.post_count,
        1
    )

    post_difference = abs(
        entity_a.post_count
        - entity_b.post_count
    )

    post_score = max(
        0,
        100 - (
            post_difference
            / max_posts
            * 100
        )
    )

    final_score = (
        hours_score * 0.4
        + days_score * 0.4
        + post_score * 0.2
    )

    return round(
        final_score,
        1
    )


def temporal_similarity(
    entity_a: Entity,
    entity_b: Entity
) -> float:
    """
    Compare active hours and active days.
    """

    hours_score = list_overlap_score(
        entity_a.activity_hours,
        entity_b.activity_hours
    )

    days_score = list_overlap_score(
        entity_a.activity_days,
        entity_b.activity_days
    )

    score = (
        hours_score * 0.6
        + days_score * 0.4
    )

    return round(
        score,
        1
    )


def financial_correlation(
    entity_a: Entity,
    entity_b: Entity,
    transactions: List[Transaction]
) -> float:
    """
    Detect direct or indirect wallet relationships.
    """

    wallets_a = set(
        wallet.lower()
        for wallet in entity_a.wallets
        if wallet
    )

    wallets_b = set(
        wallet.lower()
        for wallet in entity_b.wallets
        if wallet
    )

    if not wallets_a or not wallets_b:
        return 0.0

    # Same wallet detected
    if wallets_a.intersection(wallets_b):
        return 100.0

    # Direct transaction between wallets
    for transaction in transactions:

        from_wallet = (
            transaction.from_wallet.lower()
        )

        to_wallet = (
            transaction.to_wallet.lower()
        )

        direct_match = (
            from_wallet in wallets_a
            and to_wallet in wallets_b
        )

        reverse_match = (
            from_wallet in wallets_b
            and to_wallet in wallets_a
        )

        if direct_match or reverse_match:
            return 95.0

    # Indirect shared transaction connection
    connected_wallets_a = set()
    connected_wallets_b = set()

    for transaction in transactions:

        from_wallet = (
            transaction.from_wallet.lower()
        )

        to_wallet = (
            transaction.to_wallet.lower()
        )

        if from_wallet in wallets_a:
            connected_wallets_a.add(
                to_wallet
            )

        if to_wallet in wallets_a:
            connected_wallets_a.add(
                from_wallet
            )

        if from_wallet in wallets_b:
            connected_wallets_b.add(
                to_wallet
            )

        if to_wallet in wallets_b:
            connected_wallets_b.add(
                from_wallet
            )

    if connected_wallets_a.intersection(
        connected_wallets_b
    ):
        return 65.0

    return 0.0


# ============================================================
# ANALYSIS ENGINE
# ============================================================

def analyze_entities(
    entity_a: Entity,
    entity_b: Entity,
    transactions: List[Transaction]
):

    alias_score = username_similarity(
        entity_a.username,
        entity_b.username
    )

    semantic_score = semantic_similarity(
        entity_a.text,
        entity_b.text
    )

    behavior_score = behavior_similarity(
        entity_a,
        entity_b
    )

    temporal_score = temporal_similarity(
        entity_a,
        entity_b
    )

    financial_score = financial_correlation(
        entity_a,
        entity_b,
        transactions
    )

    # Weighted confidence score
    overall_confidence = (
        alias_score * 0.25
        + semantic_score * 0.15
        + behavior_score * 0.20
        + temporal_score * 0.15
        + financial_score * 0.25
    )

    overall_confidence = round(
        overall_confidence,
        1
    )


    # ========================================================
    # EXPLAINABLE REASONS
    # ========================================================

    reasons = []


    if alias_score >= 70:

        reasons.append(
            f"Strong alias similarity detected "
            f"({alias_score}%)."
        )


    elif alias_score >= 40:

        reasons.append(
            f"Moderate alias similarity detected "
            f"({alias_score}%)."
        )


    if semantic_score >= 20:

        reasons.append(
            f"Associated text contains overlapping "
            f"terms or activity patterns "
            f"({semantic_score}%)."
        )


    if behavior_score >= 60:

        reasons.append(
            f"Similar behavioral activity pattern "
            f"detected ({behavior_score}%)."
        )


    if temporal_score >= 60:

        reasons.append(
            f"Strong temporal activity overlap "
            f"detected ({temporal_score}%)."
        )


    if financial_score >= 90:

        reasons.append(
            "Direct financial relationship or "
            "strong wallet correlation detected."
        )


    elif financial_score >= 60:

        reasons.append(
            "Indirect financial network relationship "
            "detected through transaction connections."
        )


    if overall_confidence >= 75:

        status = (
            "HIGH POTENTIAL RELATIONSHIP"
        )

        reasons.append(
            "Multiple independent correlation signals "
            "support further investigator review."
        )


    elif overall_confidence >= 45:

        status = (
            "MODERATE POTENTIAL RELATIONSHIP"
        )

        reasons.append(
            "Some correlation signals were detected, "
            "but additional evidence is required."
        )


    else:

        status = (
            "LOW CORRELATION DETECTED"
        )

        reasons.append(
            "Current data does not provide strong "
            "evidence of a relationship."
        )


    reasons.append(
        "Human investigator verification is required. "
        "This correlation score is an investigative lead "
        "and does not prove identity or criminal involvement."
    )


    return {

        "scores": {

            "username_similarity":
                alias_score,

            "semantic_similarity":
                semantic_score,

            "behavior_similarity":
                behavior_score,

            "temporal_similarity":
                temporal_score,

            "financial_correlation":
                financial_score,

            "overall_confidence":
                overall_confidence

        },

        "status":
            status,

        "reasons":
            reasons

    }


# ============================================================
# ROUTES
# ============================================================

@app.get("/")
async def home():

    return FileResponse(
        STATIC_DIR / "index.html"
    )


@app.get("/api/health")
async def health_check():

    return {

        "status": "online",

        "module":
            "NARCO-TRACE Member 2",

        "service":
            "Entity and Financial Correlation Engine"

    }


@app.get("/api/sample")
async def get_sample_case():

    try:

        with open(
            SAMPLE_FILE,
            "r",
            encoding="utf-8"
        ) as file:

            data = json.load(file)

        return data

    except FileNotFoundError:

        return {

            "error":
                "Sample case file not found."

        }


@app.post("/api/analyze")
async def analyze(
    request: AnalysisRequest
):

    result = analyze_entities(

        request.entity_a,

        request.entity_b,

        request.transactions

    )

    return result


# ============================================================
# START MESSAGE
# ============================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000
    )
