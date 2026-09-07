# VenueFlow Exhibition & Trade Expo — Space Booking Platform

A high-performance, functional end-to-end exhibition floor map visualizer and stall booking platform architecture.

## Overview

This project provides a full-stack interactive booking engine for trade exhibitions and commercial expos.

### Key Capabilities
- **Interactive Floor Map**: Canvas/SVG floor plan with real-time availability states (`AVAILABLE`, `ON_HOLD`, `CONFIRMED`).
- **Atomic Booking Engine**: 30-minute temporary reservation lock preventing double bookings across concurrent users.
- **Payment & Evidence Verification**: WhatsApp receipt routing and payment reference review workflow.
- **Automatic Expiry & Conflict Management**: Automated background hold expiry with manual admin conflict resolution for late payments.
- **Operations Admin Portal (`/admin`)**: Protected management dashboard for real-time stall management, manual booking creation, mock email logs, and complete audit trail.

## Getting Started

### Requirements
- Node.js 18+ or Bun
- npm, pnpm, or bun

### Local Development

```bash
# Clone the repository
git clone <repository-url>
cd floor-plan-visualizer

# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

## Admin Portal Access (Demo Environment)

- **URL**: `/admin`
- **Username**: `admin`
- **Password**: `Admin@123`
