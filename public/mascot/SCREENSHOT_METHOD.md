# 📸 Screenshot Method - Easiest Way!

## Step-by-Step Instructions

### 1. Open Your Sprite Sheet
- Open the sprite sheet image on your computer
- Make sure you can see all 8 poses clearly

### 2. Take Screenshots of Each Pose

For each pose, follow these steps:

#### Pose 1: Idle (Top Left)
- Select the top-left robot (standing, arms down, smile)
- Take screenshot or crop to just that robot
- Save as: `focusai_idle.png`

#### Pose 2: Wave (Top Middle)
- Select the top-middle robot (waving gesture)
- Save as: `focusai_wave.png`

#### Pose 3: Help (Top Right)
- Select the top-right robot (arms out, questioning)
- Save as: `focusai_help.png`

#### Pose 4: Flip (Middle Right)
- Select the middle-right robot (upside down/handstand)
- Save as: `focusai_flip.png`

#### Pose 5: Happy (Bottom Left)
- Select the bottom-left robot (arms out, welcoming)
- Save as: `focusai_happy.png`

#### Pose 6: Idea (Bottom Middle)
- Select the bottom-middle robot (holding lightbulb)
- Save as: `focusai_idea.png`

#### Pose 7: Read (Bottom Right)
- Select the bottom-right robot (holding book)
- Save as: `focusai_read.png`

#### Pose 8: Neutral (if exists)
- If there's an 8th pose, save as: `focusai_neutral.png`
- If not, you can duplicate one of the others or skip it

### 3. Save All Files Here

**Location:** `/Users/eromonselemarvelous/focusmate-app/frontend/public/mascot/`

**Exact file names (must match exactly):**
- `focusai_idle.png`
- `focusai_wave.png`
- `focusai_help.png`
- `focusai_flip.png`
- `focusai_happy.png`
- `focusai_idea.png`
- `focusai_read.png`
- `focusai_neutral.png`

### 4. Tips for Best Results

- **Crop tightly** around each robot (remove extra space)
- **Keep transparent background** if possible (PNG supports transparency)
- **Make sure each image is square or close to square** (the component will scale it)
- **High resolution is better** - the component will resize as needed

### 5. Verify

After saving all 8 files, check:
```bash
cd frontend/public/mascot
ls -la focusai_*.png
```

You should see all 8 files listed!

## That's It! 🎉

Once the files are in place, the mascot will automatically appear across your entire app with the exact design you showed me!

