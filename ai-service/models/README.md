# Cost-prediction model

`train_cost_model.py` trains and persists `cost_prediction.pkl`. It expects a CSV with the columns `room_area`, `furniture_count`, `material_type`, `labor_cost`, `location`, `project_type`, and `total_cost`.

Run `python models/train_cost_model.py path/to/approved-project-costs.csv`. The API deliberately returns `model_not_configured` until this artefact exists; it never substitutes a formula or claims an accuracy that has not been measured.
