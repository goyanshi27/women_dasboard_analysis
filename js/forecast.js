/**
 * India Women Safety & Justice Analytics Dashboard - Forecasting Engine
 * Models: Linear Regression, ARIMA (AutoRegressive Integrated Moving Average), Prophet-like Growth Curve
 */

(function () {
    // Helper: Least Squares Linear Regression
    function fitLinearRegression(x, y) {
        const n = x.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        for (let i = 0; i < n; i++) {
            sumX += x[i];
            sumY += y[i];
            sumXY += x[i] * y[i];
            sumXX += x[i] * x[i];
            // calculate standard error
        }
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        // Calculate residuals standard deviation for confidence intervals
        let sumResidualsSq = 0;
        for (let i = 0; i < n; i++) {
            const pred = slope * x[i] + intercept;
            sumResidualsSq += Math.pow(y[i] - pred, 2);
        }
        const stdError = Math.sqrt(sumResidualsSq / (n - 2 || 1));

        return {
            forecast: function (futureX) {
                return futureX.map(fx => slope * fx + intercept);
            },
            slope,
            intercept,
            stdError
        };
    }

    // Helper: Simplified ARIMA(1, 1, 0)
    // d_t = Y_t - Y_t-1 (Differencing)
    // d_t = c + phi * d_t-1 + e_t (Autoregression)
    function fitARIMA(y) {
        const n = y.length;
        if (n < 4) return fitLinearRegression(Array.from({length: n}, (_, i) => i), y);

        // 1. Calculate first differences
        const diffs = [];
        for (let i = 1; i < n; i++) {
            diffs.push(y[i] - y[i - 1]);
        }

        // 2. Fit AR(1) on differences: d_t = c + phi * d_t-1
        // We will regress diffs[1...end] on diffs[0...end-1]
        const xAR = diffs.slice(0, -1);
        const yAR = diffs.slice(1);
        
        const arRegression = fitLinearRegression(xAR, yAR);
        const phi = arRegression.slope;
        const drift = arRegression.intercept; // average diff drift

        // Standard error of residuals
        const stdError = arRegression.stdError;

        return {
            forecast: function (steps) {
                const predictions = [];
                let lastY = y[n - 1];
                let lastDiff = diffs[diffs.length - 1];

                for (let i = 0; i < steps; i++) {
                    // d_t = drift + phi * d_t-1
                    const nextDiff = drift + phi * lastDiff;
                    const nextY = lastY + nextDiff;
                    predictions.push(nextY);
                    
                    lastY = nextY;
                    lastDiff = nextDiff;
                }
                return predictions;
            },
            stdError: stdError * 1.5 // buffer for integration variance
        };
    }

    // Helper: Prophet-style Curve Fitting
    // Fits a logistic or piecewise growth trend + linear growth + noise estimation
    function fitProphet(x, y) {
        // Fits a quadratic/piecewise linear growth: y = a + b*x + c*x^2
        const n = x.length;
        
        // Solve simple least squares for quadratic: y = beta0 + beta1*x + beta2*x^2
        // To keep it simple and robust, fit linear trend first, then apply dampening/acceleration curves
        const lin = fitLinearRegression(x, y);
        
        // We analyze if the trend is accelerating or decelerating in the last 4 years
        const recentN = Math.min(5, n);
        const recentX = x.slice(-recentN);
        const recentY = y.slice(-recentN);
        const recentLin = fitLinearRegression(recentX, recentY);

        // Blend the global trend and the local recent trend
        const globalSlope = lin.slope;
        const localSlope = recentLin.slope;
        
        // Dampening coefficient: standard Prophet uses piecewise changepoints
        // We simulate this by gradually transitioning from local slope to global average slope
        return {
            forecast: function (futureX) {
                const predictions = [];
                const lastY = y[n - 1];
                const lastX = x[n - 1];

                for (let i = 0; i < futureX.length; i++) {
                    const fx = futureX[i];
                    const steps = fx - lastX;
                    
                    // Blend slope over time (more weight on global slope as we go further out)
                    const weight = Math.exp(-steps / 4); // decays from 1 to 0
                    const blendedSlope = localSlope * weight + globalSlope * (1 - weight);
                    
                    const pred = lastY + blendedSlope * steps;
                    predictions.push(pred);
                }
                return predictions;
            },
            stdError: lin.stdError * 1.2
        };
    }

    // Main Forecasting API
    window.DashboardForecast = {
        /**
         * Generates a forecast for a given historical dataset.
         * @param {Array} history - Array of numbers (2014-2025 values)
         * @param {String} modelType - 'regression', 'arima', 'prophet'
         * @param {Number} startYear - Default 2014
         * @returns {Object} { years: [2026..2030], forecast: [...], lowerCI: [...], upperCI: [...] }
         */
        generateForecast: function (history, modelType = 'prophet', startYear = 2014) {
            const historyLen = history.length;
            const years = Array.from({length: historyLen}, (_, i) => startYear + i);
            const futureYears = [2026, 2027, 2028, 2029, 2030];
            
            const xHist = Array.from({length: historyLen}, (_, i) => i);
            const xFuture = Array.from({length: 5}, (_, i) => historyLen + i);

            let predictions = [];
            let stdError = 0;

            if (modelType === 'regression') {
                const model = fitLinearRegression(xHist, history);
                predictions = model.forecast(xFuture);
                stdError = model.stdError;
            } else if (modelType === 'arima') {
                const model = fitARIMA(history);
                predictions = model.forecast(5);
                stdError = model.stdError;
            } else { // prophet (default)
                const model = fitProphet(xHist, history);
                predictions = model.forecast(xFuture);
                stdError = model.stdError;
            }

            // Generate Confidence Intervals (95% CI)
            // CI expands as we go further into the future (proportional to sqrt of step count)
            const lowerCI = [];
            const upperCI = [];

            predictions.forEach((val, idx) => {
                const step = idx + 1;
                // standard error expansion
                const interval = 1.96 * stdError * Math.sqrt(step);
                
                // Ensure values do not drop below 0
                lowerCI.push(Math.max(0, Math.round(val - interval)));
                upperCI.push(Math.max(0, Math.round(val + interval)));
                predictions[idx] = Math.max(0, Math.round(val));
            });

            return {
                historyYears: years,
                historyValues: history,
                futureYears,
                predictions,
                lowerCI,
                upperCI
            };
        }
    };
})();
