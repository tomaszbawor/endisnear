# Game Flow Test Manual

## Overview
This document describes the complete game flow from main menu to gameplay.

## Test Steps

### 1. Main Menu (/)
- **URL**: `http://localhost:5173/`
- **Expected**: See "Hero Quest" title with menu buttons
- **Actions**:
  - Click "New Game" button

### 2. New Game Page (/newGame)
- **Expected**: See "New Game" title with 4 save slots
- **Actions**:
  - Click any save slot (e.g., "Slot 01")
  - Slot should highlight with amber border
  - Click "Continue" button

### 3. Hero Creation Page (/heroCreation?slot=0)
- **Expected**: See "Create Your Hero" title
- **Sections**:
  1. **Hero Name**: Input field for character name
  2. **Choose Your Class**: 3 cards (Warrior, Mage, Rogue)
  3. **Hero Summary**: Shows selected name, class, and slot
- **Actions**:
  - Enter a hero name (e.g., "TestHero")
  - Click on a class card (e.g., "Warrior")
  - Verify "Hero Summary" appears with entered data
  - Click "Start Adventure" button

### 4. Game Loop Page (/gameLoop)
- **Expected**: See the main game interface
- **Sections**:
  1. **Navigation Bar**: Top bar with Map, Inventory, Shop, Settings
  2. **Character Stats**: Left sidebar showing level, exp, and stats
  3. **Main Content**: Center area (default: Map view)
  4. **Equipment Panel**: Visible in Inventory view
- **Actions**:
  - Click "Inventory" to see equipment slots
  - Click "Shop" to see items for sale
  - Click "Settings" to see settings panel

## Success Criteria

✅ All navigation transitions work smoothly
✅ Hero name persists through to game loop
✅ Class selection updates stats display
✅ Game loop shows all UI components correctly
✅ No console errors during navigation

## Components Created

1. **HeroCreationPage** (`/src/pages/HeroCreation.tsx`)
   - Hero name input
   - 3 class options (Warrior, Mage, Rogue)
   - Each class has unique base stats
   - Summary card showing hero details

2. **Input Component** (`/src/components/ui/input.tsx`)
   - Reusable styled input component
   - Consistent with UI design system

## Routing Changes

- Added `/heroCreation` route
- NewGame page now navigates to hero creation with slot parameter
- Hero creation navigates to `/gameLoop` on completion

## Technical Notes

- Uses React Router with search params for slot ID
- Uses Effect atoms for local state management
- GameContainer provides consistent 1400x900 layout
- All pages wrapped in GameContainer for unified appearance
