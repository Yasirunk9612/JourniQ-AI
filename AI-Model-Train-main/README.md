# AI Model Train

This project trains and compares several machine learning models for a tourism recommendation dataset.

## Current System Build Status

This project is currently an **offline machine learning training system**. It prepares tourism data, trains models, saves trained model files, and compares model performance.

It is not yet a full web application. There is currently no API backend, no database service, and no frontend user interface.

| Area | Status | Implementation Level |
|---|---|---:|
| Data preprocessing | Implemented | 100% |
| Model training scripts | Implemented | 85% |
| Model evaluation and comparison | Implemented | 90% |
| Saved model artifacts | Implemented | 90% |
| Backend API | Not implemented | 0% |
| Database integration | Not implemented | 0% |
| Frontend UI | Not implemented | 0% |
| Deployment setup | Not implemented | 0% |

Overall, the project is strongest as a **machine learning experiment and training pipeline**. To become a complete application, it still needs a backend API and frontend interface.

## Project Structure

- `data/` — input dataset
- `src/` — preprocessing, training, and comparison scripts
- `models/` — saved models and preprocessing artifacts
- `results/` — evaluation outputs and comparison CSVs

## How the System Works

The system follows this workflow:

1. The dataset is loaded from `data/tourism_ai_master_dataset_v2_full.csv`.
2. `src/prepare_data.py` cleans and prepares the data.
3. Text features from `ml_text_features` are converted into TF-IDF vectors.
4. Numeric features such as rooms, coordinates, and tourism arrival values are scaled.
5. The processed data is split into training and testing files.
6. Classification models are trained to predict `recommendation_label`.
7. The LSTM model is trained separately for monthly tourism demand prediction.
8. Result CSV files are written into `results/`.
9. `src/compare_models.py` combines the classification results and ranks the models by F1 score.

## Implemented Backend Logic

The implemented backend logic is the ML processing pipeline inside `src/`.

Implemented scripts:

- `prepare_data.py` — loads the dataset, prepares text and numeric features, and saves train/test files.
- `train_random_forest.py` — trains and evaluates Random Forest.
- `train_knn.py` — trains and evaluates KNN.
- `train_svm.py` — trains and evaluates SVM.
- `train_adaboost.py` — trains and evaluates AdaBoost.
- `train_xgboost.py` — trains XGBoost, but currently needs the OpenMP runtime on macOS.
- `train_lstm.py` — trains an LSTM model for demand forecasting.
- `train_svm_lstm.py` — creates a placeholder SVM + LSTM hybrid score.
- `train_knn_lstm.py` — creates a placeholder KNN + LSTM hybrid score.
- `compare_models.py` — combines model result files and creates the final comparison CSV.

Not implemented yet:

- API endpoint for predictions
- Request/response backend server
- User authentication
- Admin dashboard
- Database storage
- Production deployment

## Frontend Status

No frontend has been implemented yet.

There are currently no pages, forms, dashboards, charts, or user-facing screens. The project is operated through Python scripts and CSV output files only.

Frontend features that could be added later:

- Upload tourism data
- Run model prediction from a web page
- Show recommended tourism entities
- Display model comparison charts
- Show demand forecasting graphs
- Admin panel for retraining models

## Requirements

Install Python 3.10+ and the dependencies from `requirements.txt`.

## Setup

```bash
git clone https://github.com/Yasirunk9612/AI-Model-Train.git
cd AI-Model-Train
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Data

Make sure this file exists before running the scripts:

```bash
data/tourism_ai_master_dataset_v2_full.csv
```

## Run the Project

1. Prepare the dataset:
   ```bash
   python src/prepare_data.py
   ```

2. Train the models:
   ```bash
   python src/train_random_forest.py
   python src/train_knn.py
   python src/train_svm.py
   python src/train_adaboost.py
   python src/train_xgboost.py
   python src/train_lstm.py
   python src/train_svm_lstm.py
   python src/train_knn_lstm.py
   ```

3. Compare the saved results:
   ```bash
   python src/compare_models.py
   ```

## Current Result Summary

After running the available training scripts, the strongest classification model is **SVM**.

| Model | Accuracy | Precision | Recall | F1 Score |
|---|---:|---:|---:|---:|
| SVM | 0.993252 | 0.990743 | 0.992435 | 0.991588 |
| SVM + LSTM | 0.993252 | 0.990743 | 0.992435 | 0.991588 |
| AdaBoost | 0.987287 | 0.979923 | 0.988531 | 0.984208 |
| Random Forest | 0.984843 | 0.980034 | 0.982186 | 0.981109 |
| KNN | 0.974183 | 0.968704 | 0.966813 | 0.967758 |
| KNN + LSTM | 0.974183 | 0.968704 | 0.966813 | 0.967758 |

## Recommended Model

Use **SVM** as the final recommendation model.

SVM and SVM + LSTM currently produce the same classification score. The hybrid script uses SVM probability scores plus a fixed placeholder LSTM demand contribution, so it does not improve over the base SVM model yet. Because plain SVM is simpler and gives the same top performance, it is the best practical choice.

The standalone LSTM model is trained for monthly tourism demand prediction, not direct recommendation classification. Its output is evaluated using regression metrics:

| Model | MSE | RMSE | MAE |
|---|---:|---:|---:|
| LSTM | 8709497745.653809 | 93324.689904 | 93198.281250 |

## Output Files

- `models/X_train.pkl`
- `models/X_test.pkl`
- `models/y_train.pkl`
- `models/y_test.pkl`
- `models/tfidf_vectorizer.pkl`
- `models/numeric_scaler.pkl`
- `models/numeric_columns.pkl`
- `models/*.pkl` or `models/*.keras` model files
- `results/*.csv`

## Notes

- Do not commit `.venv/`, `models/`, or `results/` to git.
- `train_svm_lstm.py` and `train_knn_lstm.py` expect the corresponding base models to already exist in `models/`.
- `compare_models.py` expects the model result CSVs to already be present in `results/`.
- `train_xgboost.py` may require the OpenMP runtime on macOS. If it fails with `libomp.dylib` missing, install OpenMP before rerunning XGBoost.
