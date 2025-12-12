# Quick Start Guide - How to Open the Site

## Step 1: Open Terminal/Command Prompt

**On Windows:**
- Press `Windows Key + R`
- Type `cmd` and press Enter
- OR press `Windows Key + X` and select "Terminal" or "PowerShell"

**On Mac:**
- Press `Cmd + Space` (Spotlight)
- Type "Terminal" and press Enter
- OR go to Applications → Utilities → Terminal

## Step 2: Navigate to Your Project Folder

In the terminal, type:

```bash
cd C:\Dev\aaditkannancom
```

(Or wherever your project folder is located)

Press Enter.

## Step 3: Install Dependencies (First Time Only)

Type this command and press Enter:

```bash
npm install
```

Wait for it to finish (might take 30-60 seconds).

## Step 4: Start the Server

Type this command and press Enter:

```bash
npm run dev
```

## Step 5: Open in Browser

After running `npm run dev`, you should see something like:

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

**The site should automatically open in your browser!**

If it doesn't, manually open your browser and go to:
```
http://localhost:3000
```

## That's It! 🎉

The site is now running. You can:
- Edit files and see changes instantly (hot reload)
- Scroll through your resume
- See the animations in action

## To Stop the Server

Press `Ctrl + C` in the terminal.

## Troubleshooting

### "npm is not recognized"
- You need to install Node.js first
- Go to: https://nodejs.org/
- Download and install the LTS version
- Restart your terminal after installing

### "Port 3000 is already in use"
- Another app is using port 3000
- Close that app, or
- Edit `vite.config.js` and change `port: 3000` to `port: 3001`

### Still stuck?
- Make sure you're in the right folder (should see `package.json` file)
- Try `npm install` again
- Check that Node.js is installed: `node --version`

