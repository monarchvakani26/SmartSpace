"""Generate a synthetic but structured cost CSV for local model training / FYP demos."""
import csv
import random
from pathlib import Path

ROOT = Path(__file__).parent
OUT = ROOT / "approved-project-costs.csv"

ROOM_TYPES = ["BEDROOM", "LIVING_ROOM", "KITCHEN", "OFFICE", "FULL_HOME"]
MATERIALS = ["ECONOMY", "STANDARD", "LUXURY"]
CITIES = ["Mumbai", "Pune", "Bangalore", "Delhi", "Hyderabad"]

random.seed(42)
rows = []
for i in range(120):
    room = random.choice(ROOM_TYPES)
    material = random.choice(MATERIALS)
    city = random.choice(CITIES)
    area = round(random.uniform(80, 320), 1)
    furniture_count = random.randint(3, 14)
    labor = round(8000 + area * random.uniform(40, 90), 0)
    tier = {"ECONOMY": 0.78, "STANDARD": 1.0, "LUXURY": 1.42}[material]
    city_mul = {"Mumbai": 1.12, "Pune": 1.0, "Bangalore": 1.08, "Delhi": 1.05, "Hyderabad": 0.95}[city]
    base = area * 920 * tier * city_mul + furniture_count * 17500 + labor
    noise = random.uniform(0.92, 1.08)
    total = round(base * noise, 0)
    rows.append(
        {
            "room_area": area,
            "furniture_count": furniture_count,
            "material_type": material,
            "labor_cost": labor,
            "location": city,
            "project_type": room,
            "total_cost": total,
        }
    )

with OUT.open("w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
    writer.writeheader()
    writer.writerows(rows)

print(f"Wrote {len(rows)} rows to {OUT}")
