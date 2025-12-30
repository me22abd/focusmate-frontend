# 🎨 Remove White Background from Mascot Images

This guide will help you remove white backgrounds from the mascot PNG files so they blend seamlessly with your app.

## Method 1: Automated Script (Recommended)

### Step 1: Install Sharp (Image Processing Library)

```bash
cd frontend
npm install sharp
```

### Step 2: Run the Script

```bash
cd public/mascot
node remove-white-background.js
```

### Step 3: Review & Replace

1. Check the processed images in the `processed/` folder
2. If they look good, replace the originals:
   ```bash
   cp processed/*.png .
   ```
3. Or manually copy the files you want to keep

---

## Method 2: Online Tool (Easiest - No Code)

### Option A: Remove.bg (Free Tier Available)
1. Go to https://www.remove.bg/
2. Upload each mascot PNG file
3. Download the result (transparent background)
4. Save it with the same filename in `/public/mascot/`

### Option B: Photopea (Free, Browser-Based)
1. Go to https://www.photopea.com/
2. Open your mascot PNG file
3. Use the **Magic Wand Tool** (W key) to select white background
4. Press **Delete** to remove white pixels
5. Go to **File → Export As → PNG**
6. Make sure "Transparency" is checked
7. Save with the same filename

### Option C: Canva (Free)
1. Go to https://www.canva.com/
2. Upload your mascot image
3. Use the **Background Remover** tool
4. Download as PNG with transparency
5. Save with the same filename

---

## Method 3: Manual with Preview (Mac) or GIMP (Windows/Linux)

### Mac Preview:
1. Open the PNG file in Preview
2. Click **Markup Toolbar** (pencil icon)
3. Use **Instant Alpha** tool
4. Click and drag on white areas to select
5. Press **Delete**
6. Save as PNG

### GIMP (Free, All Platforms):
1. Open the PNG file
2. Use **Fuzzy Select Tool** (U key)
3. Click on white background
4. Press **Delete**
5. **File → Export As → PNG**
6. Make sure "Save color values from transparent pixels" is checked

---

## After Removing Backgrounds

Once all 8 mascot files have transparent backgrounds:

1. **Test locally:**
   ```bash
   cd frontend
   npm run dev
   ```
   Check that mascot blends with app background

2. **Commit and push:**
   ```bash
   git add public/mascot/focusai_*.png
   git commit -m "fix: Remove white backgrounds from mascot images"
   git push origin main
   ```

3. **Vercel will auto-deploy** - mascot will blend perfectly! 🎉

---

## Troubleshooting

**If script fails:**
- Make sure `sharp` is installed: `npm install sharp`
- Check that all PNG files exist in `/public/mascot/`
- Try Method 2 (online tools) instead

**If images look weird:**
- The threshold might be too high/low - adjust in script (line 42)
- Try a different method (online tool)
- Some images might need manual touch-up

**If background isn't fully transparent:**
- Use an online tool like Remove.bg for better results
- Or manually edit with GIMP/Photoshop for precision

