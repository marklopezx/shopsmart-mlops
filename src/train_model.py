import pandas as pd
import numpy as np
import joblib
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline

# 1. Create a mock dataset matching your 17 features exactly
print("Generating training data...")
data = {
    'Administrative': np.random.randint(0, 10, 500),
    'Administrative_Duration': np.random.uniform(0, 100, 500),
    'Informational': np.random.randint(0, 5, 500),
    'Informational_Duration': np.random.uniform(0, 50, 500),
    'ProductRelated': np.random.randint(0, 50, 500),
    'ProductRelated_Duration': np.random.uniform(0, 1000, 500),
    'BounceRates': np.random.uniform(0, 0.2, 500),
    'ExitRates': np.random.uniform(0, 0.2, 500),
    'PageValues': np.random.uniform(0, 100, 500), # High page value usually means high purchase probability
    'SpecialDay': np.random.uniform(0, 1, 500),
    'Month': np.random.choice(['Feb', 'Mar', 'May', 'June', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], 500),
    'OperatingSystems': np.random.randint(1, 8, 500),
    'Browser': np.random.randint(1, 13, 500),
    'Region': np.random.randint(1, 9, 500),
    'TrafficType': np.random.randint(1, 20, 500),
    'VisitorType': np.random.choice(['Returning_Visitor', 'New_Visitor', 'Other'], 500),
    'Weekend': np.random.choice([True, False], 500)
}

df = pd.DataFrame(data)

# Artificial logic to decide if they bought (so the model learns a pattern)
# If they look at lots of products and have high PageValues, they buy!
df['actual_revenue'] = (df['ProductRelated'] > 15) & (df['PageValues'] > 20)

X = df.drop('actual_revenue', axis=1)
y = df['actual_revenue']

# 2. Build the Preprocessing Pipeline
# Text columns need OneHotEncoding. Numeric columns need Scaling.
categorical_features = ['Month', 'VisitorType', 'Weekend']
numeric_features = [col for col in X.columns if col not in categorical_features]

preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numeric_features),
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
    ])

# 3. Create the complete Model Pipeline
model_pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
])

# 4. Train the Model
print("Training the Random Forest model...")
model_pipeline.fit(X, y)

# 5. Save the Model to the exact folder your API expects
# Make sure the 'models' directory exists
models_dir = os.path.join(os.path.dirname(__file__), 'models')
os.makedirs(models_dir, exist_ok=True)

model_path = os.path.join(models_dir, 'ecommerce_purchase_model.joblib')
joblib.dump(model_pipeline, model_path)

print(f"✅ Success! Model saved to: {model_path}")
print("Your FastAPI backend is now ready to use this live model!")