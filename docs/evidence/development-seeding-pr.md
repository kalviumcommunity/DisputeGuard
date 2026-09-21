# Development Database Seeding

## Overview

This document describes the development database seeding implementation for DisputeGuard.

The seed provides repeatable local development data while preserving existing developer changes and avoiding duplicate records across repeated runs.

## Seed Data

The development seed creates:

- Two merchants
- Three related disputes
- Relationships between merchants and their disputes

The seed uses transactional upserts based on merchant email addresses and dispute references.

## Running the Seed

Run the following commands from the `frontend` directory:

```bash
pnpm prisma generate
pnpm prisma db seed