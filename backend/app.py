from flask import Flask, jsonify
import pandas as pd
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

DATA_FILE = os.path.join('data', 'consolidated_items.csv')
df_items = None
EXPECTED_COLUMNS = ['id', 'name', 'price', 'store']

def load_data():
    global df_items
    try:
        if os.path.exists(DATA_FILE):
            df_items = pd.read_csv(DATA_FILE)
            if df_items.empty and os.path.getsize(DATA_FILE) > 0: # File exists and is not empty but pandas read it as empty
                print(f"Warning: {DATA_FILE} was read as an empty DataFrame despite having content. Check formatting/headers.")
                df_items = pd.DataFrame(columns=EXPECTED_COLUMNS)
                return
            elif df_items.empty:
                print(f"Warning: {DATA_FILE} is empty or does not exist.")
                df_items = pd.DataFrame(columns=EXPECTED_COLUMNS)
                return

            # Verify and type columns
            for col in EXPECTED_COLUMNS:
                if col not in df_items.columns:
                    print(f"Warning: Column '{col}' missing in {DATA_FILE}. Adding it as empty.")
                    if col == 'id':
                        df_items[col] = pd.Series(dtype=int)
                    elif col == 'name' or col == 'store':
                        df_items[col] = pd.Series(dtype=str)
                    elif col == 'price':
                        df_items[col] = pd.Series(dtype=float)
            
            if 'id' in df_items.columns:
                df_items['id'] = pd.to_numeric(df_items['id'], errors='coerce').astype('Int64') # Use Int64 for nullable integers
                df_items.dropna(subset=['id'], inplace=True) 
            if 'price' in df_items.columns:
                df_items['price'] = pd.to_numeric(df_items['price'], errors='coerce')
                # We keep rows with NaN prices for an item if it has other valid price entries, decision made in endpoint.
            if 'name' in df_items.columns:
                df_items['name'] = df_items['name'].astype(str)
            if 'store' in df_items.columns:
                df_items['store'] = df_items['store'].astype(str)

            # Drop rows where critical info like name or store might be missing after conversion (id/price handled by dropna or kept as NaN)
            df_items.dropna(subset=['name', 'store'], inplace=True)
            
            print(f"Successfully loaded and processed {DATA_FILE}. Shape: {df_items.shape}")
            if df_items.empty and os.path.exists(DATA_FILE):
                print("Warning: Data file resulted in an empty DataFrame after processing (e.g., all rows had critical missing data).")
        else:
            print(f"Error: Data file {DATA_FILE} not found.")
            df_items = pd.DataFrame(columns=EXPECTED_COLUMNS)
    except Exception as e:
        print(f"Error loading data: {e}")
        df_items = pd.DataFrame(columns=EXPECTED_COLUMNS)

@app.route('/items', methods=['GET'])
def get_items():
    if df_items is None:
        load_data()
    
    if df_items is None or df_items.empty or not all(col in df_items.columns for col in EXPECTED_COLUMNS):
        return jsonify({"error": "Item data is not available or is malformed. Please ensure consolidation script has run successfully and data file is correct."}), 500

    items_list = []
    # Group by 'id' and 'name' to handle each unique item
    for (item_id, item_name), group in df_items.groupby(['id', 'name'], observed=True, sort=True):
        price_entries = []
        for _, row in group.iterrows():
            # Only include entries where price is not NaN
            if pd.notna(row['price']):
                price_entries.append({'price': row['price'], 'store': row['store']})
        
        if price_entries: # Only add item if it has at least one valid price entry
            items_list.append({
                'id': int(item_id), # Ensure id is standard int for JSON
                'name': item_name,
                'prices': price_entries
            })
    
    return jsonify(items_list[:100])

@app.route('/prices/<int:item_id>', methods=['GET'])
def get_prices_by_id(item_id):
    if df_items is None:
        load_data()

    if df_items is None or df_items.empty or not all(col in df_items.columns for col in EXPECTED_COLUMNS):
        return jsonify({"error": "Item data is not available or is malformed."}), 500

    item_data = df_items[df_items['id'] == item_id]
    
    if item_data.empty:
        return jsonify({"message": "Item not found"}), 404
        
    # Assuming item_id is unique, item_name will be the same for all rows in item_data
    item_name = item_data['name'].iloc[0]
    price_entries = []
    for _, row in item_data.iterrows():
        if pd.notna(row['price']):
            price_entries.append({'price': row['price'], 'store': row['store']})
            
    if not price_entries: # Should not happen if item was found, but as a safeguard
         return jsonify({"message": "Item found but has no valid price entries"}), 404

    return jsonify({
        'id': int(item_id),
        'name': item_name,
        'prices': price_entries
    })

if __name__ == '__main__':
    load_data() 
    app.run(debug=True) 