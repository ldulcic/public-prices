import csv
import os

def get_cleaned_price(price_str, decimal_separator):
    if not price_str:
        return None
    
    # Standardize decimal separator to period
    if decimal_separator == ',':
        price_str = price_str.replace('.', '') # Remove potential thousand separator
        price_str = price_str.replace(',', '.') # Convert decimal comma to period
    elif decimal_separator == '.':
        price_str = price_str.replace(',', '') # Remove potential thousand separator
    
    # Remove any other non-numeric characters except the period and minus sign (for potential negative prices, though unlikely here)
    cleaned_price_chars = []
    for char in price_str:
        if char.isdigit() or char == '.' or (char == '-' and not cleaned_price_chars):
            cleaned_price_chars.append(char)
    
    cleaned_price = ''.join(cleaned_price_chars)

    try:
        # Handle cases like '.79' by prefixing with '0' if it starts with '.'
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
        # (filename, store_name, name_col_idx, price_col_idx, delimiter, encodings_to_try, decimal_separator, header_lines_to_skip, quote_character)
        ('tommy.csv', 'tommy', 2, 7, ',', ['utf-8'], ',', 1, None),
        ('spar.csv', 'spar', 0, 5, ';', ['utf-8', 'cp1250', 'iso-8859-2'], '.', 1, None),
        ('lidl.csv', 'lidl', 0, 6, ',', ['utf-8', 'cp1250', 'iso-8859-2'], '.', 1, None),
        ('konzum.csv', 'konzum', 0, 5, ',', ['utf-8'], '.', 1, None),
        ('eurospin.csv', 'eurospin', 0, 5, ';', ['utf-8'], '.', 1, '"'),
        ('studenac.csv', 'studenac', 0, 6, ',', ['utf-8', 'cp1250', 'iso-8859-2'], '.', 1, None)
    ]

    print(f"Output will be written to: {os.path.join(data_folder, output_filename)}")

    for filename, store_name, name_col_idx, price_col_idx, delimiter, encodings, dec_sep, skip_lines, quotechar_val in files_to_process:
        filepath = os.path.join(data_folder, filename)
        print(f"\nProcessing {filename} for store {store_name}...")
        
        raw_file_content = None
        used_encoding = None

        for enc in encodings:
            try:
                with open(filepath, 'r', encoding=enc, newline='') as f:
                    if quotechar_val:
                        # For Eurospin, fields are quoted
                        reader = csv.reader(f, delimiter=delimiter, quotechar=quotechar_val)
                    else:
                        reader = csv.reader(f, delimiter=delimiter)
                    raw_file_content = list(reader)
                used_encoding = enc
                print(f"Successfully read {filename} with encoding {used_encoding}")
                break 
            except UnicodeDecodeError:
                print(f"Failed to decode {filename} with {enc}. Trying next...")
            except FileNotFoundError:
                print(f"File not found: {filepath}. Skipping.")
                raw_file_content = None # Ensure it's reset
                break
            except Exception as e:
                print(f"An error occurred while reading {filename} with {enc}: {e}. Skipping.")
                raw_file_content = None # Ensure it's reset
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

            if not row: # Skip empty rows
                continue

            try:
                item_name_raw = row[name_col_idx].strip().strip('"')
                price_str = row[price_col_idx].strip()

                if not item_name_raw: 
                    # print(f"Info: Skipping row {row_idx+1} in {filename} due to empty item name.")
                    continue

                item_name_normalized = ' '.join(item_name_raw.lower().split())
                price = get_cleaned_price(price_str, dec_sep)
                
                if price is None or price < 0: # Assuming prices must be non-negative
                    # print(f"Info: Skipping item '{item_name_raw}' from {filename} due to invalid/empty/negative price: '{price_str}'")
                    continue

                item_id = item_name_to_id.get(item_name_normalized)
                if item_id is None:
                    item_id = next_id
                    item_name_to_id[item_name_normalized] = next_id
                    next_id += 1
                
                consolidated_data.append([item_id, item_name_raw, f"{price:.2f}", store_name]) # Format price to 2 decimal places
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
        # Remove duplicate rows before writing
        if consolidated_data:
            # Convert list of lists to set of tuples to find unique rows
            unique_data_tuples = sorted(list(set(tuple(row) for row in consolidated_data))) # Sort for consistent order
            # Convert back to list of lists
            consolidated_data_unique_list = [list(t) for t in unique_data_tuples]
        else:
            consolidated_data_unique_list = []

        with open(output_filepath, 'w', newline='', encoding='utf-8') as f_out:
            writer = csv.writer(f_out)
            writer.writerow(['id', 'name', 'price', 'store']) 
            writer.writerows(consolidated_data_unique_list) # Use the unique list
        print(f"\nConsolidated data successfully written to {output_filepath}")
        print(f"Total unique items (distinct names found): {len(item_name_to_id)}")
        print(f"Total rows in consolidated file (excluding header): {len(consolidated_data_unique_list)}") # Count unique rows
    except Exception as e:
        print(f"Error writing to output file {output_filepath}: {e}")

if __name__ == "__main__":
    data_directory = "data" 
    output_csv_name = "consolidated_items.csv" # This will be overwritten as per user request.
    
    # Check if data directory exists
    if not os.path.isdir(data_directory):
        print(f"Error: Data directory '{data_directory}' not found. Please ensure it exists in the same location as the script.")
        exit()

    process_csv_files(data_directory, output_csv_name) 