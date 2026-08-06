Add a  `Share` button to the editor navbar that opens the share dialog.

Owners can : 

- Invite collaborators by email
- View current collaborators
- remove collaborators
- copy the project link with temporary `Copied!` feedback

Collaborators can:

- View the collaborator list only
- not invite, remove, or manage access

## Clerk user data

Collaborators are stored by email in the database.

Use Clerk Backend API to enrich collaborator emails with:

- display name
- avatar image

If a clerk user is not found for an email, fall back to showing the email only.

## Implementation

Add the required API logic for:

- Listing collaborators
- Inviting collaborators 
- Removing collaborators

Enforce ownership server-side for invite and remove actions.

Do not add a local user table. 

## Check when done 

- Share dialog opens from the workspace
- Owners can invite and remove collaborators
- Collaborators see read-only access
- Collaborator names/avatars load from clerk when available
- `npm run build` passes
