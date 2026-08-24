"""Train a persisted, auditable cost model from approved historical project costs."""
import sys
from pathlib import Path
import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from xgboost import XGBRegressor

REQUIRED = ["room_area", "furniture_count", "material_type", "labor_cost", "location", "project_type", "total_cost"]
ROOT = Path(__file__).parent

def score(name, estimator, x_train, x_test, y_train, y_test):
    estimator.fit(x_train, y_train)
    predicted = estimator.predict(x_test)
    return name, estimator, {"mae": round(mean_absolute_error(y_test, predicted), 2), "rmse": round(mean_squared_error(y_test, predicted) ** .5, 2), "r2": round(r2_score(y_test, predicted), 4)}

def main():
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python models/train_cost_model.py approved-project-costs.csv")
    data = pd.read_csv(sys.argv[1])
    missing = set(REQUIRED) - set(data.columns)
    if missing: raise SystemExit(f"Missing required columns: {', '.join(sorted(missing))}")
    x, y = data[REQUIRED[:-1]], data["total_cost"]
    x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=.2, random_state=42)
    numeric, categorical = ["room_area", "furniture_count", "labor_cost"], ["material_type", "location", "project_type"]
    preprocessing = ColumnTransformer([("num", SimpleImputer(strategy="median"), numeric), ("cat", Pipeline([("impute", SimpleImputer(strategy="most_frequent")), ("onehot", OneHotEncoder(handle_unknown="ignore"))]), categorical)])
    candidates = [("Linear Regression", LinearRegression()), ("Random Forest", RandomForestRegressor(n_estimators=300, random_state=42)), ("XGBoost", XGBRegressor(n_estimators=300, max_depth=4, learning_rate=.05, random_state=42))]
    results = [score(name, Pipeline([("preprocess", preprocessing), ("model", model)]), x_train, x_test, y_train, y_test) for name, model in candidates]
    name, pipeline, metrics = min(results, key=lambda result: result[2]["mae"])
    joblib.dump({"pipeline": pipeline, "model_name": name, "metrics": metrics, "training_data": {"rows": len(data), "source": str(Path(sys.argv[1]).name), "synthetic": False}}, ROOT / "cost_prediction.pkl")
    print({"selected": name, "metrics": metrics})

if __name__ == "__main__": main()
