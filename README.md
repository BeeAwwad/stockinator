<img width="1056" height="190" alt="Screenshot 2026-02-25 105240" src="https://github.com/user-attachments/assets/47d48e51-261c-4a6e-b5b9-00d56d4390f8" />

Technologies: Vite React, Typscript, Supabase, tailwindcss.
# Stockinator

**Inventory management application App**

[![Live Demo](https://img.shields.io/badge/demo-live-red.svg)](https://stockinator.vercel.app/)
[![React.js](https://img.shields.io/badge/-ReactJs-61DAFB?logo=react&logoColor=white&style=for-the-badge)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-green)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-blue)](https://tailwindcss.com/)

## Project Overview

**Stockinator** I built this application becuase of my aunt, she wanted to an application that she could use to mange stock intentory of what she sold. She wanted to know what gets sold, when it gets sold and what transaction the sale is from.
So I solved this problem by using supabase as my baas where I can store the data for the products, transactions, businesses, profiles, users, vendors and invites. I used rpcs mostly to add to these tables to avoid any security risks and I add rls to each tables just in case.
On the frontend I used react, tailwind, react-query and zustand, react-hook-form, zod on the frontend. the most interesting thing I did on the frontend was combining multiple products into one transaction and also storing data in the cache and the organzing it so it can get diplayed on a chart.

- The home page whick is only accessed by the owner shows data relevant to the business, like a chart that shows the revenue that happens daily, monthly and yearly. and an invite vendor component to invite a maximum of two vendors to your business.
- The product page shows all the products that are in the bussiness and also a form to add a new product if you're an owner.
- The Transactions page shows all the transactions that were made to buy a product(s) and a from available to the vendor and owner to add transactions.
- The Create Business page available to newly created users that aren't accociated with any business.
- The Setting page allows you to update your profile info like your username and also if your an owner you can delete a business.

### Pages:

- **Dashboard:** Shows the total revenue, total product, total profit, chart of the total revenue, profit for product over set time period and an email form to invite a vendor.
 <img width="1899" height="870" alt="Screenshot 2026-02-25 101243" src="https://github.com/user-attachments/assets/9ae2448b-5e17-4062-9185-3a898cb0c88e" />

- **Products:** Shows products and add products form.
<img width="1892" height="869" alt="Screenshot 2026-02-25 101505" src="https://github.com/user-attachments/assets/99bcfc26-821c-49db-bfdc-40dfb037e130" />

- **Transactions:** Shows all transactions in decending order and the transaction form.
<img width="1900" height="871" alt="Screenshot 2026-02-25 101653" src="https://github.com/user-attachments/assets/342b3c6e-2117-4541-9593-1b359ee2a726" />

- **Notifications:** Invites to users that aren't in a business will be shown here.
<img width="1920" height="868" alt="Screenshot 2026-02-25 103007" src="https://github.com/user-attachments/assets/dd90ddc0-423a-402f-8474-6fbda7c6fa8a" />

- **Settings:** Edit profile form and delete business button that's available to just business owners.
<img width="1920" height="871" alt="Screenshot 2026-02-25 102003" src="https://github.com/user-attachments/assets/7f22d8c3-fbc2-4863-88b2-56e5cf11a7b4" />

---



## Tech Stack

- **Library:** React.js
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Backend/Database:** Supabase (PostgreSQL)
- **State Management:** React Query / Context API
- **Deployment:** Vercel

---

## What I Learnt
- **Backend Database:** This project was my introduction what it's like having a backend, even though it was a Baas (supabase). I got introduced to rls, rpc functions, tables connecting to each other (relation database).
- **React Query:** I also learned to use react query to fetch data. It also solved the issue of having to refetch data whenever I change to other pages without using the context api.
  
---

