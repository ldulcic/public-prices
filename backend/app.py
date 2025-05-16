from flask import Flask, jsonify
import pandas as pd
import os

app = Flask(__name__)

DATA_FILE = os.path.join('data', 'matched_items_v1.csv')
df_items = None

EXPECTED_COLUMNS = [
    'id', 'name', 'price', 'store', 'brand', 
    'net_quantity', 'unit_of_measure', 'category',
    'standardized_quantity', 'standardized_unit'
]

def load_data():
    global df_items
    try:
        if os.path.exists(DATA_FILE):
            df_items = pd.read_csv(DATA_FILE)
            if df_items.empty and os.path.getsize(DATA_FILE) > 0:
                print(f"Warning: {DATA_FILE} was read as an empty DataFrame despite having content. Check formatting/headers.")
                df_items = pd.DataFrame(columns=EXPECTED_COLUMNS)
                return
            elif df_items.empty:
                print(f"Warning: {DATA_FILE} is empty.")
                df_items = pd.DataFrame(columns=EXPECTED_COLUMNS)
                return

            # Verify and type columns
            for col in EXPECTED_COLUMNS:
                if col not in df_items.columns:
                    print(f"Warning: Column '{col}' missing in {DATA_FILE}. Adding it as empty.")
                    # Default types for potentially missing columns
                    if col == 'id' or col == 'standardized_quantity': # id is primary, std_qty is numeric
                        df_items[col] = pd.Series(dtype='Int64' if col == 'id' else float)
                    elif col == 'price':
                         df_items[col] = pd.Series(dtype=float)
                    else: # name, store, brand, units, category
                        df_items[col] = pd.Series(dtype=str)
            
            # Specific type conversions for existing columns
            if 'id' in df_items.columns:
                df_items['id'] = pd.to_numeric(df_items['id'], errors='coerce').astype('Int64')
                df_items.dropna(subset=['id'], inplace=True) # Critical: items must have a shared ID
            
            if 'price' in df_items.columns:
                df_items['price'] = pd.to_numeric(df_items['price'], errors='coerce')
            
            if 'standardized_quantity' in df_items.columns:
                df_items['standardized_quantity'] = pd.to_numeric(df_items['standardized_quantity'], errors='coerce')

            for col in ['name', 'store', 'brand', 'unit_of_measure', 'category', 'standardized_unit', 'net_quantity']:
                if col in df_items.columns:
                    df_items[col] = df_items[col].astype(str).fillna('') # Ensure string types and handle NaNs

            # Drop rows where critical info for grouping/display might be missing
            # Name and Store are essential for individual price entries.
            # ID is essential for grouping.
            df_items.dropna(subset=['id', 'name', 'store'], inplace=True) 
            
            print(f"Successfully loaded and processed {DATA_FILE}. Shape: {df_items.shape}")
            if df_items.empty and os.path.exists(DATA_FILE) and os.path.getsize(DATA_FILE) > 0:
                print("Warning: Data file resulted in an empty DataFrame after processing.")
        else:
            print(f"Error: Data file {DATA_FILE} not found.")
            df_items = pd.DataFrame(columns=EXPECTED_COLUMNS)
    except Exception as e:
        print(f"Error loading data: {e}")
        df_items = pd.DataFrame(columns=EXPECTED_COLUMNS)

@app.route('/items', methods=['GET'])
def get_items():
    if df_items is None or df_items.empty: # Check if empty even after load_data attempt
        load_data() # Attempt to load if not already
    
    if df_items is None or df_items.empty: # Re-check after load attempt
        return jsonify({"error": "Item data is not available. Please ensure matching script has run and data file is correct."}), 500

    items_list = []
    # Group by the shared 'id'. Other attributes like name, brand should be consistent within this group.
    for item_id, group in df_items.groupby('id', observed=True, sort=True):
        price_entries = []
        stores_for_item = set() # To track unique stores for the current item_id
        for _, row in group.iterrows():
            if pd.notna(row['price']):
                price_entries.append({'price': row['price'], 'store': row['store']})
                stores_for_item.add(row['store'])
        
        # Only add item if it has at least one valid price entry AND appears in at least 3 stores
        if price_entries and len(stores_for_item) >= 3:
            first_row = group.iloc[0]
            items_list.append({
                'id': int(item_id),
                'name': first_row['name'],
                # 'brand': first_row.get('brand', ''), # Use .get for new columns
                # 'category': first_row.get('category', ''),
                # 'net_quantity_original': first_row.get('net_quantity', ''),
                # 'unit_of_measure_original': first_row.get('unit_of_measure', ''),
                # 'standardized_quantity': first_row.get('standardized_quantity', None), # Can be NaN if conversion failed
                # 'standardized_unit': first_row.get('standardized_unit', ''),
                'prices': sorted(price_entries, key=lambda x: x['price']) # Sort prices
            })
    
    return jsonify(items_list)

@app.route('/items/<int:item_id>', methods=['GET']) # Changed route from /prices to /items
def get_item_by_id(item_id): # Renamed function
    if df_items is None or df_items.empty:
        load_data()

    if df_items is None or df_items.empty:
        return jsonify({"error": "Item data is not available."}), 500

    item_data_group = df_items[df_items['id'] == item_id]
    
    if item_data_group.empty:
        return jsonify({"message": "Item not found"}), 404
        
    first_row = item_data_group.iloc[0]
    price_entries = []
    for _, row in item_data_group.iterrows():
        if pd.notna(row['price']):
            price_entries.append({'price': row['price'], 'store': row['store']})
            
    if not price_entries:
         return jsonify({"message": "Item found but has no valid price entries"}), 404 # Should be rare if item exists

    return jsonify({
        'id': int(item_id),
        'name': first_row['name'],
        # 'brand': first_row.get('brand', ''),
        # 'category': first_row.get('category', ''),
        # 'net_quantity_original': first_row.get('net_quantity', ''),
        # 'unit_of_measure_original': first_row.get('unit_of_measure', ''),
        # 'standardized_quantity': first_row.get('standardized_quantity', None),
        # 'standardized_unit': first_row.get('standardized_unit', ''),
        'prices': sorted(price_entries, key=lambda x: x['price'])
    })

if __name__ == '__main__':
    load_data() 
    app.run(debug=True) 