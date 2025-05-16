import pandas as pd
import re
import os

# --- Configuration for Normalization ---
INPUT_CSV = os.path.join("data", "consolidated_items.csv")
OUTPUT_CSV = os.path.join("data", "normalized_items.csv")

# Columns to apply text cleaning
TEXT_COLUMNS_TO_CLEAN = ['name', 'brand', 'category']

# Basic Croatian abbreviation dictionary (expand as needed)
ABBREVIATION_DICT = {
    r'\bmlij.': 'mlijeko',
    r'\bčok.': 'čokolada',
    r'\bpak.': 'pakiranje',
    r'\bkgb': 'kilogram', # To help with unit parsing before final standardization
    r'\blb': 'litra',   # To help with unit parsing
    r'\bkom.': 'komad',
    # Add more common abbreviations you find in your data
}

# --- Helper Functions ---

def clean_text_field(text):
    if not isinstance(text, str):
        return '' # Return empty string if not a string (e.g., NaN)
    text = text.lower()
    text = text.strip()
    # Expand abbreviations first
    for abbr, full in ABBREVIATION_DICT.items():
        text = re.sub(abbr, full, text, flags=re.IGNORECASE) # Case-insensitive regex replacement
    
    # Remove most punctuation, keep spaces and alphanumeric.
    # Consider if specific punctuation like '-' or '/' is important for some fields.
    text = re.sub(r'[^\w\s.\']', '', text) # Keeps '.', also keeps ' for names like O'Hara
    text = re.sub(r'\s+', ' ', text).strip() # Normalize whitespace
    return text

def parse_quantity(quantity_str):
    if not isinstance(quantity_str, str):
        return None
    
    original_quantity_str = quantity_str # For debugging
    
    # Handle ranges like "2x1.5L" or "3x80g" - try to extract primary quantity
    # This is a basic attempt, might need more robust parsing for complex cases
    match_multiple = re.search(r'(\d+)\s*x\s*([\d,.]+)', quantity_str, re.IGNORECASE)
    if match_multiple:
        try:
            num_items = int(match_multiple.group(1))
            single_item_qty_str = match_multiple.group(2)
            # For simplicity, we might just take the single_item_qty_str for now, 
            # or you could multiply num_items * single_item_qty for total quantity
            quantity_str = single_item_qty_str 
        except:
            pass # Stick to original quantity_str if parsing fails

    # Standardize decimal separator and remove thousands separators
    quantity_str = quantity_str.replace('.', '', quantity_str.count('.') -1).replace(',', '.')
    
    # Extract numeric part
    numeric_match = re.search(r'[\d.]+', quantity_str)
    if numeric_match:
        try:
            return float(numeric_match.group(0))
        except ValueError:
            # print(f"Warning: Could not parse quantity from '{original_quantity_str}' -> '{quantity_str}'")
            return None
    # print(f"Warning: No numeric quantity found in '{original_quantity_str}'")
    return None

def standardize_unit(unit_str, quantity_val):
    if not isinstance(unit_str, str) or quantity_val is None:
        return quantity_val, ''

    unit_str_lower = unit_str.lower().strip().replace('.','') # remove periods from units

    # Weight
    if 'kg' in unit_str_lower or unit_str_lower == 'kilogram':
        return quantity_val * 1000, 'g'
    if 'g' in unit_str_lower and 'kg' not in unit_str_lower : # avoid matching 'kg' again
        return quantity_val, 'g'
    
    # Volume
    if 'l' == unit_str_lower or 'litra' in unit_str_lower or 'lit' in unit_str_lower:
        return quantity_val * 1000, 'ml'
    if 'ml' in unit_str_lower:
        return quantity_val, 'ml'
    if 'cl' in unit_str_lower:
        return quantity_val * 10, 'ml'
    if 'dl' in unit_str_lower:
         return quantity_val * 100, 'ml'

    # Pieces
    if unit_str_lower.startswith('kom') or unit_str_lower in ['komad','komada','komadi', 'psc', 'pcs', 'st', 'kos']:
        return quantity_val, 'kom'
    if 'kom' in unit_str_lower and 'kg' not in unit_str_lower: # e.g. from '10komad'
         return quantity_val, 'kom'


    # If no specific match, return original quantity and cleaned unit
    # print(f"Warning: Unit '{unit_str}' not explicitly handled. Returning as is.")
    return quantity_val, unit_str_lower

def croatian_stemmer_placeholder(text):
    # Placeholder: Real Croatian stemming is more complex.
    # For a real solution, consider libraries like 'nltk' with Croatian resources
    # or a custom stemming dictionary if a dedicated library isn't available/suitable.
    # This function currently does nothing.
    return text

# --- Main Normalization Logic ---
def normalize_data(df):
    print("Starting data normalization...")

    # 1. Clean text columns
    for col in TEXT_COLUMNS_TO_CLEAN:
        if col in df.columns:
            print(f"Cleaning column: {col}")
            df[col] = df[col].apply(clean_text_field)
        else:
            print(f"Warning: Column {col} not found for text cleaning.")

    # 2. Standardize Quantity and Unit
    if 'net_quantity' in df.columns and 'unit_of_measure' in df.columns:
        print("Standardizing quantity and unit...")
        
        # Apply parsing and standardization
        # Note: The order of operations (parsing quantity first) is important
        parsed_quantities = df['net_quantity'].apply(parse_quantity)
        
        # Apply standardization using the parsed numeric quantity
        standardized_q_u = df.apply(lambda row: standardize_unit(row['unit_of_measure'], parsed_quantities[row.name]), axis=1)
        
        df['standardized_quantity'] = [item[0] for item in standardized_q_u]
        df['standardized_unit'] = [item[1] for item in standardized_q_u]
    else:
        print("Warning: 'net_quantity' or 'unit_of_measure' columns not found. Skipping standardization.")
        df['standardized_quantity'] = None
        df['standardized_unit'] = ''
        
    # 3. Apply Stemming/Lemmatization (Placeholder)
    # print("Applying stemming/lemmatization (placeholder)...")
    # if 'name' in df.columns:
    #     df['name_stemmed'] = df['name'].apply(croatian_stemmer_placeholder)

    print("Normalization complete.")
    return df

if __name__ == "__main__":
    if not os.path.exists(INPUT_CSV):
        print(f"Error: Input file '{INPUT_CSV}' not found. Please run `consolidate_data.py` first.")
    else:
        print(f"Loading data from {INPUT_CSV}...")
        # Try to detect encoding, default to utf-8
        try:
            df_consolidated = pd.read_csv(INPUT_CSV, encoding='utf-8')
        except UnicodeDecodeError:
            print("UTF-8 decoding failed, trying cp1250...")
            try:
                df_consolidated = pd.read_csv(INPUT_CSV, encoding='cp1250')
            except UnicodeDecodeError:
                print("cp1250 decoding failed, trying iso-8859-2...")
                df_consolidated = pd.read_csv(INPUT_CSV, encoding='iso-8859-2')
        
        df_normalized = normalize_data(df_consolidated)
        
        print(f"\nSaving normalized data to {OUTPUT_CSV}...")
        df_normalized.to_csv(OUTPUT_CSV, index=False, encoding='utf-8')
        print("Saved successfully.")
        
        print("\nSample of normalized data (first 5 rows):")
        print(df_normalized.head())
        print("\nInfo about new quantity/unit columns:")
        if 'standardized_quantity' in df_normalized.columns:
            print(df_normalized[['net_quantity', 'unit_of_measure', 'standardized_quantity', 'standardized_unit']].sample(10)) # Sample 10 rows
            print("\nUnique standardized units:")
            print(df_normalized['standardized_unit'].unique()) 