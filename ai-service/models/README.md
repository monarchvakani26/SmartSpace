# Cost-prediction model

## Train

```bash
# From ai-service/
python models/generate_synthetic_costs.py
python models/train_cost_model.py models/approved-project-costs.csv
```

Writes `cost_prediction.pkl` with the lowest-MAE candidate among Linear Regression, Random Forest, and XGBoost.

## Runtime honesty

- If `cost_prediction.pkl` **exists**, `/predict-cost` uses it and reports `model_name` + metrics.
- If **missing**, `/predict-cost` returns `model_used: heuristic-fallback` (transparent formula). The UI must not claim XGBoost until the artefact is present.

Replace the synthetic CSV with approved historical projects for a stronger FYP claim.
