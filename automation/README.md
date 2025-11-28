# Template Monitoring Automation System

This system automates the discovery, evaluation, and tracking of problem-solving templates. It monitors for new templates, evaluates their relevance to modern industry challenges, adds high-quality templates to a Notion database, and sends email notifications.

## 📂 Directory Structure

```
automation/
├── .env.automation           # API keys and configuration secrets
├── config.json               # Evaluation criteria and settings
├── email-template.html       # HTML template for email notifications
├── notion-schema.json        # Notion database structure definition
├── template-evaluator.js     # Standalone evaluation script (for testing)
├── template-monitor-workflow.json # n8n workflow definition
└── README.md                 # This file
```

## 🚀 Setup Instructions

### 1. Prerequisites
- **n8n**: You need a running instance of n8n (local or cloud).
- **Notion Integration**: A Notion integration token with access to your workspace.
- **SMTP Server**: Access to an SMTP server (e.g., Gmail) for sending emails.

### 2. Configuration
1.  **Environment Variables**:
    The `.env.automation` file contains your credentials. Ensure these are securely managed.
    *Note: For n8n, you will manually configure credentials in the UI, but this file serves as a reference.*

2.  **Notion Database**:
    - Ensure a database exists with the ID `2b684cce9ecb80c7b597c3af12116a36`.
    - The database must match the schema defined in `notion-schema.json`.
    - **Important**: Share the database with your Notion Integration (via the "..." menu > Connections).

3.  **n8n Workflow Import**:
    - Open your n8n dashboard.
    - Go to **Workflows** > **Import from File**.
    - Select `automation/template-monitor-workflow.json`.
    - The workflow will appear in your editor.

### 3. Credential Setup in n8n
The imported workflow has placeholder credential IDs. You need to set them up:
1.  **Notion**:
    - Double-click the "Create Notion Entry" node.
    - Under "Credential for Notion API", select "Create New".
    - Paste your `NOTION_TOKEN` from `.env.automation`.
2.  **SMTP (Email)**:
    - Double-click the "Send Email" node.
    - Under "Credential for SMTP", select "Create New".
    - Enter the SMTP details from `.env.automation`:
        - Host: `smtp.gmail.com`
        - Port: `587`
        - User: `sk143sathya@gmail.com`
        - Password: `vdna afbo uiqe ydtc` (App Password)
        - SSL/TLS: StartTLS

### 4. Running the System
- **Active**: Toggle the "Active" switch in the top right of the n8n workflow to start listening for webhooks.
- **Testing**:
    - Click "Execute Workflow" in n8n.
    - Send a POST request to the webhook URL (shown in the Webhook node).
    - **Sample Payload**:
      ```json
      {
        "name": "Microservices API Gateway",
        "description": "A pattern for managing microservices traffic.",
        "problemSolved": "Solves complexity in distributed systems.",
        "useCase": "E-commerce platforms",
        "features": ["Rate Limiting", "Auth"],
        "category": "Software Architecture",
        "source": "https://github.com/example/repo"
      }
      ```

## 🛠 Customization
- **Evaluation Logic**: Modify `config.json` to change keywords, industries, or scoring weights. Note that for the n8n workflow, you currently need to update the JavaScript code in the "Evaluate Template" node if you change the logic significantly, as it embeds the config for portability.
- **Email Template**: Edit `email-template.html` to change the look and feel of the notifications.

## 📊 Evaluation Criteria
Templates are scored (0-100) based on:
1.  **Modern Tech Alignment** (30%): Keywords like AI, Cloud-native, CI/CD.
2.  **Problem Clarity** (25%): How clearly the problem is defined.
3.  **Broad Applicability** (25%): Usability across different contexts.
4.  **Industry Relevance** (20%): Alignment with key sectors (Healthcare, Finance, etc.).

*Threshold*: Templates with a score < 65 are automatically filtered out.
