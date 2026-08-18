import json
import logging
import sys
from pipeline import Member1Pipeline

# Configure sys.stdout to handle UTF-8 encoding on Windows console
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Configure logging to show pipeline progress
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

def print_separator(title: str):
    print("\n" + "=" * 80)
    print(f" {title} ".center(80, "="))
    print("=" * 80)

def main():
    pipeline = Member1Pipeline(use_ml_fallbacks=True)

    # 1. Tanglish Dark-Web Drug Request Example
    tanglish_sample = "machi 1g ice irukka? contact @dark_seller_tn on telegram. deal at marina beach, 2000 INR crypto only"
    print_separator("TEST 1: TANGLISH DARK-WEB INPUT")
    print(f"Raw Input: '{tanglish_sample}'\n")
    
    result1 = pipeline.execute(tanglish_sample)
    print("Pipeline Output JSON:")
    print(result1.model_dump_json(indent=2))

    # 2. Hinglish Obfuscated Dark-Web Drug Request Example
    hinglish_sample = "bhai 2 p@ck3ts of m@ll! and d3x0 available in Bangaluru? ping me on Session 05f8892a01bc. drop near Koramangala signal, 1.5k UPI"
    print_separator("TEST 2: HINGLISH OBFUSCATED INPUT")
    print(f"Raw Input: '{hinglish_sample}'\n")
    
    result2 = pipeline.execute(hinglish_sample)
    print("Pipeline Output JSON:")
    print(result2.model_dump_json(indent=2))

    # 3. Innocent/Everyday Code-Mixed Control Input (To test Contextual Classification)
    innocent_sample = "Hey bhai, is there frozen ice left in the fridge? Marina beach is too hot today."
    print_separator("TEST 3: INNOCENT CONTROL INPUT")
    print(f"Raw Input: '{innocent_sample}'\n")
    
    result3 = pipeline.execute(innocent_sample)
    print("Pipeline Output JSON:")
    print(result3.model_dump_json(indent=2))

if __name__ == "__main__":
    main()

