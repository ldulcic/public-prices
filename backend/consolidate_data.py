import csv
import os

def get_cleaned_price(price_str, decimal_separator):
    if not price_str:
        return None
    
    price_str = price_str.strip().strip('"') # Ensure quotes are stripped from price string too
    
    # Standardize decimal separator to period
    if decimal_separator == ',':
        price_str = price_str.replace('.', '') # Remove potential thousand separator
        price_str = price_str.replace(',', '.') # Convert decimal comma to period
    elif decimal_separator == '.':
        price_str = price_str.replace(',', '') # Remove potential thousand separator
    
    cleaned_price_chars = []
    for char in price_str:
        if char.isdigit() or char == '.' or (char == '-' and not cleaned_price_chars):
            cleaned_price_chars.append(char)
    
    cleaned_price = ''.join(cleaned_price_chars)

    try:
        if cleaned_price.startswith('.'):
            cleaned_price = '0' + cleaned_price
        return float(cleaned_price)
    except ValueError:
        return None

def process_csv_files(data_folder, output_filename):
    consolidated_data = []
    item_name_to_id = {}
    next_id = 1

    files_to_process = [
        # (filename, store_name, name_idx, price_idx, brand_idx, quantity_idx, unit_idx, category_idx, delimiter, encodings, dec_sep, skip, quote_char)
        ('tommy.csv', 'tommy', 2, 7, 3, 6, 5, 4, ',', ['utf-8'], ',', 1, None),
        ('spar.csv', 'spar', 0, 5, 2, 3, 4, 12, ';', ['utf-8', 'cp1250', 'iso-8859-2'], '.', 1, None),
        ('lidl.csv', 'lidl', 0, 6, 5, 2, 3, 9, ',', ['utf-8', 'cp1250', 'iso-8859-2'], '.', 1, None),
        ('konzum.csv', 'konzum', 0, 5, 2, 3, 4, 11, ',', ['utf-8'], '.', 1, None),
        ('eurospin.csv', 'eurospin', 0, 5, 2, 3, 4, 12, ';', ['utf-8'], '.', 1, '"'),
        ('studenac.csv', 'studenac', 0, 6, 5, 2, 3, 9, ',', ['utf-8', 'cp1250', 'iso-8859-2'], '.', 1, None)
    ]

    output_header = ['id', 'name', 'price', 'store', 'brand', 'net_quantity', 'unit_of_measure', 'category']
    print(f"Output will be written to: {os.path.join(data_folder, output_filename)} with header: {output_header}")

    for config in files_to_process:
        filename, store_name, name_idx, price_idx, brand_idx, qty_idx, unit_idx, cat_idx, delimiter, encodings, dec_sep, skip_lines, quotechar_val = config
        filepath = os.path.join(data_folder, filename)
        print(f"\nProcessing {filename} for store {store_name}...")
        
        raw_file_content = None
        used_encoding = None

        for enc in encodings:
            try:
                with open(filepath, 'r', encoding=enc, newline='') as f:
                    reader_obj = csv.reader(f, delimiter=delimiter, quotechar=quotechar_val) if quotechar_val else csv.reader(f, delimiter=delimiter)
                    raw_file_content = list(reader_obj)
                used_encoding = enc
                print(f"Successfully read {filename} with encoding {used_encoding}")
                break 
            except UnicodeDecodeError:
                print(f"Failed to decode {filename} with {enc}. Trying next...")
            except FileNotFoundError:
                print(f"File not found: {filepath}. Skipping.")
                raw_file_content = None 
                break
            except Exception as e:
                print(f"An error occurred while reading {filename} with {enc}: {e}. Skipping.")
                raw_file_content = None 
                break
        
        if raw_file_content is None:
            print(f"Could not read file {filename} after trying specified encodings. Skipping.")
            continue

        header_skipped_count = 0
        rows_processed_for_file = 0
        for row_idx, row in enumerate(raw_file_content):
            if header_skipped_count < skip_lines:
                header_skipped_count += 1
                continue

            if not row or len(row) < max(name_idx, price_idx, brand_idx, qty_idx, unit_idx, cat_idx) +1: # check if row has enough columns
                # print(f"Info: Skipping row {row_idx+1} in {filename} due to being empty or having insufficient columns.")
                continue

            try:
                item_name_raw = row[name_idx].strip().strip('"')
                price_str = row[price_idx].strip().strip('"') 
                brand_raw = row[brand_idx].strip().strip('"') if brand_idx is not None and row[brand_idx] else ''
                qty_raw = row[qty_idx].strip().strip('"') if qty_idx is not None and row[qty_idx] else ''
                unit_raw = row[unit_idx].strip().strip('"') if unit_idx is not None and row[unit_idx] else ''
                cat_raw = row[cat_idx].strip().strip('"') if cat_idx is not None and row[cat_idx] else ''

                if not item_name_raw: 
                    continue

                item_name_normalized = ' '.join(item_name_raw.lower().split())
                price = get_cleaned_price(price_str, dec_sep)
                
                if price is None or price < 0: 
                    continue

                item_id = item_name_to_id.get(item_name_normalized)
                if item_id is None:
                    item_id = next_id
                    item_name_to_id[item_name_normalized] = next_id
                    next_id += 1
                
                # id, name, price, store, brand, net_quantity, unit_of_measure, category
                consolidated_data.append([item_id, item_name_raw, f"{price:.2f}", store_name, brand_raw, qty_raw, unit_raw, cat_raw])
                rows_processed_for_file +=1

            except IndexError:
                # print(f"Warning: Skipping row {row_idx+1} in {filename} due to missing columns. Row content: {'|'.join(row)}")
                continue
            except Exception as e:
                # print(f"Warning: Error processing row {row_idx+1} in {filename}: {row}. Error: {e}")
                continue
        print(f"Finished processing {filename}. Added {rows_processed_for_file} items.")

    output_filepath = os.path.join(data_folder, output_filename)
    try:
        if consolidated_data:
            unique_data_tuples = sorted(list(set(tuple(row) for row in consolidated_data)))
            consolidated_data_unique_list = [list(t) for t in unique_data_tuples]
        else:
            consolidated_data_unique_list = []

        with open(output_filepath, 'w', newline='', encoding='utf-8') as f_out:
            writer = csv.writer(f_out)
            writer.writerow(output_header) 
            writer.writerows(consolidated_data_unique_list) 
        print(f"\nConsolidated data successfully written to {output_filepath}")
        print(f"Total unique item names found (used for ID generation): {len(item_name_to_id)}")
        print(f"Total rows in consolidated file (excluding header): {len(consolidated_data_unique_list)}")
    except Exception as e:
        print(f"Error writing to output file {output_filepath}: {e}")

if __name__ == "__main__":
    data_directory = "data" 
    output_csv_name = "consolidated_items.csv" 
    
    if not os.path.isdir(data_directory):
        print(f"Error: Data directory '{data_directory}' not found. Please ensure it exists in the same location as the script.")
        exit()

    process_csv_files(data_directory, output_csv_name) 