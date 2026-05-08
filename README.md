# ClearRead

ClearRead is a Chrome browser extension prototype for reading accessibility. It helps users adjust webpage text so reading can feel clearer and more comfortable.

This project was made for a Human-Computer Interaction final project. The focus is on the design and development process, not on making a fully finished Chrome Web Store extension.

## Features

- Apply reading changes to selected text or the full page
- Change the font
- Change font size
- Change line height
- Change word spacing
- Change letter spacing
- Preview settings before applying them
- Use text-to-speech with an adjustable speed
- Save previous popup settings
- Revert applied changes

## Settings

### Reading Mode

**Selection** changes only the text the user highlights on the page.

**Full Page** changes the whole webpage body.

### Text-to-Speech

When Text-to-Speech is turned on, ClearRead can read the selected text or page text aloud. The speed slider controls how fast the text is spoken.

### Font

The font dropdown lets the user choose from common fonts such as Arial, Calibri, Century Gothic, Futura, Helvetica, Tahoma, and Verdana.

The Default option means ClearRead will use whatever font the page already has.

### Font Size

The user can keep the page's default font size or enter a custom size in pixels.

### Line Height

Line height changes the vertical space between lines of text.

### Word Spacing

Word spacing changes the space between words.

### Letter Spacing

Letter spacing changes the space between letters.

### Preview

The preview sentence shows what the current settings may look like before applying them to the webpage.

## How to Install From GitHub

1. Go to the ClearRead GitHub repository:
   [https://github.com/russabejr/ClearRead/](https://github.com/russabejr/ClearRead/)

2. Click the green **<span style="color:green">Code</span>** button.

3. Click **Download ZIP**.

4. Unzip the downloaded file.

5. Open Google Chrome.

6. Go to:
   `chrome://extensions`

7. Turn on **Developer mode** in the top right.

8. Click **Load unpacked**.

9. Select the unzipped ClearRead folder.

10. The ClearRead extension should now appear in Chrome.

## How to Use

1. Open a normal webpage.

2. Click the ClearRead extension icon.

3. Choose Selection or Full Page mode.

4. Pick the reading settings you want.

5. Use the preview to check the settings.

6. Click **<span style="color:DodgerBlue">Apply</span>**.

7. Click **Revert** to undo the changes.

## Notes

- Some webpages may override styles in different ways, so results can vary.
- Refreshing a page removes the applied ClearRead changes because the changes are added to the current page after it loads.
- Changes do not stay across pages and throughout browsing, they must be applied every time when entering a webpage.
- This is a prototype made for learning and demonstration, so bugs are expected.
