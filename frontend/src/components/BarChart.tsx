import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";
import UserData from "../Data";

//can omit options
const options = {
  responsive: true,
  plugins: {
    legend: {
      // display: false,
      position: "bottom", //default is top
    },
    title: {
      display: true,
      text: "Bar Chart for orders",
    },
  },
};

function BarChart({ chartData }: { [key: string]: number }) {
  //charts data
  const [userData, setUserData] = useState({
    labels: UserData.map((data) => data.year),
    datasets: [
      {
        label: "User gained",
        data: UserData.map((data) => data.userGain),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        // borderColor: "black",
        borderWidth: 1,
      },
      {
        label: "User Lost",
        data: UserData.map((data) => data.userLost),
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        // borderColor: "black",
        borderWidth: 1,
      },
    ],
  });
  //@ts-ignore
  return <Bar data={userData} options={options} />;
}

export default BarChart;
