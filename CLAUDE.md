# Recipe Finder

## Overview
A full-stack recipe finder app where users can search recipes using TheMealDB API, save favorites to their account, and manage their saved recipes.

## Tech Stack
- Next.js (App Router) + TypeScript + Tailwind CSS
- Clerk for authentication
- Supabase for database
- TheMealDB API for recipe data

## Data Model
- Supabase `favorites` table: id, user_id (from Clerk), meal_id (from API), meal_name, meal_thumbnail, category, area, saved_at
- External API provides: recipe search, recipe details, categories, areas

## Style Preferences
- Clean, modern UI with warm food-related colors
- Responsive design
- Clear navigation between search and saved recipes
