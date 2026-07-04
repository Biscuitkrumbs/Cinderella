# Cinderella MVP Plan

## Goal

Build a simple visual planner Cindy can use every day for holiday rental cleaning.

The app must help Cindy see:

- what properties have guests staying
- who is checking out
- what needs cleaning
- what information is needed for the clean
- what needs to go onto an invoice later

## MVP Guardrails

Build small.

Do not redesign unless something blocks the MVP.

Do not add future features until the core workflow works.

The next feature should always make the app more useful for Cindy.

## Core Data

### Property

A property is a place Cindy cleans.

Each property stores:

- property name
- colour
- address
- access notes
- key notes
- king beds
- queen beds
- single beds
- cleaning notes

### Stay

A stay is a guest booking.

Each stay stores:

- property
- guest name
- arrival date
- departure date
- notes

### Clean

A clean is created from a stay checkout.

Each clean stores:

- property
- guest
- clean date
- completed yes/no
- king beds changed
- queen beds changed
- single beds changed
- extras
- invoice notes

## MVP Screens

### 1. Timeline

Shows properties down the side and dates across the top.

Must show:

- property colour
- guest stays
- checkout/clean points
- today

### 2. Property Manager

Cindy can add and edit properties.

Must include:

- name
- colour
- address
- access notes
- bed setup
- cleaning notes

### 3. Stay Manager

Cindy can add, edit, and delete stays.

Must include:

- property
- guest
- arrival
- departure
- notes

### 4. Complete Clean

Cindy can complete a clean.

Must include:

- bed counts
- extras
- notes for invoice

## Build Order

1. Property Manager
2. Stay Manager
3. Timeline cleanup
4. Complete Clean
5. Google Sheets save/load
6. Invoice data export

## Not MVP Yet

- AI
- route planning
- owner portal
- SMS reminders
- Airbnb import
- multiple cleaners
- reports
- photo uploads

001 Beds belong to Properties.

002 Cleans belong to Bookings.

003 Invoices come from Cleans.

004 Keys belong to Properties.

005 Timeline is the home screen.

006 Timeline displays. Editors edit.