# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/98be4658-9b1c-4df9-8b8b-b66d9912ad4b

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/98be4658-9b1c-4df9-8b8b-b66d9912ad4b) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- React Query (TanStack Query)
- React Hook Form
- Recharts

## API Integration

This project integrates with the Projekanda API for assessment functionality:

### Submit Answers API
- **Endpoint**: `POST https://projekanda.top/submit_answers`
- **Purpose**: Submit user answers for assessment
- **Request Format**:
```json
{
  "user_id": "string",
  "mcq_id": "string", 
  "answers": {
    "1": "Agree",
    "2": "Strongly Agree",
    // ... more answers
  }
}
```

### Get Results API
- **Endpoint**: `GET https://projekanda.top/get_result_by_id?result_id={result_id}`
- **Purpose**: Fetch detailed assessment results
- **Response**: Includes percentage score, analysis breakdown, and performance metrics

### Features
- **Real-time submission**: Answers are submitted to the API when user completes the test
- **Detailed results**: Shows percentage score, total points, and skill analysis
- **Error handling**: Graceful error handling with user-friendly messages
- **Loading states**: Visual feedback during API calls

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/98be4658-9b1c-4df9-8b8b-b66d9912ad4b) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
