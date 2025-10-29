import React, { useState, useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Radar } from "react-chartjs-2";
import "./RadarChart.css"; // Import responsive CSS

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, Title);

export default function RadarChart() {
  const hiddenInputRef = useRef();
  const [selectedCity, setSelectedCity] = useState("Warsaw");
  const [cityData, setCityData] = useState(null);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetch("/data/cityData.json", {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load JSON data");
        return res.json();
      })
      .then((json) => setCityData(json))
      .catch((err) => console.error("Error fetching city data:", err));
  }, []);

  useEffect(() => {
    if (cityData) {
      const labels = cityData.chartConfig[0].labels;
      const getChartDataByCity = (cityName) => {
        const cityInfo = cityData.chartData.find(
          (item) => item.city_name.toLowerCase() === cityName.toLowerCase()
        );
        if (!cityInfo) return null;
        return {
          labels,
          datasets: [
            {
              label: "Global",
              data: cityInfo.global_data,
              backgroundColor: "rgba(59,130,246,0.2)",
              borderColor: "rgba(59,130,246,1)",
              borderWidth: 2,
            },
            {
              label: cityInfo.region,
              data: cityInfo.region_data,
              backgroundColor: "rgba(34,197,94,0.2)",
              borderColor: "rgba(34,197,94,1)",
              borderWidth: 2,
            },
            {
              label: cityInfo.city_name,
              data: cityInfo.city_data,
              backgroundColor: "rgba(234,179,8,0.2)",
              borderColor: "rgba(234,179,8,1)",
              borderWidth: 2,
            },
          ],
        };
      };
      const cityName = hiddenInputRef.current?.value || selectedCity;
      const newData = getChartDataByCity(cityName);
      setChartData(newData);
    }
  }, [selectedCity, cityData]);

  if (!cityData) {
    return (
      <div className="radar-loading">
        <p className="loading-text">Loading data...</p>
      </div>
    );
  }

  return (
    <div className="radar-container">
      <input type="hidden" id="selectedCity" ref={hiddenInputRef} value={selectedCity} />

      <h2 className="radar-title">City Comparison Radar Chart</h2>

      {/* City Selector */}
      <div className="selector-container">
        <label htmlFor="citySelector" className="selector-label">
          Choose City:
        </label>
        <select
          id="citySelector"
          className="selector-input"
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
        >
          {cityData.chartData.map((city) => (
            <option key={city.id} value={city.city_name}>
              {city.city_name}
            </option>
          ))}
        </select>
      </div>

      {/* Radar Chart */}
      {chartData ? (
        <div className="chart-wrapper">
          <div className="chart-box">
            <Radar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false, // 👈 allows resizing
                animation: { duration: 1000, easing: "easeInOutQuart" },
                plugins: {
                  legend: { position: "top", labels: { color: "#fff" } },
                  title: {
                    display: true,
                    text: `${selectedCity} Performance Overview`,
                    color: "#fff",
                  },
                },
                scales: {
                  r: {
                    beginAtZero: true,
                    grid: { color: "rgba(255,255,255,0.1)" },
                    angleLines: { color: "rgba(255,255,255,0.2)" },
                    pointLabels: { color: "#fff", font: { size: 12 } },
                    ticks: {
                      backdropColor: "transparent",
                      color: "#9ca3af",
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      ) : (
        <p className="no-data-text">No data available for {selectedCity}</p>
      )}
    </div>
  );
}
