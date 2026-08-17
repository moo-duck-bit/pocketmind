import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { getGoal } from "../localstorage/user";

// 필요한 컴포넌트와 스케일 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DiaryChart = (chartData) => {
  console.log(chartData.labels);
  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: getGoal(),
        data: [5, 7, 9, 6, 8],
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "일기 작성 척도",
      },
    },
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto" }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default DiaryChart;
