# AI Interior Planner 🏠✨

> An AI-assisted enterprise platform for **interior design firms and designers** that combines a parametric drag-and-drop 2D/3D room design studio with an end-to-end business workflow: **Lead → Client → Project → Room Design → Customization → Parametric Costing → Quotation PDF → Orders → Inventory → Delivery**.

---

## 🌟 Key Features

1. **Split-Screen Authentication**: Secure login with Role-Based Access Control (Admin, Designer, Sales Executive, Estimator).
2. **Executive Studio Dashboard**: 4 KPI stat cards (Total Leads, Active Projects, Total Orders, Revenue), Recent Projects table, and dynamic Tasks checklist.
3. **Leads & CRM Pipeline**: Comprehensive client enquiry tracking with status indicators (New, Contacted, Interested, Not Interested).
4. **Parametric Room Wizard**:
   - Step 1: Project Metadata & Client assignment
   - Step 2: Spatial Dimensions (Length, Width, Height in feet) with **Live Isometric 3D Room Outline** and edge measurement badges.
5. **Interactive 2D Drag-and-Drop Design Studio**:
   - Canvas drawn to scale with dynamic dimension edge labels.
   - Categorized furniture palette: Beds, Wardrobes, Sofas, Tables, Doors, Windows, Decor.
   - Select, Move, 45° Rotate, Delete, Undo/Redo history stack, Zoom controls, and 3D view toggle.
   - Central canonical layout state synchronizer.
6. **Detailed Item Customization Studio**:
   - Material selector (Plywood 18mm, Blockboard, Solid Teak)
   - Finish / Laminate selector (Sunmica Walnut, Acrylic Gloss, Matte)
   - Interactive color swatches
   - Handles & Hardware dropdown
   - Internal organizer setup & Soft-close dampening toggle switch
   - Real-time product render preview.
7. **Parametric Pricing & Costing Engine**:
   - Auto-computed cost breakdown: Items Total, Material Customization, Labor Charges, Transport, Contingency, Subtotal, GST 18%, and Final Total.
   - Configurable commercial settings: Profit Margin %, Discount %, Contingency %.
8. **Client-Ready Quotation Document & Instant PDF**:
   - Formal quotation card with billing, project specs, and itemized breakdown.
   - Instant client PDF download via `jsPDF`.
   - "Send to Client" dispatch.
9. **Orders & Inventory Management**: Live stock levels, sheet counts, and order tracking.
10. **Reports & Financial Analytics**: Recharts weekly revenue area chart and project status donut chart.
11. **Defensible AI/ML Service (FastAPI)**:
    - Constraint/Rules-Based Recommendation Engine
    - XGBoost Cost Prediction Regressor
    - Heuristic Collision & Clearance Layout Optimizer

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Zustand, Recharts, jsPDF, Lucide Icons, React Hot Toast
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, JWT, RBAC
- **AI Service**: Python 3.11, FastAPI, Pydantic, Scikit-learn
- **Database**: PostgreSQL (Prisma) / Seamless Persistent In-Memory Fallback
- **Infra**: Docker & Docker Compose

---

## 🚀 Quick Start (Running Locally)

### Option 1: Quick Run Frontend (Instant UI Demo)

```bash
cd frontend
npm run dev
```
Open **`http://localhost:5173`** in your browser!

### Option 2: Run Backend & AI Service

```bash
# Start Backend
cd backend
npm run dev

# Start AI Service (in another terminal)
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Option 3: Full Stack with Docker Compose

```bash
docker-compose up --build
```

---

## 🔑 Default Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@aiinteriorplanner.com` | `admin123` |
| **Designer** | `designer@aiinteriorplanner.com` | `designer123` |
| **Sales Exec** | `sales@aiinteriorplanner.com` | `sales123` |
| **Estimator** | `estimator@aiinteriorplanner.com` | `estimator123` |

---

## 📂 Project Structure

```
ai-interior-planner/
├── frontend/             # React 18 + Vite + Tailwind CSS app
│   ├── src/
│   │   ├── components/   # Sidebar, AppLayout, etc.
│   │   ├── pages/        # All 12 Reference Portal Screens
│   │   ├── services/     # API Client & Mock DB
│   │   ├── stores/       # Zustand Auth & Layout Stores
│   │   └── types/        # TypeScript Interfaces
├── backend/              # Express + TypeScript + Prisma API
│   ├── prisma/           # schema.prisma & seed.ts (20+ tables)
│   └── src/              # Routes, Middleware, Costing Service
├── ai-service/           # FastAPI AI/ML service
│   └── main:app          # Recommendation, Cost Prediction, Layout Optimizer
└── docker-compose.yml    # Full stack container configuration
```
