import pandas as pd
import os

def clean_price(price_series):
    """Cleans the price column by converting it to a numeric type."""
    if price_series.dtype == 'object':
        # Convert to string, replace comma with dot for decimal, remove other non-numeric characters (except dot)
        price_series = price_series.astype(str).str.replace(',', '.', regex=False)
        price_series = price_series.str.replace(r'[^\d.]', '', regex=True)
        # Handle cases where multiple dots might appear due to thousands separators being dots already
        # This logic tries to keep only the last dot as a decimal separator if multiple exist
        def correct_multiple_dots(price_str):
            if price_str.count('.') > 1:
                parts = price_str.split('.')
                return '.'.join(parts[:-1]).replace('.', '') + '.' + parts[-1]
            return price_str
        price_series = price_series.apply(correct_multiple_dots)
        price_series = pd.to_numeric(price_series, errors='coerce')
    elif pd.api.types.is_numeric_dtype(price_series):
        # If it's already numeric, ensure it's float
        price_series = price_series.astype(float)
    return price_series

def consolidate_csv_files(data_folder, output_file):
    """
    Consolidates specific CSV files (Konzum, Spar, Lidl, Studenac) from the data_folder
    into a single CSV file, extracting and standardizing 'name' and 'price' columns,
    and adding a unique 'id' for each item.
    Uses appropriate encodings for source files and outputs to UTF-8.
    """
    all_data = []
    if not os.path.exists(data_folder):
        print(f"Error: Data folder '{data_folder}' not found.")
        return

    # Define specific mappings for each store
    store_mappings = {
        'konzum.csv': {'name_col': 'NAZIV PROIZVODA', 'price_col': 'MALOPRODAJNA CIJENA', 'delimiter': ',', 'encoding': 'utf-8'},
        'spar.csv': {'name_col': 'naziv', 'price_col': 'MPC', 'delimiter': ';', 'encoding': 'cp1250'}, # Changed to cp1250
        'lidl.csv': {'name_col': 'Naziv proizvoda', 'price_col': 'Maloprodajna cijena', 'delimiter': ';', 'encoding': 'utf-8'},
        'studenac.csv': {'name_col': 'NAZIV', 'price_col': 'MALOPRODAJNA_CIJENA', 'delimiter': ',', 'encoding': 'cp1250'} # Changed to cp1250
    }

    for filename, mapping in store_mappings.items():
        file_path = os.path.join(data_folder, filename)
        if not os.path.exists(file_path):
            print(f"Warning: File {filename} not found in {data_folder}. Skipping.")
            continue
        
        store_name = os.path.splitext(filename)[0]
        try:
            # For Lidl and Studenac, pandas might misinterpret comma as thousands sep if not told it's a decimal
            # However, our clean_price function handles string conversion and replacement, so direct decimal arg might not be needed here
            # if pandas reads it as object type.
            df = pd.read_csv(file_path, delimiter=mapping['delimiter'], encoding=mapping['encoding'])
            
            name_col = mapping['name_col']
            price_col = mapping['price_col']

            if name_col in df.columns and price_col in df.columns:
                processed_df = df[[name_col, price_col]].copy()
                processed_df.rename(columns={name_col: 'name', price_col: 'price'}, inplace=True)
                processed_df['store'] = store_name
                
                # Clean the price column
                processed_df['price'] = clean_price(processed_df['price'])
                
                processed_df.dropna(subset=['name', 'price'], inplace=True)
                
                all_data.append(processed_df)
                print(f"Successfully processed {filename}. Name col: '{name_col}', Price col: '{price_col}'")
            else:
                print(f"Warning: Required columns not found in {filename}. Name: '{name_col}' (present: {name_col in df.columns}), Price: '{price_col}' (present: {price_col in df.columns}). Skipping.")
                print(f"  Available columns in {filename}: {list(df.columns)}")

        except Exception as e:
            print(f"Error reading or processing {filename}: {e}")

    if not all_data:
        print("No data to consolidate. Check warnings and errors.")
        # Create an empty file with headers if no data was processed
        pd.DataFrame(columns=['id', 'name', 'price', 'store']).to_csv(output_file, index=False, decimal='.', encoding='utf-8')
        print(f"Empty consolidated file created at {output_file}")
        return

    consolidated_df = pd.concat(all_data, ignore_index=True)
    
    # Ensure 'name' is string and 'price' is float
    consolidated_df['name'] = consolidated_df['name'].astype(str)
    consolidated_df['price'] = consolidated_df['price'].astype(float)

    if not consolidated_df.empty and 'name' in consolidated_df.columns:
        # Generate unique IDs for each item name
        unique_names = sorted(consolidated_df['name'].unique())
        name_to_id = {name: i for i, name in enumerate(unique_names, 1)} # Start IDs from 1
        consolidated_df['id'] = consolidated_df['name'].map(name_to_id)
        consolidated_df['id'] = consolidated_df['id'].astype(int) # Ensure ID is integer
        
        # Reorder columns to have 'id' first
        cols = ['id', 'name', 'price', 'store']
        # Filter out any columns not in the DataFrame, in case one of the base columns was missing
        cols = [col for col in cols if col in consolidated_df.columns] 
        consolidated_df = consolidated_df[cols]
    else:
        consolidated_df['id'] = pd.Series(dtype=int)
        # Ensure all expected columns exist even if dataframe was initially empty or name was missing
        for col_name in ['id', 'name', 'price', 'store']:
            if col_name not in consolidated_df.columns:
                consolidated_df[col_name] = pd.Series(dtype=object) # Default to object, will be typed later or at save
        consolidated_df = consolidated_df[['id', 'name', 'price', 'store']] # Enforce column order

    output_dir = os.path.dirname(output_file)
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    # Explicitly save as UTF-8
    consolidated_df.to_csv(output_file, index=False, decimal='.', encoding='utf-8')
    print(f"Consolidated data saved to {output_file} using UTF-8 encoding.")
    if not consolidated_df.empty:
        print("\nSample of consolidated data:")
        print(consolidated_df.head())
        print(f"\nData types:\n{consolidated_df.dtypes}")
        print(f"\nTotal rows in consolidated file: {len(consolidated_df)}")
    else:
        print("\nConsolidated data is empty, but headers were written.")

if __name__ == "__main__":
    data_directory = "data" # Assuming this script is in the root and data is a subfolder
    consolidated_file_path = os.path.join(data_directory, "consolidated_items.csv")
    consolidate_csv_files(data_directory, consolidated_file_path) 