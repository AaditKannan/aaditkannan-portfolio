# Wix Editor Implementation Instructions

## Overview
This guide provides step-by-step instructions for redesigning your existing `/resume` page in Wix Editor with the scroll-driven animation system. We'll reuse your existing content and reorganize it into full-screen sections.

## Prerequisites
- Access to Wix Editor
- Dev Mode enabled (for Velo code)
- Existing `/resume` page with content

---

## Step 1: Page Setup & Preparation

1. **Navigate to Resume Page**
   - Go to Pages → Resume
   - Click "Edit Page"

2. **Set Page Background**
   - Click on page background (empty area)
   - In Properties panel → Design → Background
   - Set color to **#000000** (black)
   - Click "Apply"

3. **Take Inventory of Existing Elements**
   - Note which text elements contain:
     - "RESUME" heading
     - About paragraph
     - Education content
     - Experience entries
     - Projects
     - Volunteer work
     - Skills
     - Contact info (email, phone)
   - We'll reuse these elements, just reorganize and restyle them

4. **Backup Note (Optional)**
   - Take screenshots or note current layout if you want to reference it later

---

## Step 2: Create Section Containers (Full-Screen Strips)

We'll create 7 full-screen Strips to contain all content. Existing content will be moved into these sections.

### Create All 7 Strips First

1. **Add First Strip (Overview)**
   - Click "+ Add" → "Strip"
   - Drag to top of page (above all existing content)

2. **Configure Strip Settings**
   - Select the Strip
   - Properties panel → Settings:
     - **Height**: 100vh (Viewport Height)
   - Properties panel → Design:
     - **Background**: #000000 (black)
   - Properties panel → Layout:
     - **Padding**: 
       - Top: 80px
       - Bottom: 80px
       - Left: 120px
       - Right: 120px
   - Properties panel → Settings → Element ID: **secOverview**

3. **Create Remaining 6 Strips**
   - Repeat step 1-2 for each section
   - Stack them vertically (one after another)
   - Element IDs: `secEducation`, `secExperience`, `secProjects`, `secVolunteering`, `secSkills`, `secCTA`
   - All with same settings: 100vh height, black background, same padding

**Note:** Don't worry about content yet - we'll move existing elements into these Strips next.

---

## Step 3: Create/Update Heading Elements

For each section, we'll either reuse existing headings or create new ones.

### Overview Section Heading

1. **Find or Create Heading**
   - **Option A:** If you have a "RESUME" heading, we'll change it to "AADIT KANNAN"
   - **Option B:** Create new Text element inside `#secOverview` Strip
   - Type: **AADIT KANNAN**

2. **Style Heading**
   - Select the text element
   - Properties panel → Text:
     - **Font**: Choose bold, modern font (e.g., Montserrat Bold, Poppins Bold)
     - **Size**: 64px (Desktop), 48px (Tablet), 36px (Mobile)
     - **Color**: #FFFFFF (white)
     - **Weight**: Bold
     - **Alignment**: Left
   - Properties panel → Settings → Element ID: **hOverview**

3. **Position Heading**
   - Drag into `#secOverview` Strip
   - Position at top-left of section

### Education Section Heading

1. **Find Existing "EDUCATION" Heading**
   - Look for the text element that says "Education"
   - Or create new Text element inside `#secEducation` Strip
   - Text: **EDUCATION**

2. **Style and Assign ID**
   - Apply same styling as Overview heading
   - Element ID: **hEducation**

3. **Repeat for Remaining Sections**
   - Find or create headings for each section
   - Move them into their respective Strips
   - Element IDs: `hExperience`, `hProjects`, `hVolunteering`, `hSkills`, `hCTA`
   - Text content:
     - `hExperience`: "EXPERIENCE"
     - `hProjects`: "PROJECTS"
     - `hVolunteering`: "LEADERSHIP & VOLUNTEERING" (or "VOLUNTEER WORK" if that's what you have)
     - `hSkills`: "SKILLS"
     - `hCTA`: "LET'S CONNECT"

---

## Step 4: Add Subheading Elements

Add new subheadings below each main heading (these are new elements):

### Overview Subheading

1. **Add Text Element**
   - Inside `#secOverview` Strip, below `#hOverview`
   - Click "+ Add" → "Text"
   - Type: **Mechanical Engineering Student**

2. **Style Subheading**
   - Properties panel → Text:
     - **Font**: Same as heading, but Regular weight
     - **Size**: 24px (Desktop), 20px (Tablet), 18px (Mobile)
     - **Color**: #CCCCCC (light gray)
     - **Weight**: Regular
   - Properties panel → Settings → Element ID: **subOverview**

3. **Repeat for All Sections**
   - Create subheadings in each section's Strip
   - Element IDs: `subEducation`, `subExperience`, `subProjects`, `subVolunteering`, `subSkills`, `subCTA`
   - Content:
     - `subEducation`: "Academic Journey"
     - `subExperience`: "Professional & Leadership"
     - `subProjects`: "Engineering & Innovation"
     - `subVolunteering`: "Community Impact"
     - `subSkills`: "Technical Expertise"
     - `subCTA`: "Get in Touch"

---

## Step 5: Reorganize Body Content

Move existing content into the appropriate sections and assign IDs. This is where we reuse your existing content!

### Overview Body Content

1. **Find Your About Paragraph**
   - Locate the text element with your about/description paragraph
   - It should start with "Mechanical engineering student at UC Berkeley..."

2. **Move and Style**
   - Drag this element into `#secOverview` Strip (below subheading)
   - Properties panel → Text:
     - **Font**: Regular, readable font (e.g., Open Sans, Lato)
     - **Size**: 16px (Desktop), 14px (Mobile)
     - **Color**: #E0E0E0 (light gray)
     - **Line Height**: 1.6
     - **Weight**: Regular
   - Properties panel → Settings → Element ID: **bodyOverview**

3. **Add Contact Info**
   - Find your existing email/phone text elements
   - Move them into `#secOverview` Strip (below about paragraph)
   - Or create new text/button elements:
     - "Email: aaditkannan@berkeley.edu" (link to mailto:)
     - "Phone: +1 (734) 546-0380" (link to tel:)
     - "LinkedIn" (link to LinkedIn profile)
     - "Download PDF" (link to resume PDF)
   - Style them consistently with body text

### Education Body Content

1. **Find Education Content**
   - Locate text elements containing:
     - UC Berkeley information
     - Santa Clara High School information
   - These might be in separate text elements or one combined element

2. **Move and Style**
   - Drag all education content into `#secEducation` Strip
   - If multiple elements, you can combine them or keep separate
   - Select the main education content element
   - Properties panel → Text:
     - Same styling as Overview body (16px, #E0E0E0, line-height 1.6)
   - Properties panel → Settings → Element ID: **bodyEducation**
   - Ensure bullet points are formatted properly

### Experience Body Content

1. **Find Experience Entries**
   - Locate all experience content:
     - Formula Electric
     - Robotics (FIRST)
     - SLI
     - Pear Volunteering
     - Bay Club
     - Posha Robotics
   - These might be in one large text element or multiple elements

2. **Move and Style**
   - Drag all experience content into `#secExperience` Strip
   - If it's one element, assign ID: **bodyExperience**
   - If multiple, you can combine or keep the main one as `bodyExperience`
   - Apply same body text styling
   - Ensure proper spacing between entries

### Projects Body Content

1. **Find Projects Section**
   - Locate content for:
     - Inventry
     - Circuit Minds
     - Construction Acclimation Regulation
     - Friendly Fires
     - Prototype Ø Flood

2. **Move and Style**
   - Drag into `#secProjects` Strip
   - Element ID: **bodyProjects**
   - Apply body text styling

### Volunteering Body Content

1. **Find Volunteer Work Section**
   - Locate content for all volunteer entries:
     - 49ers STEM Leadership Institute
     - Family Supportive Housing
     - Tulip Kids Afterschool
     - California Scholarship Federation
     - FIRST Tech Challenge

2. **Move and Style**
   - Drag into `#secVolunteering` Strip
   - Element ID: **bodyVolunteering**
   - Apply body text styling

### Skills Body Content

1. **Find Skills Section**
   - Locate your skills content (Mechanical Engineering + Software Development)

2. **Move and Style**
   - Drag into `#secSkills` Strip
   - Element ID: **bodySkills**
   - Apply body text styling
   - If you want two columns, you can:
     - Keep as single text element with two sections, OR
     - Split into two text elements side-by-side

### CTA Body Content

1. **Create CTA Section**
   - Inside `#secCTA` Strip, add button elements or text links:
     - "Download PDF" (link to resume PDF)
     - "Email Me" (mailto link)
     - "LinkedIn" (LinkedIn profile link)

2. **Style Buttons**
   - White text (#FFFFFF)
   - Transparent or subtle border
   - Hover effects (optional)
   - Element ID: **bodyCTA** (on container or main button)

---

## Step 6: Add Section Index (Optional Progress Indicator)

1. **Add Container**
   - Click "+ Add" → "Container"
   - Position: Fixed, Right side of page
   - Properties panel → Settings → Element ID: **sectionIndex**

2. **Style Container**
   - Width: 40px
   - Height: Auto
   - Position: Fixed
   - Right: 40px
   - Top: 50% (centered vertically)
   - Background: Transparent

3. **Add Dot Elements**
   - Inside container, add 7 Button or Shape elements
   - Shape: Circle
   - Size: 8px diameter
   - Color: White (#FFFFFF)
   - Opacity: 0.3 (initial)
   - Element IDs: `dotOverview`, `dotEducation`, `dotExperience`, `dotProjects`, `dotVolunteering`, `dotSkills`, `dotCTA`

4. **Arrange Dots**
   - Stack vertically with spacing (20px between dots)
   - Align center

---

## Step 7: Add Velo Code

1. **Enable Dev Mode**
   - Top menu → "Dev Mode" → Enable

2. **Open Page Code**
   - Click "Page Code" in left sidebar
   - Or: Pages → Resume → "Code" tab

3. **Paste Velo Code**
   - Copy entire contents of `velo-code.js`
   - Paste into the code editor
   - Save (Ctrl+S / Cmd+S)

4. **Test**
   - Click "Preview" to test animations
   - Scroll through page to verify scramble reveals work

---

## Step 8: Responsive Adjustments

### Desktop (>1024px)
- No changes needed (default settings)

### Tablet (768px - 1024px)
- Adjust padding: 80px horizontal, 60px vertical
- Heading size: 48px
- Body text: 15px

### Mobile (<768px)
- Adjust padding: 40px horizontal, 60px vertical
- Heading size: 36px
- Body text: 14px
- Hide or simplify section index (set opacity to 0 or hide)

**To set responsive styles:**
1. Select element
2. Properties panel → "Responsive" tab
3. Choose breakpoint (Tablet/Mobile)
4. Adjust sizes/padding

---

## Step 9: Final Polish

1. **Test Scroll Animations**
   - Preview page
   - Scroll slowly through each section
   - Verify scramble animations trigger
   - Check section index updates

2. **Check Performance**
   - Open browser DevTools → Performance tab
   - Record while scrolling
   - Verify 60fps smooth scrolling

3. **Content Review**
   - Verify all text is readable
   - Check spacing and alignment
   - Ensure no text overflow

4. **Publish**
   - Click "Publish" when ready
   - Test on live site

---

## Troubleshooting

### Animations Not Triggering
- Check element IDs match exactly (case-sensitive)
- Verify Velo code is saved
- Check browser console for errors
- Ensure sections are at least 100vh height

### Performance Issues
- Reduce animation duration in Velo code
- Disable scramble on mobile for long text
- Check for too many elements on page

### Layout Issues
- Verify Strip heights are set to 100vh
- Check padding values
- Ensure responsive breakpoints are set

### Section Index Not Updating
- Verify dot element IDs match
- Check section container IDs
- Ensure scroll listener is working

---

## Element ID Reference

### Required IDs (must match exactly):
- Sections: `secOverview`, `secEducation`, `secExperience`, `secProjects`, `secVolunteering`, `secSkills`, `secCTA`
- Headings: `hOverview`, `hEducation`, `hExperience`, `hProjects`, `hVolunteering`, `hSkills`, `hCTA`
- Subheadings: `subOverview`, `subEducation`, `subExperience`, `subProjects`, `subVolunteering`, `subSkills`, `subCTA`
- Body: `bodyOverview`, `bodyEducation`, `bodyExperience`, `bodyProjects`, `bodyVolunteering`, `bodySkills`, `bodyCTA`
- Section Index (optional): `sectionIndex`, `dotOverview`, `dotEducation`, `dotExperience`, `dotProjects`, `dotVolunteering`, `dotSkills`, `dotCTA`

---

## Content Reference

See `content-mapping.md` for detailed content structure for each section.

---

## Quick Reference: What to Move Where

### Overview Section (`#secOverview`)
- About/description paragraph → `#bodyOverview`
- Contact info (email, phone) → Keep in Overview
- Heading: "AADIT KANNAN" → `#hOverview`

### Education Section (`#secEducation`)
- UC Berkeley content → `#bodyEducation`
- High School content → `#bodyEducation`
- Heading: "EDUCATION" → `#hEducation`

### Experience Section (`#secExperience`)
- All 6 experience entries → `#bodyExperience`
- Heading: "EXPERIENCE" → `#hExperience`

### Projects Section (`#secProjects`)
- All 5 project entries → `#bodyProjects`
- Heading: "PROJECTS" → `#hProjects`

### Volunteering Section (`#secVolunteering`)
- All volunteer work entries → `#bodyVolunteering`
- Heading: "LEADERSHIP & VOLUNTEERING" or "VOLUNTEER WORK" → `#hVolunteering`

### Skills Section (`#secSkills`)
- Skills lists → `#bodySkills`
- Heading: "SKILLS" → `#hSkills`

### CTA Section (`#secCTA`)
- Action buttons (PDF, Email, LinkedIn) → `#bodyCTA`
- Heading: "LET'S CONNECT" → `#hCTA`

---

## Tips for Reorganizing

1. **Work Section by Section**: Complete one section fully before moving to the next
2. **Use Layers Panel**: Helps find elements when page gets complex
3. **Group Related Elements**: You can group elements within a section for easier management
4. **Delete Old Layout Elements**: Once content is moved into Strips, you can delete old containers/strips that are no longer needed
5. **Test as You Go**: Preview frequently to see how sections look

