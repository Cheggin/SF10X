# SFGovTV++ : SF10X Hackathon


Running frontend locally: 
- cd into ~/SF10X/frontend
- run 'npm run dev' in the terminal
- vite automatically hosts the site on localhost:5173. Pushing changes to main will update the Vercel website.
  
Currently, videos are stored locally (~7GB average). We plan on either (a) embedding videos which may cause us to lose functionality, or (b) download all of the videos via AWS EC2 and S3 storage
