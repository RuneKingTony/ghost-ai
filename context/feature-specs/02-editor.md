We need the base chrome components that frame ever editor screen - the top navbar and the left sidebar shell. These will be reused to extend in every chapter that follows.

### Editor Navbar

create `components/editor/editor-navbar.tsx`.

Requirements:

- fixed-height top navbar
- left, center, and right sections
- left section contains sidebar toggle button
- use `PanelLeftOpen` / `PanelLeftClose` icons based on sidebar state
- right section stays empty for now
- Dark background with subtle bottom border.

### Project Sidebar

Create `components/editor/project-sidebar.tsx`

Requirements:

- Sidebar should float above the editor canvas
- Opening it should not push page content
- slides from the left
- accepts `isOpen` prop
- header with `Projects` title + close button
- shadcn `Tabs`:
 - My Projects
 - Shared
- both tabs show empty placeholder state
- full-width `New Project` button at the bottom with `Plus` icon 


### Dialog Pattern 

Use the existing color tokens from `globals.css` for dialog styling.

Support:

- Title
- description 
- footer actions

Do not build actual dialogs yet

### Check when done

- New components compile without Typescript errors
- no lint errors
- Dialog pattern is ready for future use