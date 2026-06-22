/*
|--------------------------------------------------------------------------
| Forecast Domain Types
|--------------------------------------------------------------------------
|
| Forecasting engine responses.
|
*/

export interface ForecastResponse {
  projectedSpend: number;
  variance: number;
  confidence: number;
  daysRemaining: number;
}
