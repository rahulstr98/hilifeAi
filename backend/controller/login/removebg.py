import sys
from rembg import remove
from PIL import Image
import io

# Function to convert hex color code to RGB
def hex_to_rgb(hex_code):
    hex_code = hex_code.lstrip('#')
    if len(hex_code) == 6:
        r, g, b = bytes.fromhex(hex_code)
    elif len(hex_code) == 8:
        r, g, b = bytes.fromhex(hex_code[:6])
    return (r, g, b)

def remove_background_and_add_color(input_image_path, output_image_path, hex_color='#FFFFFF'):
    # Convert hex color to RGB
    background_color = hex_to_rgb(hex_color) + (255,)  # Add alpha channel for RGBA

    # Read the input image file
    with open(input_image_path, 'rb') as input_image_file:
        input_image = input_image_file.read()
    
    # Use rembg to remove background
    output_image = remove(input_image)
    
    # Convert the output to an image format
    foreground = Image.open(io.BytesIO(output_image)).convert("RGBA")
    
    # Create a new image with the same size and the background color
    background = Image.new("RGBA", foreground.size, background_color)
    
    # Composite the foreground onto the background
    combined_image = Image.alpha_composite(background, foreground)
    
    # Save the result as an image with the desired output path
    combined_image.convert("RGB").save(output_image_path)

if __name__ == "__main__":
    input_image_path = sys.argv[1]
    output_image_path = sys.argv[2]
    color = sys.argv[3]
    remove_background_and_add_color(input_image_path, output_image_path, color)