# TODO: Add Forget Password Functionality

- [x] Add state for forgot password mode in app/login/page.js
- [x] Add "Forgot Password?" link in sign-in form
- [x] Implement forgot password form UI with email input
- [x] Add handleForgotPassword function using supabase.auth.resetPasswordForEmail
- [x] Update form rendering logic to show forgot password form when in that mode
- [x] Add back button or link to return to sign-in from forgot password
- [x] Handle success/error messages for forgot password
- [x] Test the functionality
- [x] Refactor to use single mode state instead of multiple boolean states

# TODO: Create Super Admin Page

- [x] Create app/admin/super/page.js with login form
- [x] Implement static login credentials (superadmin / superadmin@123)
- [x] Create app/api/get-all-users/route.js API endpoint with service role key
- [x] Update page to fetch all users via API after login
- [x] Display users in a table
