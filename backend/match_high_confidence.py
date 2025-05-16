import pandas as pd
import os

# --- Configuration ---
INPUT_CSV = os.path.join("data", "normalized_items.csv")
OUTPUT_CSV = os.path.join("data", "matched_items_v1.csv")

# Columns to use for creating a unique product signature for exact matching
EXACT_MATCH_COLUMNS = ['name', 'brand', 'standardized_quantity', 'standardized_unit']

# --- Main Matching Logic ---
def apply_shared_ids(df):
    print("Applying shared IDs based on high-confidence matches...")

    # Ensure key columns are in the expected type (string for text, allow float for quantity)
    for col in ['name', 'brand', 'standardized_unit', 'id']: # Added 'id' to ensure it's a clean string for later ops if needed, though it should be int
        if col in df.columns:
            if col == 'id':
                df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype(int) # Ensure ID is int
            else:
                df[col] = df[col].astype(str).fillna('') 
        else:
            print(f"Warning: Column '{col}' not found. This might affect matching or ID assignment.")
            if col in EXACT_MATCH_COLUMNS or col == 'id':
                print(f"Critical: Column '{col}' is missing. Results might be incorrect.")
                # If ID is missing, we can't proceed with this logic easily, might need to halt or assign temp IDs.
                # For now, let script fail if 'id' is truly missing as it's fundamental.

    if 'standardized_quantity' in df.columns:
        df['standardized_quantity_str'] = df['standardized_quantity'].astype(str).fillna('') 
    else:
        print("Warning: Column 'standardized_quantity' not found. It will be ignored if in EXACT_MATCH_COLUMNS.")
        if 'standardized_quantity' in EXACT_MATCH_COLUMNS:
             print(f"Critical: Key matching column 'standardized_quantity' is missing. Results might be incorrect.")
        df['standardized_quantity_str'] = '' 

    def create_match_signature(row):
        parts = []
        for col in EXACT_MATCH_COLUMNS:
            actual_col_name = col
            if col == 'standardized_quantity':
                actual_col_name = 'standardized_quantity_str'
            if actual_col_name in row:
                parts.append(str(row[actual_col_name]).lower().strip())
            else:
                parts.append('') 
        return '|'.join(parts)

    df['match_signature'] = df.apply(create_match_signature, axis=1)

    # Group by signature and assign the ID of the first item in each group to all items in that group
    # We need to ensure the 'id' column is suitable to be taken as the group's representative ID.
    # The .transform('first') will pick the 'id' from the first row within each group.
    print("Grouping by match signature and propagating first encountered ID to matched items...")
    df['id'] = df.groupby('match_signature')['id'].transform('first')
    
    # The number of unique IDs after this process should be equal to the number of unique match_signatures
    num_unique_ids_after_match = df['id'].nunique()
    num_unique_signatures = df['match_signature'].nunique()
    print(f"Number of unique match signatures found: {num_unique_signatures}")
    print(f"Number of unique IDs after propagation: {num_unique_ids_after_match}")
    if num_unique_ids_after_match != num_unique_signatures:
        print("Warning: Mismatch between unique signatures and unique IDs after matching. Check grouping logic.")

    df.drop(columns=['match_signature', 'standardized_quantity_str'], inplace=True, errors='ignore')
    
    return df

if __name__ == "__main__":
    if not os.path.exists(INPUT_CSV):
        print(f"Error: Input file '{INPUT_CSV}' not found. Please run `normalize_data.py` first.")
    else:
        print(f"Loading normalized data from {INPUT_CSV}...")
        df_normalized = pd.read_csv(INPUT_CSV)
        
        string_cols_for_prep = ['name', 'brand', 'unit_of_measure', 'category', 'standardized_unit']
        for col in string_cols_for_prep:
            if col in df_normalized.columns:
                df_normalized[col] = df_normalized[col].astype(str).fillna('')
            else:
                print(f"Warning: Column '{col}' missing from input CSV during type conversion.")
        
        # Ensure 'id' column exists and is numeric before matching starts
        if 'id' not in df_normalized.columns:
            print("Critical Error: 'id' column is missing from normalized_items.csv. Cannot proceed.")
            exit()
        df_normalized['id'] = pd.to_numeric(df_normalized['id'], errors='coerce').fillna(0).astype(int)


        df_matched = apply_shared_ids(df_normalized)
        
        # Reorder columns to have id first (which is now the shared ID)
        cols_order = ['id'] + [c for c in df_matched.columns if c != 'id']
        df_matched = df_matched[cols_order]

        print(f"\\nSaving matched data to {OUTPUT_CSV}...")
        df_matched.to_csv(OUTPUT_CSV, index=False, encoding='utf-8')
        print("Saved successfully.")
        
        print("\\nSample of matched data (first 5 rows):")
        print(df_matched.head())
        print(f"\\nTotal rows in matched file: {len(df_matched)}")
        print(f"Number of unique shared IDs: {df_matched['id'].nunique()}") 