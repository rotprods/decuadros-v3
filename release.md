# Release & Deployment Protocol

## Deployment Steps
1.  **Database Migration**:
    ```bash
    npx prisma db push
    ```
2.  **Build**:
    ```bash
    npm run build
    ```
3.  **Deploy (Vercel)**:
    ```bash
    vercel --prod
    ```

## Rollback Plan
- Revert commit in Git.
- Redeploy previous deployment via Vercel Dashboard.
- Database: If destructive changes were made, restore from Supabase backup (PITR).
