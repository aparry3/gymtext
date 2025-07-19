# Cleanup

- Separate agents for
    - Plan
    - Mesocycles
    - Day message generation
    - Handle sms message (This is the biggest agent)

- Organize Repositories and Services
    - Repositories
        - db interactions for each table
    - Services
        - logic layer above repos

- Separate Prompts
    - Welcome Message
    - Plan outline
    - Mesocycle Breakdown
    - Daily Message
    - SMS Handler

- Clean Up Data Types
    - Layers
        - Prompt Schema/Type
        - System Data Model
        - Database Model
    - Separate Model Files and Logic (Service?)

- Consolidate Test Scripts

- Test files