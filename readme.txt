## Project Overview ##
This project consists of Python scripts and a web interface (index.html).

## v7 ##
v7 is the p5js version with translation and automatic layering.
size and rotation are random.
added text
(last update 21 feb 2025)


## Required Python libraries ##
- Flask
- Flask-CORS
- Pillow
- Requests
- BeautifulSoup (bs4)
- NumPy
- SciPy

## Steps to Run ##
1. Run the Collage Server (collage_server.py)
2. Open the Web Interface (index.html) 

The live collage generator will start running in your browser.

## Additional Information ##
Preloaded Data:
The project comes with pre-scraped e-commerce images and pre-generated cutouts,
allowing you to immediately run the collage generator without additional steps.

Output:
To create your own dataset:
1. Run product_scraper.py to scrape product links.
2. Run download_product_images.py to download images.
3. Run cutout.py to generate cutouts.

Structure:
- product_scraper.py: Scrapes product links into product_links.json.
- download_product_images.py: Downloads images into folders by product.
- cutout.py: Generates cutouts from the downloaded images.
- collage_maker.py: Creates collages as saved images.
- collage_server.py + index.html: Generates live collages in the browser.