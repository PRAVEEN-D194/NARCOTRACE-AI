# NARCO-TRACE AI — Member 2 Prototype

## Entity + Behavior + Finance Correlation

Standalone hackathon prototype for the Member 2 assignment.

### Features
- Entity resolution
- Alias matching
- Lightweight semantic/text similarity
- Behavioral matching
- Temporal matching
- Wallet correlation
- Transaction analysis
- Explainable overall correlation score
- Human verification required banner

## Run

```powershell
cd narco-trace-member2
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload
```

Open:

http://127.0.0.1:8000

The API is also available at:

http://127.0.0.1:8000/docs

## GitHub

```powershell
git checkout -b member2-correlation
git add .
git commit -m "Add Member 2 correlation prototype"
git push -u origin member2-correlation
```

Use only synthetic/lawfully supplied demonstration data.
