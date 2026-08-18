import re

class TextNormalizer:
    def __init__(self):
        # Leetspeak character mapping
        self.leet_map = {
            '@': 'a',
            '3': 'e',
            '0': 'o',
            '!': 'i',
            '$': 's',
            '5': 's',
            '7': 't',
            '1': 'i',
            '|': 'i',
            '#': 'h',
            '*': 'a'
        }

        # Emoji mapping to standard terms (Section 3 Domain Dictionary)
        self.emoji_map = {
            '❄️': ' ice/cocaine ',
            '❄': ' ice/cocaine ',
            '💊': ' ecstasy/xanax/pills ',
            '🌿': ' weed/hash/cannabis ',
            '🍁': ' cannabis ',
            '🍀': ' weed ',
            '💉': ' heroin/injectable ',
            '💎': ' crystal meth/ice ',
            '🧊': ' ice ',
            '🚬': ' weed/smoke ',
            '🍄': ' mushrooms ',
            '🐴': ' ketamine ',
            '🍬': ' ecstasy ',
            '🍭': ' ecstasy '
        }

        # General slang map (connectives, common terms)
        self.general_slang_map = {
            r'\bmachi\b': 'friend',
            r'\bbhai\b': 'brother',
            r'\birukka\b': 'available',
            r'\biruku\b': 'available',
            r'\bmilga\b': 'available',
            r'\bmilega\b': 'available',
            r'\bchahiye\b': 'need/want',
            r'\bde do\b': 'give me',
            r'\bdedo\b': 'give me',
            r'\bkudunga\b': 'give',
            r'\b1g\b': '1 gram',
            r'\b2g\b': '2 grams',
            r'\b10g\b': '10 grams',
            r'\b1kg\b': '1 kilogram',
            r'\b1\.5k\b': '1500 INR',
            r'\b2k\b': '2000 INR',
            r'\b3k\b': '3000 INR',
            r'\b5k\b': '5000 INR',
            r'\bcrypto\b': 'cryptocurrency',
            r'\binr\b': 'INR',
            r'\bupi\b': 'UPI'
        }

        # Drug-specific slang & Obfuscated Dark Jargon map (Section 3)
        # Tanglish/Tamil: vadi, sarakku, arakku, podi, samaan, stuff, potanga
        # Hinglish/Hindi: maal, samaan, bhang, goli, gardha, chitta, pudhiya
        self.drug_slang_map = {
            r'\bmalli\b': 'cannabis',
            r'\bdexo\b': 'dextromethorphan',
            r'\bpodi\b': 'cocaine/heroin powder',
            r'\bice\b': 'methamphetamine',
            r'\bc0ke\b': 'cocaine',
            r'\bm3th\b': 'methamphetamine',
            r'\bc0ca1n3\b': 'cocaine',
            r'\bmaalu\b': 'cannabis/weed',
            r'\bmaal\b': 'cannabis/weed',
            r'\bsarakku\b': 'contraband/substance',
            r'\barakku\b': 'liquor/illicit liquor',
            r'\bvadi\b': 'drop location',
            r'\bsamaan\b': 'contraband/drugs',
            r'\bstuff\b': 'illicit substances',
            r'\bpotanga\b': 'supplied/dispensed',
            r'\bbhang\b': 'cannabis derivative',
            r'\bgoli\b': 'ecstasy/narcotic pills',
            r'\bgardha\b': 'heroin/smack powder',
            r'\bchitta\b': 'synthetic opioid/heroin',
            r'\bpudhiya\b': 'drug packet/pouch',
            r'\bcharas\b': 'hashish',
            r'\bganja\b': 'cannabis/weed',
            r'\bvetti\b': 'cut/adulterated product'
        }

    def deobfuscate_word(self, word: str) -> str:
        # Avoid de-obfuscating telegram handles
        if word.startswith('@'):
            return word
        # Avoid de-obfuscating Session IDs / Crypto wallet addresses (hex/alphanumeric strings)
        if re.match(r'^[0-9a-fA-F]{8,}$', word):
            return word
        # Avoid de-obfuscating quantities/pricing (e.g. 1g, 1.5k, 5k)
        if re.match(r'^\d+(\.\d+)?[gGkKmL]$', word) or re.match(r'^\d+$', word):
            return word
            
        new_word = []
        for i, char in enumerate(word):
            if char == '1':
                if len(word) > 1:
                    new_word.append('i')
                else:
                    new_word.append('1')
            elif char in self.leet_map:
                new_word.append(self.leet_map[char])
            else:
                new_word.append(char)
        return "".join(new_word)

    def normalize(self, text: str, expand_drug_slang: bool = True) -> str:
        if not text:
            return ""

        # Step 1: Expand emojis
        normalized = text
        for emoji_char, replacement in self.emoji_map.items():
            normalized = normalized.replace(emoji_char, replacement)

        # Step 2: Tokenize and apply word-level leetspeak deobfuscation
        words = re.split(r'(\s+|[.,!?()\[\]{}:;_-])', normalized)
        processed_words = []
        for item in words:
            if re.match(r'^[A-Za-z0-9@!$3057#*|]+$', item):
                processed_words.append(self.deobfuscate_word(item))
            else:
                processed_words.append(item)
        
        normalized = "".join(processed_words)

        # Step 3: General slang expansion
        for pattern, replacement in self.general_slang_map.items():
            normalized = re.sub(pattern, replacement, normalized, flags=re.IGNORECASE)

        # Step 4: Drug slang expansion (conditional)
        if expand_drug_slang:
            for pattern, replacement in self.drug_slang_map.items():
                normalized = re.sub(pattern, replacement, normalized, flags=re.IGNORECASE)

        # Step 5: Clean up double spaces
        normalized = re.sub(r'\s+', ' ', normalized).strip()

        return normalized

