 ## Goal

 Build the `/editor` home screen and add peoject dialogs/sidebar actions. No API calls or persistence yet.

 ## Editor Home

 Reuse the existing editor layout. Do not modify the navbar or sidebar behavior.

 in the center of the page, add:

 - heading: `Create a project or open an existing one`
 - description: `Start a new archetecture workspace, or choose a project from the sidebar.`
 - `New Project` button with a `Plus` icon

 Keep the layout minimal. Do not wrap this content in cards.

 Clicking `New Project` should open the Create Project dialog.

 ## Dialogs

 ### Create Project

 - project name input
 - live slug preview based on the name
 - preview updates as the user types

 ### Rename Project

 - prefilled project name input
 - Current project name shown in the description
 - Input auto-focuses
 - Enter submits

 ### Delete Project

 - Destructive confirmation only
 - no input
 - confirm button uses destructive styling
 - no input
 - confirm button uses destructive styling

 ## Sidebar

 Add project item actions:

 - rename
 - delete

 Show actions only for owned projects,

 Hide actions for shared/collaborator projects.

 on mobile:

 - tapping outside the sidebar closes it
 - add a backdrop scrim 

 ## Implementation

 Create a dedicated hook to manage:

 - Dialog state
 - Form state
 - loading state

 Wire:

 - Editor home `New Project` -> Create dialog
 - Sidebar create -> Create dialog
 - Sidebar rename -> Rename dialog
 - Sidebar delete -> Delete dialog

 Use mock project data only. Do not add API calls or persistence.

 ## Check when done

 - Sidebar actions are wired
 - Slug preview works
 - no Typescript errors
 - no lint errors